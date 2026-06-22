import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { client_id, date, meal_type } = await req.json();

    const db = await pool.connect();
    try {
      await db.query('BEGIN');

      const skipId = `skip_${randomUUID().replace(/-/g, '').slice(0, 12)}`;

      await db.query(
        `INSERT INTO skip_requests (id, client_id, date, meal_type, status, is_admin_initiated, requested_by, approved_by, approved_at)
         VALUES ($1, $2, $3, $4, 'approved', true, $5, $5, NOW())
         ON CONFLICT (client_id, date, meal_type) DO UPDATE SET status = 'approved', approved_by = $5, approved_at = NOW()`,
        [skipId, client_id, date, meal_type, session.id]
      );

      // Get the actual skip id (may have been the existing one)
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
