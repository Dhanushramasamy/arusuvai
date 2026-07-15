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
    const { name, days, meal_type, diet_type, price, is_public = false, features = [], whatsapp_number = '', sort_order = 0 } = await req.json();

    if (!name || !days || !meal_type || !diet_type || price === undefined) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE subscription_packages
       SET name = $1, days = $2, meal_type = $3, diet_type = $4, price = $5, is_public = $7, features = $8, whatsapp_number = $9, sort_order = $10
       WHERE id = $6`,
      [name, parseInt(days), meal_type, diet_type, parseFloat(price), id, is_public, JSON.stringify(features), whatsapp_number, sort_order]
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

