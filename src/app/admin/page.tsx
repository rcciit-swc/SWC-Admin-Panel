import { EventCards } from '@/components/manage-events/EventsCard';
import { supabaseServer } from '@/utils/functions/supabase-server';
import RequestAccessScreen from '@/components/RequestAccessScreen';
import Link from 'next/link';
import {
  Plus,
  ShieldCheck,
  Calendar,
  Sparkles,
  Shield,
  UserCheck,
  Users,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | RCCIIT SWC',
  description:
    'Manage events, approve requests, and control access for RCCIIT Sports and Welfare Committee',
};

const Page = async () => {
  const supabase = await supabaseServer();
  const { data: sessionData } = await supabase.auth.getSession();

  // If user is logged in, check for roles
  if (sessionData?.session?.user) {
    const { data: roles } = await supabase
      .from('roles')
      .select('*')
      .eq('user_id', sessionData.session.user.id);

    // If user has no roles, check for pending request
    if (!roles || roles.length === 0) {
      const { data: pendingRequest } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .single();

      // Show request access screen
      return <RequestAccessScreen hasPendingRequest={!!pendingRequest} />;
    }

    const isAdmin = roles?.find((role) => role.role === 'super_admin');
    const securityAdmin = roles?.find((role) => role.role === 'security_admin');
    const isFaculty = roles?.find((role) => role.role === 'faculty');
    const isGraphics = roles?.find((role) => role.role === 'graphics');
    const hasAnyRole = roles && roles.length > 0; // Any role (coordinator, convenor, super_admin, faculty, graphics)

    // Redirect faculty users to /approve page only
    if (isFaculty && !isAdmin) {
      const { redirect } = await import('next/navigation');
      redirect('/approve');
    }

    // Redirect graphics users to /graphics page only
    if (isGraphics && !isAdmin) {
      const { redirect } = await import('next/navigation');
      redirect('/graphics');
    }

    // Collect all event_ids from all roles
    const eventIds =
      roles
        ?.map((role) => role.event_id)
        .filter((id): id is string => id !== null && id !== undefined) || [];

    return (
      <div className="min-h-screen w-full bg-[#050508]">
        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

        {/* Action Bar */}
        <div className="relative border-b border-white/[0.06] bg-[#0a0a0f]/50 backdrop-blur-sm">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-zinc-400">
                Create, edit, and manage events of RCCIIT
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Registration - Available to all roles */}
                {hasAnyRole && (
                  <Link href="/approve" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0 text-sm">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Registration
                    </Button>
                  </Link>
                )}

                {/* Admin-only buttons */}
                {isAdmin && (
                  <>
                    {/* <Link href="/add-event" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0 text-sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                      </Button>
                    </Link> */}
                    <Link href="/approve-requests" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-500 hover:to-green-500 border-0 text-sm">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Approve Requests
                      </Button>
                    </Link>
                    <Link href="/manage-access" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-500 hover:to-orange-500 border-0 text-sm">
                        <Shield className="mr-2 h-4 w-4" />
                        Manage Access
                      </Button>
                    </Link>
                    <Link href="/approve-team" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:from-cyan-500 hover:to-blue-500 border-0 text-sm">
                        <Users className="mr-2 h-4 w-4" />
                        Approve Team
                      </Button>
                    </Link>
                    <Link href="/manage-sequences" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:from-purple-500 hover:to-pink-500 border-0 text-sm">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Manage Sequences
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="relative container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <EventCards isSuperAdmin={isAdmin} eventIDs={eventIds} />
        </main>
      </div>
    );
  }

  // User is not logged in - show events without admin features
  return (
    <div className="min-h-screen w-full bg-[#050508]">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      {/* Action Bar */}
      <div className="relative border-b border-white/[0.06] bg-[#0a0a0f]/50 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              Create, edit, and manage events of RCCIIT
            </p>
          </div>
        </div>
      </div>

      <main className="relative container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <EventCards isSuperAdmin={false} eventIDs={[]} />
      </main>
    </div>
  );
};

export default Page;
