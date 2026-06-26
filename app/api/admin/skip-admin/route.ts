import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { client_id } = body;

    if (!client_id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'client_id is required' }, { status: 400 });
    }

    const db = await pool.connect();
    try {
      await db.query('BEGIN');

      if (body.start_date && body.end_date) {
        // Range bulk skip mode
        const { start_date, end_date, meal_types } = body;
        if (!start_date || !end_date || !meal_types || !Array.isArray(meal_types) || meal_types.length === 0) {
          await db.query('ROLLBACK');
          return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid range inputs' }, { status: 400 });
        }

        const current = new Date(start_date + 'T12:00:00');
        const end = new Date(end_date + 'T12:00:00');

        while (current <= end) {
          if (current.getDay() !== 0) { // Exclude Sunday
            const dateStr = current.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

            for (const meal_type of meal_types) {
              const skipId = `skip_${randomUUID().replace(/-/g, '').slice(0, 12)}`;

              await db.query(
                `INSERT INTO skip_requests (id, client_id, date, meal_type, status, is_admin_initiated, requested_by, approved_by, approved_at)
                 VALUES ($1, $2, $3, $4, 'approved', true, $5, $5, NOW())
                 ON CONFLICT (client_id, date, meal_type) DO UPDATE SET status = 'approved', approved_by = $5, approved_at = NOW()`,
                [skipId, client_id, dateStr, meal_type, session.id]
              );

              const skip = await db.query(
                `SELECT id FROM skip_requests WHERE client_id = $1 AND date = $2 AND meal_type = $3`,
                [client_id, dateStr, meal_type]
              );

              await db.query(
                `UPDATE daily_deliveries
                 SET status = 'skipped', skip_request_id = $1
                 WHERE client_id = $2 AND date = $3 AND meal_type = $4`,
                [skip.rows[0].id, client_id, dateStr, meal_type]
              );
            }
          }
          current.setDate(current.getDate() + 1);
        }
      } else {
        // Single date skip mode
        const { date, meal_type } = body;
        if (!date || !meal_type) {
          await db.query('ROLLBACK');
          return NextResponse.json<ApiResponse>({ success: false, error: 'date and meal_type are required' }, { status: 400 });
        }

        const skipId = `skip_${randomUUID().replace(/-/g, '').slice(0, 12)}`;

        await db.query(
          `INSERT INTO skip_requests (id, client_id, date, meal_type, status, is_admin_initiated, requested_by, approved_by, approved_at)
           VALUES ($1, $2, $3, $4, 'approved', true, $5, $5, NOW())
           ON CONFLICT (client_id, date, meal_type) DO UPDATE SET status = 'approved', approved_by = $5, approved_at = NOW()`,
          [skipId, client_id, date, meal_type, session.id]
        );

        const skip = await db.query(
          `SELECT id FROM skip_requests WHERE client_id = $1 AND date = $2 AND meal_type = $3`,
          [client_id, date, meal_type]
        );

        await db.query(
          `UPDATE daily_deliveries
           SET status = 'skipped', skip_request_id = $1
           WHERE client_id = $2 AND date = $3 AND meal_type = $4`,
          [skip.rows[0].id, client_id, date, meal_type]
        );
      }

      await db.query('COMMIT');
      return NextResponse.json<ApiResponse>({ success: true });
    } catch (e) {
      await db.query('ROLLBACK');
      throw e;
    } finally {
      db.release();
    }
  } catch (err) {
    console.error('[admin/skip-admin]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
