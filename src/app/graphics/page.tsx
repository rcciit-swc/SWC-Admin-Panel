import { supabaseServer } from '@/utils/functions/supabase-server';
import GraphicsView from '@/components/GraphicsView';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { login } from '@/utils/functions/login';

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

  // Check if user has graphics role
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .eq('user_id', sessionData?.session?.user.id)
    .eq('role', 'graphics');

  const hasGraphicsRole = roles && roles.length > 0;

  // If not graphics role, redirect to unauthorized
  if (!hasGraphicsRole) {
    redirect('/unauthorized');
  }

  // Get the fest_id from event_category_id
  // Graphics role should have event_category_id set
  const graphicsRole = roles[0];

  if (!graphicsRole.event_category_id) {
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

  // Fetch the fest_id from event_category
  const { data: categoryData } = await supabase
    .from('event_categories')
    .select('fest_id')
    .eq('id', graphicsRole.event_category_id)
    .single();

  if (!categoryData?.fest_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
        <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Data Error</h2>
          <p className="text-zinc-300">
            Unable to fetch fest information. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return <GraphicsView festId={categoryData.fest_id} />;
};

export default Page;
