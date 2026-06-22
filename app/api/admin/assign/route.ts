import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { delivery_ids, delivery_person_id } = await req.json();

    if (!Array.isArray(delivery_ids) || delivery_ids.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'delivery_ids must be a non-empty array' }, { status: 400 });
    }

    // Build parameterized query for bulk update
    const placeholders = delivery_ids.map((_, i) => `$${i + 2}`).join(', ');
    await pool.query(
      `UPDATE daily_deliveries
       SET delivery_person_id = $1, status = 'assigned', assigned_at = NOW()
       WHERE id IN (${placeholders})`,
      [delivery_person_id, ...delivery_ids]
    );

    return NextResponse.json<ApiResponse>({ success: true });
  } catch (err) {
    console.error('[admin/assign]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
