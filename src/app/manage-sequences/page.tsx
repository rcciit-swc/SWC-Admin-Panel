import { supabaseServer } from '@/utils/functions/supabase-server';
import ManageTeamSequence from '@/components/ManageTeamSequence';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { login } from '@/utils/functions/login';

export const metadata: Metadata = {
    title: 'Manage Team Sequences | RCCIIT SWC',
    description: 'Reorder team members for each team - Super Admin Only',
};

const Page = async () => {
    const supabase = await supabaseServer();
    const { data: sessionData } = await supabase.auth.getSession();

    // Check if user is logged in
    if (!sessionData?.session?.user) {
        await login();
    }

    // Check if user is super admin
    const { data: roles } = await supabase
        .from('roles')
        .select('*')
        .eq('user_id', sessionData?.session?.user.id)
        .eq('role', 'super_admin');

    const isSuperAdmin = roles && roles.length > 0;

    // If not super admin, redirect to unauthorized
    if (!isSuperAdmin) {
        redirect('/unauthorized');
    }

    return <ManageTeamSequence isSuperAdmin={isSuperAdmin} />;
};

export default Page;
