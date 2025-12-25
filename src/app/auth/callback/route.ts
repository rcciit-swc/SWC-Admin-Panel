import { NextResponse } from 'next/server';
import { supabaseServer } from '@/utils/functions/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user exists in public.users table
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // User doesn't exist, create a new user
          const { error: insertError } = await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            name:
              user.user_metadata?.full_name || user.user_metadata?.name || null,
          });

          if (insertError) {
            console.error('Error creating user:', insertError);
            // Still redirect to home, user can try again or profile will be created later
          }
        } else if (fetchError) {
          console.error('Error checking user:', fetchError);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
