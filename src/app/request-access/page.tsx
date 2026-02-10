import RequestAccessScreen from '@/components/RequestAccessScreen';
import { login } from '@/utils/functions/login';
import { supabaseServer } from '@/utils/functions/supabase-server';
import { Metadata } from 'next';

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
    login();
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
