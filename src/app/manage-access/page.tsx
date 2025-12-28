import { supabaseServer } from '@/utils/functions/supabase-server';
import { redirect } from 'next/navigation';
import ManageAccessPage from '@/components/ManageAccessPage';
import { login } from '@/utils/functions/login';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Access | RCCIIT SWC',
  description:
    'Manage user roles and permissions for RCCIIT Sports and Welfare Committee',
};

export default async function ManageAccessRoute() {
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

  return <ManageAccessPage />;
}
