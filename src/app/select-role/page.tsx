import RoleSelection from '@/components/RoleSelection';
import { login } from '@/utils/functions/login';
import { supabaseServer } from '@/utils/functions/supabase-server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Select Role | RCCIIT SWC',
  description: 'Choose which role to use',
};

export default async function SelectRolePage() {
  const supabase = await supabaseServer();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    login();
  }

  // Get user's roles
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .eq('user_id', user?.id);

  // If user has no roles, redirect to admin
  if (!roles || roles.length === 0) {
    redirect('/admin');
  }

  // If user has only one unique role, redirect based on that role
  const uniqueRoles = Array.from(new Set(roles.map((r) => r.role)));

  if (uniqueRoles.length === 1) {
    const role = uniqueRoles[0];

    switch (role) {
      case 'graphics':
        redirect('/graphics');
      case 'faculty':
      default:
        redirect('/select-fest');
    }
  }

  // Show role selection for multi-role users
  return <RoleSelection roles={roles} />;
}
