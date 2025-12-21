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
