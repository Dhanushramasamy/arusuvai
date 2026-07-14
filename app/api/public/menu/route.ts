import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (!type || !['veg', 'non_veg'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid menu type. Use veg or non_veg.' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT id, menu_type, day_of_week, meal_type, items, updated_at
       FROM weekly_menu
       WHERE menu_type = $1
       ORDER BY
         CASE day_of_week
           WHEN 'Monday'    THEN 1
           WHEN 'Tuesday'   THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday'  THEN 4
           WHEN 'Friday'    THEN 5
           WHEN 'Saturday'  THEN 6
         END,
         CASE meal_type WHEN 'Lunch' THEN 1 ELSE 2 END`,
      [type]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[public/menu GET]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
