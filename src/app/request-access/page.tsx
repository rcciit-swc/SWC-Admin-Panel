import RequestAccessScreen from '@/components/RequestAccessScreen';
import { supabaseServer } from '@/utils/functions/supabase-server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Request Additional Access | RCCIIT SWC',
  description:
    'Request additional roles and permissions for RCCIIT Sports and Welfare Committee',
};

export default async function RequestAccessRoute() {
  const supabase = await supabaseServer();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Check if profile is complete (at least name is present)
  const { data: userProfile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user?.id)
    .single();

  if (!userProfile?.name) {
    redirect('/profile?next=/request-access');
  }

  // Check if user has any roles
  const { data: roles } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', user?.id);

  // Check for pending request
  const { data: pendingRequest } = await supabase
    .from('requests')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  return <RequestAccessScreen hasPendingRequest={!!pendingRequest} />;
}
