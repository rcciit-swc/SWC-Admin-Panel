import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import ApproveTeamTable from '@/components/ApproveTeamTable';

export const metadata: Metadata = {
  title: 'Approve Team | RCCIIT SWC',
  description: 'Approve or reject team member requests',
};

const ApproveTeamPage = async () => {
  const supabase = await createServer();
  const { data: sessionData } = await supabase.auth.getSession();

  // Check if user is logged in
  if (!sessionData?.session?.user) {
    redirect('/');
  }

  // Check if user is super admin
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .eq('user_id', sessionData.session.user.id);

  const isAdmin = roles?.find((role) => role.role === 'super_admin');

  if (!isAdmin) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen w-full bg-[#050508]">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Approve Team Members
          </h1>
          <p className="text-zinc-400">
            Review and approve team member requests
          </p>
        </div>

        <ApproveTeamTable userId={sessionData.session.user.id} />
      </div>
    </div>
  );
};

export default ApproveTeamPage;
