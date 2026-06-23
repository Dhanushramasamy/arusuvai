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
