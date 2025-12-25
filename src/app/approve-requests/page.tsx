import { supabaseServer } from '@/utils/functions/supabase-server';
import { redirect } from 'next/navigation';
import ApproveRequestsPage from '@/components/ApproveRequestsPage';
import { login } from '@/utils/functions/login';

export default async function ApproveRequestsRoute() {
  const supabase = await supabaseServer();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    login();
  }

  // Check if user is super admin
  const { data: roles } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', user?.id);

  const isSuperAdmin = roles?.some((r) => r.role === 'super_admin');

  if (!isSuperAdmin) {
    redirect('/');
  }

  return <ApproveRequestsPage />;
}
