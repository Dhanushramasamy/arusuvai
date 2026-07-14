import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const VALID_TYPES = ['veg', 'non_veg'];
const VALID_MEALS = ['Lunch', 'Dinner'];

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, menu_type, day_of_week, meal_type, items, updated_at
       FROM weekly_menu
       ORDER BY menu_type,
         CASE day_of_week
           WHEN 'Monday'    THEN 1
           WHEN 'Tuesday'   THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday'  THEN 4
           WHEN 'Friday'    THEN 5
           WHEN 'Saturday'  THEN 6
         END,
         CASE meal_type WHEN 'Lunch' THEN 1 ELSE 2 END`
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[admin/weekly-menu GET]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { menu_type, day_of_week, meal_type, items } = await req.json();

    if (!VALID_TYPES.includes(menu_type)) {
      return NextResponse.json({ success: false, error: 'Invalid menu_type' }, { status: 400 });
    }
    if (!DAYS_ORDER.includes(day_of_week)) {
      return NextResponse.json({ success: false, error: 'Invalid day_of_week' }, { status: 400 });
    }
    if (!VALID_MEALS.includes(meal_type)) {
      return NextResponse.json({ success: false, error: 'Invalid meal_type' }, { status: 400 });
    }
    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'items must be an array' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO weekly_menu (menu_type, day_of_week, meal_type, items, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (menu_type, day_of_week, meal_type)
       DO UPDATE SET items = EXCLUDED.items, updated_at = NOW()`,
      [menu_type, day_of_week, meal_type, items]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/weekly-menu PUT]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
