import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT * FROM location_fares ORDER BY location`
    );
    return NextResponse.json<ApiResponse>({ success: true, data: result.rows });
  } catch (err) {
    console.error('[admin/pricing GET]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { location, charge } = await req.json();

    if (!location || charge == null) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'location and charge are required' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO location_fares (location, charge, effective_from)
       VALUES ($1, $2, CURRENT_DATE)
       ON CONFLICT (location) DO UPDATE SET charge = $2, effective_from = CURRENT_DATE
       RETURNING *`,
      [location, charge]
    );

    return NextResponse.json<ApiResponse>({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[admin/pricing PUT]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
