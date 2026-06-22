import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function POST() {
  try {
    const result = await pool.query(
      `UPDATE subscriptions
       SET status = 'expired'
       WHERE end_date < CURRENT_DATE AND status = 'active'
       RETURNING id`
    );
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { expired_count: result.rowCount },
    });
  } catch (err) {
    console.error('[cron/expire-subscriptions]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
