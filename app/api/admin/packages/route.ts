import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT * FROM subscription_packages ORDER BY created_at DESC`
    );

    return NextResponse.json<ApiResponse>({ success: true, data: result.rows });
  } catch (err) {
    console.error('[admin/packages GET]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, days, meal_type, diet_type, price } = await req.json();

    if (!name || !days || !meal_type || !diet_type || price === undefined) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const id = `pkg_${Math.random().toString(36).substr(2, 9)}`;

    await pool.query(
      `INSERT INTO subscription_packages (id, name, days, meal_type, diet_type, price)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, name, parseInt(days), meal_type, diet_type, parseFloat(price)]
    );

    return NextResponse.json<ApiResponse>({ success: true, data: { id } }, { status: 201 });
  } catch (err) {
    console.error('[admin/packages POST]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
