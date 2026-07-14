import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, plan_name, plan_type, price, duration_days, features, whatsapp_number, is_active, sort_order
       FROM subscription_plans
       WHERE is_active = true
       ORDER BY sort_order ASC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[public/subscription-plans GET]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
