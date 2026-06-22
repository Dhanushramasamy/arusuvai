import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

// Root page redirects based on session role
export default async function RootPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'admin') redirect('/admin');
  if (session.role === 'delivery_person') redirect('/delivery');
  redirect('/client');
}
