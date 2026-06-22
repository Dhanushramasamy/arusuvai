import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';
import type { ApiResponse } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const db = await pool.connect();
    try {
      await db.query('BEGIN');

      // Update skip request
      const updated = await db.query(
        `UPDATE skip_requests
         SET status = $1, approved_at = NOW(), approved_by = $2
         WHERE id = $3
         RETURNING *`,
        [status, session.id, id]
      );

      if (updated.rows.length === 0) {
        await db.query('ROLLBACK');
        return NextResponse.json<ApiResponse>({ success: false, error: 'Skip request not found' }, { status: 404 });
      }

      const skip = updated.rows[0];

      // If approved, update the corresponding delivery to skipped
      if (status === 'approved') {
        await db.query(
          `UPDATE daily_deliveries
           SET status = 'skipped', skip_request_id = $1
           WHERE client_id = $2 AND date = $3 AND meal_type = $4`,
          [id, skip.client_id, skip.date, skip.meal_type]
        );
      }

      // If rejected, restore delivery to pending (if it was skipped due to this request)
      if (status === 'rejected') {
        await db.query(
          `UPDATE daily_deliveries
           SET status = 'pending', skip_request_id = NULL
           WHERE client_id = $1 AND date = $2 AND meal_type = $3 AND skip_request_id = $4`,
          [skip.client_id, skip.date, skip.meal_type, id]
        );
      }

      await db.query('COMMIT');
      return NextResponse.json<ApiResponse>({ success: true, data: skip });
    } catch (e) {
      await db.query('ROLLBACK');
      throw e;
    } finally {
      db.release();
    }
  } catch (err) {
    console.error('[admin/skip-requests/[id]]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
