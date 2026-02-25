import { Button } from '@/components/ui/button';
import { createServer } from '@/lib/supabase/server';
import {
  BadgeCheck,
  Banknote,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard | RCCIIT SWC',
  description: 'Choose your action - Enter team data or request admin access',
};

const LandingPage = async () => {
  const supabase = await createServer();
  const { data: sessionData } = await supabase.auth.getSession();

  // Redirect to home if not logged in
  if (!sessionData?.session?.user) {
    redirect('/');
  }

  /* Fetch user roles to determine access */
  const { data: userRoles } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', sessionData?.session?.user?.id!);

  const hasDidRole = (roles: { role: string }[] | null, targetRole: string) => {
    return roles?.some((r) => r.role === targetRole) || false;
  };

  const isSuperAdmin = hasDidRole(userRoles, 'super_admin');
  const hasAnyRole = (userRoles?.length || 0) > 0;

  const adminAccessHref = hasAnyRole ? '/select-role' : '/request-access';

  return (
    <div className="min-h-screen w-full bg-[#050508] flex items-center justify-center">
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      <div className="relative z-10 container max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Welcome to RCCIIT SWC
          </h1>
          <p className="text-zinc-400 text-lg">Choose an action to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Enter Team Data Card */}
          <Link href="/team-entry" className="group">
            <div className="relative h-full bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border border-white/10 rounded-2xl p-6 hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2">
                  Enter Team Data
                </h2>

                <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
                  Add new team members with their details, photos, and fest
                  information
                </p>

                <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0">
                  Get Started
                </Button>
              </div>
            </div>
          </Link>

          {/* Get Admin Access Card */}
          <Link href={adminAccessHref} className="group">
            <div className="relative h-full bg-gradient-to-br from-emerald-950/40 to-green-950/40 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-green-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2">
                  Get Admin Access
                </h2>

                <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
                  Request role-based access to manage events, approve
                  registrations, and more
                </p>

                <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-500 hover:to-green-500 border-0">
                  Request Access
                </Button>
              </div>
            </div>
          </Link>

          {/* Request Additional Access Card */}
          <Link href="/request-access" className="group">
            <div className="relative h-full bg-gradient-to-br from-blue-950/40 to-cyan-950/40 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <LayoutDashboard className="w-7 h-7 text-white" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2">
                  Request Additional Access
                </h2>

                <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
                  Already have a role? Request additional roles for more events
                  or responsibilities
                </p>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-cyan-500 border-0">
                  Add More Roles
                </Button>
              </div>
            </div>
          </Link>

          {/* SWC Clearance Check Card - For Non-Super Admins */}
          {!isSuperAdmin && (
            <Link href="/profile" className="group">
              <div className="relative h-full bg-gradient-to-br from-fuchsia-950/40 to-pink-950/40 border border-white/10 rounded-2xl p-6 hover:border-fuchsia-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-fuchsia-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-600 to-pink-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <BadgeCheck className="w-7 h-7 text-white" />
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2">
                    Check SWC Status
                  </h2>

                  <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
                    Verify your SWC fund payment status and clearance directly
                    from your profile
                  </p>

                  <Button className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 hover:from-fuchsia-500 hover:to-pink-500 border-0">
                    Check Clearance
                  </Button>
                </div>
              </div>
            </Link>
          )}

          {/* SWC Funds Tracker Card - Only for Super Admins */}
          {isSuperAdmin && (
            <Link href="/swc-tracker" className="group">
              <div className="relative h-full bg-gradient-to-br from-amber-950/40 to-orange-950/40 border border-white/10 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-orange-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Banknote className="w-7 h-7 text-white" />
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2">
                    SWC Funds Tracker
                  </h2>

                  <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
                    Track verified student payments and real-time fund status
                    from the dashboard
                  </p>

                  <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-500 hover:to-orange-500 border-0">
                    View Tracker
                  </Button>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
``;
