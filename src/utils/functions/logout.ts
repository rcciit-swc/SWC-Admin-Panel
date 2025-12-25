import { supabase } from '@/lib/supabase/client';

export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  // Handle AuthSessionMissingError - if there's no session, user is already logged out
  if (error) {
    // Check if it's a session missing error
    if (
      error.message?.includes('Auth session missing') ||
      error.name === 'AuthSessionMissingError'
    ) {
      console.log('No active session found - user already logged out');
      // Still redirect to home page to clear UI state
      window.location.href = '/';
      return true;
    }

    // For other errors, log and return false
    console.error('Logout Error:', error);
    return false;
  }

  // Redirect to home page after successful logout
  window.location.href = '/';
  return true;
};
