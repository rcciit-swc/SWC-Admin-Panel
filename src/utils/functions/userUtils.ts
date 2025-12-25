import { toast } from 'sonner';
import { supabase } from './supabase-client';
import { supabaseServer } from './supabase-server';

export const getRoles = async () => {
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .eq('user_id', sessionData?.session?.user?.id);
    return rolesData;
  } catch (e) {
    console.log(e);
  }
};

export const getUserData = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    // If there's no session or an error, return early without throwing
    if (error || !data?.session) {
      return null;
    }

    const userdetails = await supabase
      .from('users')
      .select('*')
      .eq('id', data.session.user.id);

    if (userdetails && userdetails.data && userdetails.data.length > 0) {
      const swcData = await supabase
        .from('SWC-2025')
        .select('*')
        .eq('email', userdetails.data[0].email);
      const returnValue = {
        data: userdetails.data[0],
        swcData:
          swcData.data && swcData.data.length > 0 ? swcData.data[0] : null,
      };
      return returnValue;
    }

    return null;
  } catch (err) {
    // Only log the error, don't show toast for auth errors when not logged in
    console.error('Error fetching user data:', err);
    return null;
  }
};
