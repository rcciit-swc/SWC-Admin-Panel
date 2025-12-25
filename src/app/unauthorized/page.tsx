import Link from 'next/link';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Access Denied | RCCIIT SWC',
  description: 'You do not have permission to access this page',
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full bg-[#050508] flex items-center justify-center">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-red-950/20 via-transparent to-orange-950/10 pointer-events-none" />

      <div className="relative container max-w-2xl mx-auto px-6 py-8">
        <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-12 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
              <div className="relative bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6 rounded-full border border-red-500/20">
                <ShieldAlert className="w-16 h-16 text-red-400" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Access Denied
            </h1>
            <p className="text-lg text-zinc-400">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-zinc-500">
              This area is restricted to authorized users only. If you believe
              you should have access, please contact an administrator.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0 w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
            <Link
              href="/"
              className="border-white/[0.08] flex items-center gap-2 px-2 py-2 rounded-lg bg-white/[0.02] text-zinc-300 hover:bg-white/[0.05] hover:text-white w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
