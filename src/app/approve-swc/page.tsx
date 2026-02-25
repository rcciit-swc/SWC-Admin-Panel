import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ApproveSWCClient from './ApproveSWCClient';

export const metadata = {
  title: 'Approve Fund Requests | SWC Admin Panel',
  description: 'Approve or reject SWC fund requests.',
};

export default async function ApproveSWCPage() {
  const supabase = await createServer();

  // Check if user is logged in
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    redirect('/login');
  }

  // Check if user is super_admin
  const { data: roles } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', session.user.id);

  const isSuperAdmin = roles?.some((r: any) => r.role === 'super_admin');

  if (!isSuperAdmin) {
    redirect('/landing');
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white text-center md:text-left drop-shadow-sm">
        SWC Fund Requests
      </h1>
      <ApproveSWCClient />
    </div>
  );
}
