import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';
import { todayIST } from '@/lib/dateUtils';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    const today = todayIST();
    const result = await pool.query(
      `SELECT u.*,
         COUNT(dd.id) FILTER (WHERE dd.date = $1 AND dd.status = 'delivered') as delivered_today
       FROM users u
       LEFT JOIN daily_deliveries dd ON dd.delivery_person_id = u.id
       WHERE u.role = 'delivery_person'
       GROUP BY u.id
       ORDER BY u.name`,
      [today]
    );

    return NextResponse.json<ApiResponse>({ success: true, data: result.rows });
  } catch (err) {
    console.error('[admin/delivery-persons GET]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { name, phone_number, username, password } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'name, username, and password are required' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `dp_${randomUUID().replace(/-/g, '').slice(0, 10)}`;

    await pool.query(
      `INSERT INTO users (id, name, phone_number, role, username, password_hash, created_by)
       VALUES ($1, $2, $3, 'delivery_person', $4, $5, $6)`,
      [userId, name, phone_number ?? '', username, passwordHash, session.id]
    );

    return NextResponse.json<ApiResponse>({ success: true, data: { id: userId } }, { status: 201 });
  } catch (err: unknown) {
    console.error('[admin/delivery-persons POST]', err);
    if ((err as { code?: string }).code === '23505') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Username already exists' }, { status: 409 });
    }
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
