import RemoveTeamMemberPage from '@/components/RemoveTeamMemberPage';
import { createServer } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Remove Team Members | RCCIIT SWC',
  description: 'Remove team members from RCCIIT Sports and Welfare Committee',
};

const RemoveTeamMember = async () => {
  const supabase = await createServer();
  const { data: sessionData } = await supabase.auth.getSession();

  // Redirect to home if not logged in
  if (!sessionData?.session?.user) {
    redirect('/');
  }

  // Check if user is super admin
  const { data: userRoles } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', sessionData.session.user.id);

  const roles = userRoles?.map((role) => role.role) || [];
  const isSuperAdmin = roles.includes('super_admin');

  return (
    <RemoveTeamMemberPage
      userId={sessionData.session.user.id}
      isSuperAdmin={isSuperAdmin}
    />
  );
};

export default RemoveTeamMember;
