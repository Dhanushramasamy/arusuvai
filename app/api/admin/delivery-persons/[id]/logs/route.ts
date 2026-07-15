import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';
import type { ApiResponse } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const url = new URL(req.url);
    const filter = url.searchParams.get('filter') || 'this_month'; // 'this_month', 'last_month', 'all_time'

    let dateFilterSql = '';
    const queryParams: any[] = [id];

    if (filter === 'this_month') {
      dateFilterSql = `AND d.date >= date_trunc('month', CURRENT_DATE) AND d.date < date_trunc('month', CURRENT_DATE) + interval '1 month'`;
    } else if (filter === 'last_month') {
      dateFilterSql = `AND d.date >= date_trunc('month', CURRENT_DATE - interval '1 month') AND d.date < date_trunc('month', CURRENT_DATE)`;
    }

    // Fetch delivery person info
    const personRes = await pool.query(
      `SELECT id, name, phone_number FROM users WHERE id = $1 AND role = 'delivery_person'`,
      [id]
    );

    if (personRes.rows.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Delivery person not found' }, { status: 404 });
    }

    // Fetch logs
    const logsRes = await pool.query(
      `SELECT d.*, c.name as client_name, c.location as client_location
       FROM daily_deliveries d
       LEFT JOIN users c ON d.client_id = c.id
       WHERE d.delivery_person_id = $1 ${dateFilterSql}
       ORDER BY d.date DESC, d.meal_type DESC`,
      queryParams
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        person: personRes.rows[0],
        logs: logsRes.rows,
        totalDeliveries: logsRes.rows.filter(r => r.status === 'delivered').length,
      }
    });

  } catch (err) {
    console.error('[admin/delivery-persons/[id]/logs GET]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
