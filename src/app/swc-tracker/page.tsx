import SWCTrackerContent from '@/components/SWCTrackerContent';
import { fetchSWCFundsData } from '@/utils/functions/googleSheets';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

export default async function SWCTrackerPage() {
    const supabase = await createServer();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData?.session?.user) {
        redirect('/');
    }

    // Check for super_admin role
    const { data: userRoles } = await supabase
        .from('roles')
        .select('role')
        .eq('user_id', sessionData.session.user.id)
        .eq('role', 'super_admin');

    const isSuperAdmin = userRoles && userRoles.length > 0;

    if (!isSuperAdmin) {
        redirect('/');
    }

    // Fetch ALL data at once
    const allStudents = await fetchSWCFundsData();

    return (
        <div className="min-h-screen w-full bg-[#050508] text-white overflow-x-hidden relative">
            {/* Background Elements */}
            <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/landing"
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-300" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                                SWC Funds Tracker
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">
                                Live status of successful student payments
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium text-emerald-400">
                            {allStudents.length} Verified Payments
                        </span>
                    </div>
                </div>

                {/* Client Component handling Table & Pagination */}
                <SWCTrackerContent students={allStudents} />
            </div>
        </div>
    );
}
