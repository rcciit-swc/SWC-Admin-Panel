'use client';

import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import {
  ArrowUpDown,
  FileCheck,
  Image as ImageIcon,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuperAdminNav() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const pathname = usePathname();
  const festId = params?.festId as string | undefined;

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const { data: roles } = await supabase
            .from('roles')
            .select('role')
            .eq('user_id', sessionData.session.user.id);

          if (roles?.find((r: { role: string }) => r.role === 'super_admin')) {
            setIsSuperAdmin(true);
          }
        }
      } catch (error) {
        console.error('Error checking super admin role:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [pathname]); // Re-check if somehow session changes, but mostly it's a mount effect.

  if (loading || !isSuperAdmin) {
    return null;
  }

  if (
    pathname !== '/landing' &&
    !pathname.startsWith('/admin') &&
    pathname !== '/approve-swc'
  ) {
    return null;
  }

  return (
    <div className="w-full bg-[#0a0a0f]/50 backdrop-blur-md border-b border-white/[0.06] relative md:sticky top-[60px] md:top-[80px] z-40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
          <Link
            href={
              festId
                ? `/admin/${festId}/approve`
                : '/select-fest?redirect=approve'
            }
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0 text-sm">
              <UserCheck className="mr-2 h-4 w-4" />
              Registration
            </Button>
          </Link>
          <Link href="/approve-swc" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:from-teal-500 hover:to-emerald-500 border-0 text-sm">
              <FileCheck className="mr-2 h-4 w-4" />
              Approve Fund Requests
            </Button>
          </Link>
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
          <Link
            href={
              festId
                ? `/admin/${festId}/manage-sequences`
                : '/select-fest?redirect=manage-sequences'
            }
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:from-purple-500 hover:to-pink-500 border-0 text-sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Manage Sequences
            </Button>
          </Link>
          <Link href="/graphics" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:from-pink-500 hover:to-rose-500 border-0 text-sm">
              <ImageIcon className="mr-2 h-4 w-4" />
              Graphics View
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
