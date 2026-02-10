import { Button } from '@/components/ui/button';
import { createServer } from '@/lib/supabase/server';
import { LayoutDashboard, ShieldCheck, Users } from 'lucide-react';
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Enter Team Data Card */}
          <Link href="/team-entry" className="group">
            <div className="relative h-full bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border border-white/10 rounded-2xl p-8 hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  Enter Team Data
                </h2>

                <p className="text-zinc-400 mb-6">
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
          <Link href="/select-fest" className="group">
            <div className="relative h-full bg-gradient-to-br from-emerald-950/40 to-green-950/40 border border-white/10 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-green-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  Get Admin Access
                </h2>

                <p className="text-zinc-400 mb-6">
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
            <div className="relative h-full bg-gradient-to-br from-blue-950/40 to-cyan-950/40 border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <LayoutDashboard className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  Request Additional Access
                </h2>

                <p className="text-zinc-400 mb-6">
                  Already have a role? Request additional roles for more events
                  or responsibilities
                </p>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-cyan-500 border-0">
                  Add More Roles
                </Button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
``;
