import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });

    const result = await pool.query(
      `SELECT * FROM skip_requests
       WHERE client_id = $1
       ORDER BY date DESC, requested_at DESC`,
      [session.id]
    );

    return NextResponse.json<ApiResponse>({ success: true, data: result.rows });
  } catch (err) {
    console.error('[client/skip-requests GET]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { date, meal_type } = await req.json();

    if (!date || !meal_type) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'date and meal_type are required' }, { status: 400 });
    }
    if (!['Breakfast', 'Lunch', 'Dinner'].includes(meal_type)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid meal_type' }, { status: 400 });
    }

    // Validate subscription range
    const subRes = await pool.query(
      `SELECT start_date, end_date FROM subscriptions
       WHERE client_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [session.id]
    );

    if (subRes.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No active subscription found. You cannot skip meals without an active subscription.' },
        { status: 400 }
      );
    }

    const { start_date, end_date } = subRes.rows[0];
    
    // Parse dates to check range
    // Formatted dates as YYYY-MM-DD to avoid timezone shifting
    const startStr = typeof start_date === 'string' ? start_date.slice(0, 10) : new Date(start_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const endStr = typeof end_date === 'string' ? end_date.slice(0, 10) : new Date(end_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    
    if (date < startStr || date > endStr) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Selected date falls outside your active subscription period (${startStr} to ${endStr})` },
        { status: 400 }
      );
    }

    const targetDate = new Date(date + 'T00:00:00');
    if (targetDate.getDay() === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Sundays are not service days.' },
        { status: 400 }
      );
    }

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    if (date === today) {
      const now = new Date();
      const istTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
      const [hour, minute] = istTimeStr.split(':').map(Number);
      const timeInMinutes = hour * 60 + minute;

      if (meal_type === 'Breakfast' && timeInMinutes >= 6 * 60) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Breakfast skips for today must be requested before 6:00 AM.' },
          { status: 400 }
        );
      }
      if (meal_type === 'Lunch' && timeInMinutes >= 8 * 60) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Lunch skips for today must be requested before 8:00 AM.' },
          { status: 400 }
        );
      }
      if (meal_type === 'Dinner' && timeInMinutes >= 15 * 60) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Dinner skips for today must be requested before 3:00 PM.' },
          { status: 400 }
        );
      }
    }

    // Check if a skip already exists
    const existing = await pool.query(
      `SELECT id, status FROM skip_requests
       WHERE client_id = $1 AND date = $2 AND meal_type = $3`,
      [session.id, date, meal_type]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Skip already exists with status: ${existing.rows[0].status}` },
        { status: 409 }
      );
    }

    const id = `skip_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const result = await pool.query(
      `INSERT INTO skip_requests (id, client_id, date, meal_type, status, requested_by)
       VALUES ($1, $2, $3, $4, 'pending', $5)
       RETURNING *`,
      [id, session.id, date, meal_type, session.id]
    );

    return NextResponse.json<ApiResponse>({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[client/skip-requests POST]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
