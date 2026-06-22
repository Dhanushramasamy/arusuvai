import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { client_id, date, meal_type } = await req.json();

    const db = await pool.connect();
    try {
      await db.query('BEGIN');

      // Remove the skip request if admin-initiated
      await db.query(
        `DELETE FROM skip_requests
         WHERE client_id = $1 AND date = $2 AND meal_type = $3 AND is_admin_initiated = true`,
        [client_id, date, meal_type]
      );

      // Restore delivery to pending
      await db.query(
        `UPDATE daily_deliveries
         SET status = 'pending', skip_request_id = NULL
         WHERE client_id = $1 AND date = $2 AND meal_type = $3`,
        [client_id, date, meal_type]
      );

      await db.query('COMMIT');
      return NextResponse.json<ApiResponse>({ success: true });
    } catch (e) {
      await db.query('ROLLBACK');
      throw e;
    } finally {
      db.release();
    }
  } catch (err) {
    console.error('[admin/restore-delivery]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
