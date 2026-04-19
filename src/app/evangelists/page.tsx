import EvangelistsPage from '@/components/EvangelistsPage';
import { login } from '@/utils/functions/login';
import { supabaseServer } from '@/utils/functions/supabase-server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Evangelists | RCCIIT SWC',
  description:
    'Manage evangelist invitations for RCCIIT Student Welfare Committee events',
};

export default async function EvangelistsRoute() {
  const supabase = await supabaseServer();

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

  return <EvangelistsPage userId={user?.id || ''} />;
}
