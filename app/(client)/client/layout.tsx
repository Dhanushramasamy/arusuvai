import React from 'react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ClientLayoutInner from './ClientLayoutClient';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== 'client') redirect('/login');

  return <ClientLayoutInner name={session.name}>{children}</ClientLayoutInner>;
}
