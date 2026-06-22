import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';
import type { ApiResponse } from '@/types';

export async function POST() {
  await clearSession();
  return NextResponse.json<ApiResponse>({ success: true });
}
