import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import pool from '@/lib/db';
import { todayIST } from '@/lib/dateUtils';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? todayIST();

    const db = await pool.connect();
    try {
      await db.query('BEGIN');

      // Get all active clients with valid subscription for this date
      const clients = await db.query(
        `SELECT u.id, u.name, s.subscribe_breakfast, s.subscribe_lunch, s.subscribe_dinner
         FROM users u
         JOIN subscriptions s ON s.client_id = u.id
         WHERE u.role = 'client'
           AND u.is_active = true
           AND s.start_date <= $1
           AND s.end_date >= $1
           AND s.status = 'active'`,
        [date]
      );

      // Create set of active client_id + meal_type pairs
      const activePairs: { client_id: string; meal_type: string }[] = [];
      for (const c of clients.rows) {
        if (c.subscribe_breakfast === true) {
          activePairs.push({ client_id: c.id, meal_type: 'Breakfast' });
        }
        if (c.subscribe_lunch !== false) {
          activePairs.push({ client_id: c.id, meal_type: 'Lunch' });
        }
        if (c.subscribe_dinner !== false) {
          activePairs.push({ client_id: c.id, meal_type: 'Dinner' });
        }
      }

      // 1. Insert missing active deliveries
      for (const pair of activePairs) {
        // Check for approved skip
        const skip = await db.query(
          `SELECT id FROM skip_requests
           WHERE client_id = $1 AND date = $2 AND meal_type = $3 AND status = 'approved'`,
          [pair.client_id, date, pair.meal_type]
        );

        const status = skip.rows.length > 0 ? 'skipped' : 'pending';
        const skipId = skip.rows[0]?.id ?? null;
        const id = `del_${randomUUID().replace(/-/g, '').slice(0, 12)}`;

        await db.query(
          `INSERT INTO daily_deliveries
             (id, client_id, date, meal_type, status, skip_request_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (client_id, date, meal_type) DO NOTHING`,
          [id, pair.client_id, date, pair.meal_type, status, skipId]
        );
      }

      // 2. Remove invalid deliveries (if they are pending, assigned, or skipped, but no longer active/subscribed)
      const existing = await db.query(
        `SELECT id, client_id, meal_type FROM daily_deliveries
         WHERE date = $1 AND status IN ('pending', 'assigned', 'skipped')`,
        [date]
      );

      for (const row of existing.rows) {
        const stillActive = activePairs.some(
          (p) => p.client_id === row.client_id && p.meal_type === row.meal_type
        );
        if (!stillActive) {
          await db.query(`DELETE FROM daily_deliveries WHERE id = $1`, [row.id]);
        }
      }

      await db.query('COMMIT');
    } catch (e) {
      await db.query('ROLLBACK');
      throw e;
    } finally {
      db.release();
    }

    // Now query and return the list
    const deliveries = await pool.query(
      `SELECT dd.*,
              u.name as client_name,
              u.phone_number,
              u.location,
              u.delivery_note as delivery_note_client,
              dp.name as delivery_person_name,
              sr.status as skip_status,
              sr.id as skip_req_id
       FROM daily_deliveries dd
       JOIN users u ON u.id = dd.client_id
       LEFT JOIN users dp ON dp.id = dd.delivery_person_id
       LEFT JOIN skip_requests sr ON sr.client_id = dd.client_id
         AND sr.date = dd.date AND sr.meal_type = dd.meal_type AND sr.status = 'pending'
       WHERE dd.date = $1
       ORDER BY u.location, u.name, dd.meal_type`,
      [date]
    );

    return NextResponse.json<ApiResponse>({ success: true, data: deliveries.rows });
  } catch (err) {
    console.error('[admin/today GET]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
