import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import TeamEntryForm from '@/components/TeamEntryForm';

export const metadata: Metadata = {
  title: 'Team Entry | RCCIIT SWC',
  description: 'Enter team member data for RCCIIT Sports and Welfare Committee',
};

const TeamEntryPage = async () => {
  const supabase = await createServer();
  const { data: sessionData } = await supabase.auth.getSession();

  // Redirect to home if not logged in
  if (!sessionData?.session?.user) {
    redirect('/');
  }

  // Check if user is super admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', sessionData.session.user.id)
    .single();

  const isSuperAdmin = userData?.role === 'super_admin';

  return (
    <div className="min-h-screen w-full bg-[#050508]">
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      <main className="relative container max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <TeamEntryForm
          userId={sessionData.session.user.id}
          isSuperAdmin={isSuperAdmin}
        />
      </main>
    </div>
  );
};

export default TeamEntryPage;
