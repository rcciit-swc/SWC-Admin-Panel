import { EventCards } from '@/components/manage-events/EventsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabaseServer } from '@/utils/functions/supabase-server';
import Link from 'next/link';
import { Plus, ShieldCheck, Calendar, Sparkles, Shield } from 'lucide-react';

const Page = async () => {
  const supabase = await supabaseServer();
  const { data: sessionData } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('user_id', sessionData.session?.user.id);
  const isAdmin = data?.find((role) => role.role === 'super_admin');
  const securityAdmin = data?.find((role) => role.role === 'security_admin');
  return (
    <div className="min-h-screen w-full bg-[#050508]">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />
      
      {/* Header Section */}
      <header className="relative border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
                <ShieldCheck className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">Admin Panel</h1>
                <p className="text-sm text-zinc-500">Welcome!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Super Admin
                </Badge>
              )}
              {securityAdmin && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Security Admin
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Action Bar */}
      <div className="relative border-b border-white/[0.06] bg-[#0a0a0f]/50 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              Create, edit, and manage events of RCCIIT
            </p>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/add-event">
                  <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative container max-w-7xl mx-auto px-6 py-8">
        <EventCards isSuperAdmin={isAdmin} eventID={data![0]?.event_id} />
      </main>
    </div>
  );
};

export default Page;
