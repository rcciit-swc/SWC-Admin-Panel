'use client';

import {
  Shield,
  Users,
  Calendar,
  CheckCircle,
  BarChart3,
  Lock,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { login } from '@/utils/functions/login';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        router.push('/landing');
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050508] overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/30 via-transparent to-indigo-950/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">
                RCCIIT Student Welfare Committee
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
                SWC Admin Panel
              </h1>
              <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto">
                Streamline event management, registrations, and access control
                with our powerful administrative platform
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0 text-lg px-8 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Redirecting...' : 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <a href="#features">
                <Button
                  variant="outline"
                  className="border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:bg-white/[0.05] hover:text-white text-lg px-8 py-6"
                >
                  Learn More
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
              {[
                { label: 'Events Managed', value: '100+' },
                { label: 'Active Users', value: '500+' },
                { label: 'Registrations', value: '2000+' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-violet-500/30 transition-all duration-300"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-zinc-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Everything you need to manage events and registrations efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: 'Event Management',
                description:
                  'Create, edit, and manage events with ease. Full control over event details, schedules, and categories.',
                gradient: 'from-violet-500 to-purple-500',
              },
              {
                icon: Users,
                title: 'Registration System',
                description:
                  'Streamlined registration process with real-time approval workflows and participant tracking.',
                gradient: 'from-indigo-500 to-blue-500',
              },
              {
                icon: Shield,
                title: 'Role-Based Access',
                description:
                  'Granular permission system with super admin, coordinator, and convenor roles for secure access.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: CheckCircle,
                title: 'Approval Workflows',
                description:
                  'Efficient request approval system for role assignments and event registrations.',
                gradient: 'from-emerald-500 to-green-500',
              },
              {
                icon: BarChart3,
                title: 'Analytics & Reports',
                description:
                  'Track registrations, monitor events, and generate insights with comprehensive reporting.',
                gradient: 'from-amber-500 to-orange-500',
              },
              {
                icon: Lock,
                title: 'Secure Authentication',
                description:
                  'Enterprise-grade security with Supabase authentication and protected routes.',
                gradient: 'from-red-500 to-rose-500',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 hover:border-violet-500/30 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} bg-opacity-10 mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Sign Up & Request Access',
                description:
                  'Create your account and request access to the admin panel. Your request will be reviewed by administrators.',
              },
              {
                step: '02',
                title: 'Get Role Assignment',
                description:
                  "Once approved, you'll be assigned a role (coordinator, convenor, or super admin) based on your responsibilities.",
              },
              {
                step: '03',
                title: 'Start Managing',
                description:
                  'Access the admin panel and start managing events, approving registrations, and more based on your role.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 hover:border-violet-500/30 transition-all duration-300">
                  <div className="text-6xl font-bold bg-gradient-to-r from-violet-500/20 to-indigo-500/20 bg-clip-text text-transparent mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-violet-500/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-violet-600/10 to-indigo-600/10 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-12 text-center">
            <Zap className="w-16 h-16 text-violet-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto">
              Join the SWC Admin Panel and streamline your event management
              workflow today.
            </p>
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0 text-lg px-8 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Redirecting...' : 'Login to Admin Panel'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] py-8 px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center text-zinc-500 text-sm">
            <p>
              © {new Date().getFullYear()} RCCIIT Student Welfare Committee. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
