import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const year  = parseInt(searchParams.get('year')  ?? String(new Date().getFullYear()));
    const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1));

    // Get deliveries for this month
    const deliveries = await pool.query(
      `SELECT dd.*, NULL as delivery_person_name
       FROM daily_deliveries dd
       WHERE dd.client_id = $1
         AND EXTRACT(YEAR  FROM dd.date) = $2
         AND EXTRACT(MONTH FROM dd.date) = $3
       ORDER BY dd.date DESC, dd.meal_type`,
      [session.id, year, month]
    );

    // Get payment summary for this month
    const payment = await pool.query(
      `SELECT p.*, s.amount as sub_amount
       FROM payments p
       LEFT JOIN subscriptions s ON p.subscription_id = s.id
       WHERE p.client_id = $1 AND p.year = $2 AND p.month = $3
       LIMIT 1`,
      [session.id, year, month]
    );

    // Get skip requests for this month
    const skips = await pool.query(
      `SELECT * FROM skip_requests
       WHERE client_id = $1
         AND EXTRACT(YEAR  FROM date) = $2
         AND EXTRACT(MONTH FROM date) = $3`,
      [session.id, year, month]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        deliveries: deliveries.rows,
        payment:    payment.rows[0] ?? null,
        skips:      skips.rows,
      },
    });
  } catch (err) {
    console.error('[client/history]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
