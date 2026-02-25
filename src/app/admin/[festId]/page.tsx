import { EventCards } from '@/components/manage-events/EventsCard';
import RequestAccessScreen from '@/components/RequestAccessScreen';
import { validateFestAccess } from '@/utils/functions/accessControl';
import { supabaseServer } from '@/utils/functions/supabase-server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | RCCIIT SWC',
  description:
    'Manage events, approve requests, and control access for RCCIIT Sports and Welfare Committee',
};

interface PageProps {
  params: Promise<{
    festId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { festId } = await params;
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

    // Check if user has multiple roles (excluding duplicates)
    const uniqueRoles = Array.from(new Set(roles.map((r) => r.role)));
    const hasMultipleRoles = uniqueRoles.length > 1;

    // If user has multiple roles, redirect to role selection
    // UNLESS they're coming from the role selection page
    if (hasMultipleRoles) {
      const { headers } = await import('next/headers');
      const headersList = await headers();
      const referer = headersList.get('referer') || '';

      if (
        !referer.includes('/select-role') &&
        !referer.includes('/select-fest') &&
        !referer.includes('/admin')
      ) {
        const { redirect } = await import('next/navigation');
        redirect('/select-role');
      }
    }

    const isAdmin = roles?.find((role) => role.role === 'super_admin');
    const securityAdmin = roles?.find((role) => role.role === 'security_admin');
    const isFaculty = roles?.find((role) => role.role === 'faculty');
    const isGraphics = roles?.find((role) => role.role === 'graphics');
    const hasAnyRole = roles && roles.length > 0; // Any role (coordinator, convenor, super_admin, faculty, graphics)

    // Collect all event_ids from all roles
    const eventIds =
      roles
        ?.map((role) => role.event_id)
        .filter((id): id is string => id !== null && id !== undefined) || [];

    // Redirect faculty users to /approve page only (if they ONLY have faculty role)
    if (isFaculty && !isAdmin && !hasMultipleRoles) {
      const { redirect } = await import('next/navigation');
      redirect('/approve');
    }

    // Redirect graphics users to /graphics page only (if they ONLY have graphics role)
    if (isGraphics && !isAdmin && !hasMultipleRoles) {
      const { redirect } = await import('next/navigation');
      redirect('/graphics');
    }

    // Check if user has access to this fest's events
    const hasAccess = await validateFestAccess(festId, roles || [], supabase);

    if (!hasAccess) {
      const { redirect } = await import('next/navigation');
      redirect('/request-access');
    }

    // Fetch categories directly using the server client
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('event_categories')
      .select('*')
      .eq('fest_id', festId)
      .order('name', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    }

    return (
      <div className="min-h-screen w-full bg-[#050508]">
        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

        <main className="relative container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <EventCards
            isSuperAdmin={isAdmin}
            eventIDs={eventIds}
            categories={categoriesData || []}
          />
        </main>
      </div>
    );
  }

  // User is not logged in - show events without admin features
  return (
    <div className="min-h-screen w-full bg-[#050508]">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      <main className="relative container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <EventCards isSuperAdmin={false} eventIDs={[]} />
      </main>
    </div>
  );
};

export default Page;
