import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid plan ID' }, { status: 400 });
    }

    const body = await req.json();
    const { plan_name, price, duration_days, features, whatsapp_number, is_active } = body;

    // Build SET clause dynamically based on provided fields
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (plan_name !== undefined)       { sets.push(`plan_name = $${idx++}`);       values.push(plan_name); }
    if (price !== undefined)           { sets.push(`price = $${idx++}`);           values.push(price); }
    if (duration_days !== undefined)   { sets.push(`duration_days = $${idx++}`);   values.push(duration_days); }
    if (features !== undefined)        { sets.push(`features = $${idx++}`);        values.push(features); }
    if (whatsapp_number !== undefined) { sets.push(`whatsapp_number = $${idx++}`); values.push(whatsapp_number); }
    if (is_active !== undefined)       { sets.push(`is_active = $${idx++}`);       values.push(is_active); }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    sets.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE subscription_plans SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[admin/subscription-plans PATCH]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid plan ID' }, { status: 400 });
    }

    const result = await pool.query(
      `DELETE FROM subscription_plans WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/subscription-plans DELETE]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
