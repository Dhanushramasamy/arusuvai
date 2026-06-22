import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, phone_number, username, password } = body;

    const updates: string[] = [];
    const values: any[] = [id];
    let placeholderIdx = 2;

    if (name !== undefined) {
      updates.push(`name = $${placeholderIdx++}`);
      values.push(name);
    }
    if (phone_number !== undefined) {
      updates.push(`phone_number = $${placeholderIdx++}`);
      values.push(phone_number);
    }
    if (username !== undefined) {
      updates.push(`username = $${placeholderIdx++}`);
      values.push(username);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${placeholderIdx++}`);
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $1 AND role = 'delivery_person' RETURNING id`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Delivery person not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({ success: true });
  } catch (err: unknown) {
    console.error('[admin/delivery-persons/[id] PATCH]', err);
    if ((err as { code?: string }).code === '23505') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Username already exists' }, { status: 409 });
    }
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await pool.query(
      `DELETE FROM users WHERE id = $1 AND role = 'delivery_person'`,
      [id]
    );
    return NextResponse.json<ApiResponse>({ success: true });
  } catch (err) {
    console.error('[admin/delivery-persons/[id] DELETE]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
