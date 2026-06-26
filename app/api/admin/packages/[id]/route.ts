import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';
import type { ApiResponse } from '@/types';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await pool.query(
      `DELETE FROM subscription_packages WHERE id = $1`,
      [id]
    );

    return NextResponse.json<ApiResponse>({ success: true });
  } catch (err) {
    console.error('[admin/packages DELETE]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, days, meal_type, diet_type, price } = await req.json();

    if (!name || !days || !meal_type || !diet_type || price === undefined) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE subscription_packages
       SET name = $1, days = $2, meal_type = $3, diet_type = $4, price = $5
       WHERE id = $6`,
      [name, parseInt(days), meal_type, diet_type, parseFloat(price), id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({ success: true });
  } catch (err) {
    console.error('[admin/packages PATCH]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}

