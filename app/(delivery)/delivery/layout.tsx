import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== 'delivery_person') redirect('/login');
  return <>{children}</>;
}

import React from 'react';
