import EventsTable from '@/components/approve/EventsTable';
import TableSkeleton from '@/components/approve/TableSkeleton';
import { Suspense } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Approve Registrations | RCCIIT SWC',
  description: 'Review payment status and manage event registrations for RCCIIT Sports and Welfare Committee',
};

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-[#050508]">
      <div className="fixed inset-0 bg-linear-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-white/6 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
                <ShieldCheck className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  Approve Registrations
                </h1>
                <p className="text-sm text-zinc-500">
                  Review payment status and manage teams
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative container max-w-7xl mx-auto px-6 py-2">
        <section className="">
          <div className="p-6">
            <Suspense fallback={<TableSkeleton />}>
              <EventsTable />
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  );
}
