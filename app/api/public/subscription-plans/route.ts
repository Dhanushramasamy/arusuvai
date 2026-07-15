import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT 
         id,
         name AS plan_name,
         CASE 
           WHEN meal_type = 'Dinner' THEN 'dinner'
           WHEN diet_type = 'Non-Veg' THEN 'non_veg'
           ELSE 'veg'
         END AS plan_type,
         price,
         days AS duration_days,
         features,
         whatsapp_number
       FROM subscription_packages
       WHERE is_public = true
       ORDER BY sort_order ASC, created_at DESC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[public/subscription-plans GET]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
