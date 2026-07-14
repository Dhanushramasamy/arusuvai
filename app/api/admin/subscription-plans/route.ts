import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, plan_name, plan_type, price, duration_days, features, whatsapp_number, is_active, sort_order
       FROM subscription_plans
       ORDER BY sort_order ASC`
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[admin/subscription-plans GET]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan_name, plan_type, price, duration_days, features, whatsapp_number, is_active } = body;

    if (!plan_name || !plan_type || price === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO subscription_plans 
         (plan_name, plan_type, price, duration_days, features, whatsapp_number, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM subscription_plans))
       RETURNING *`,
      [
        plan_name,
        plan_type,
        price,
        duration_days ?? 26,
        features ?? [],
        whatsapp_number ?? '',
        is_active ?? true,
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[admin/subscription-plans POST]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
