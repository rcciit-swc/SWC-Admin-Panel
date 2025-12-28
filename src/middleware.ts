import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const url = new URL(req.nextUrl);

  // Allow home page, auth routes, landing, team-entry, request-access, and select-role to handle their own logic
  if (
    url.pathname === '/' ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/landing') ||
    url.pathname.startsWith('/team-entry') ||
    url.pathname.startsWith('/select-role')
  ) {
    return NextResponse.next();
  }

  // Create response object
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect unauthenticated users trying to access protected routes
  if (!session) {
    if (
      url.pathname.startsWith('/admin') ||
      url.pathname.startsWith('/add-event') ||
      url.pathname.startsWith('/approve') ||
      url.pathname.startsWith('/approve-requests') ||
      url.pathname.startsWith('/approve-team') ||
      url.pathname.startsWith('/manage-access') ||
      url.pathname.startsWith('/profile') ||
      url.pathname.startsWith('/landing') ||
      url.pathname.startsWith('/team-entry')
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return response;
  }

  // Allow authenticated users to access /admin - the page will handle showing RequestAccessScreen
  if (url.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Handle /manage-access route - super_admin only
  if (url.pathname.startsWith('/manage-access')) {
    const { data: userRoles } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', session.user?.id);

    const roles = userRoles?.map((role) => role.role) || [];

    if (roles.includes('super_admin')) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Handle /approve-requests route - super_admin only
  if (url.pathname.startsWith('/approve-requests')) {
    const { data: userRoles } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', session.user?.id);

    const roles = userRoles?.map((role) => role.role) || [];

    if (roles.includes('super_admin')) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Handle /add-event route - super_admin only
  if (url.pathname.startsWith('/add-event')) {
    const { data: userRoles } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', session.user?.id);

    const roles = userRoles?.map((role) => role.role) || [];

    if (roles.includes('super_admin')) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Handle /approve route - coordinator, convenor, faculty, or super_admin
  if (url.pathname.startsWith('/approve')) {
    const { data: userRoles } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', session.user?.id);

    const roles = userRoles?.map((role) => role.role) || [];

    if (
      userRoles &&
      userRoles.length > 0 &&
      (roles.includes('super_admin') ||
        roles.includes('coordinator') ||
        roles.includes('convenor') ||
        roles.includes('faculty'))
    ) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // If all checks pass, continue to the next middleware or route
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets folder
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
