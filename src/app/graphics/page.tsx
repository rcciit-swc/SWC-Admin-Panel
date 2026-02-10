import GraphicsView from '@/components/GraphicsView';
import { login } from '@/utils/functions/login';
import { supabaseServer } from '@/utils/functions/supabase-server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Graphics View | RCCIIT SWC',
  description: 'View team members for graphics design purposes',
};

const Page = async () => {
  const supabase = await supabaseServer();
  const { data: sessionData } = await supabase.auth.getSession();

  // Check if user is logged in
  if (!sessionData?.session?.user) {
    await login();
  }

  // Check if user has graphics or super_admin role
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .eq('user_id', sessionData?.session?.user.id);

  const hasGraphicsRole = roles?.some((role) => role.role === 'graphics');
  const isSuperAdmin = roles?.some((role) => role.role === 'super_admin');

  // If not graphics role or super admin, redirect to unauthorized
  if (!hasGraphicsRole && !isSuperAdmin) {
    redirect('/unauthorized');
  }

  let festId: string | undefined;

  // If user has graphics role, use their assigned fest
  if (hasGraphicsRole) {
    const graphicsRole = roles?.find((role) => role.role === 'graphics');

    if (!graphicsRole?.fest_id) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
          <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              Configuration Error
            </h2>
            <p className="text-zinc-300">
              Your graphics role is not properly configured. Please contact an
              administrator.
            </p>
          </div>
        </div>
      );
    }

    festId = graphicsRole.fest_id;
  }
  // Super admin - don't set festId, let them select in the component

  return <GraphicsView festId={festId} isSuperAdmin={isSuperAdmin || false} />;
};

export default Page;
