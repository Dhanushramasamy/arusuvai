import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminLayoutInner from './AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/login');

  return <AdminLayoutInner name={session.name}>{children}</AdminLayoutInner>;
}
