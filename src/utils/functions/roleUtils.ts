import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface RoleRequestData {
  role: string;
  fest_id?: string;
  event_ids?: string[]; // Changed from event_id to event_ids array
  event_category_id?: string;
}

export const requestRole = async (requestData: RoleRequestData) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      toast.error('Please login first');
      return false;
    }

    // Check if user already has a pending request
    const { data: existingRequest } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingRequest) {
      toast.info('You already have a pending request');
      return false;
    }

    // Insert new role request with fest and event details
    const { error } = await supabase.from('requests').insert({
      user_id: user.id,
      requester_email: user.email,
      role: requestData.role,
      fest_id: requestData.fest_id || null,
      event_ids: requestData.event_ids || null,
      event_category_id: requestData.event_category_id || null,
    });

    if (error) {
      console.error('Error requesting role:', error);
      toast.error('Failed to submit role request');
      return false;
    }

    toast.success('Role request submitted successfully!');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};

export const checkUserHasRole = async () => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      return { hasRole: false, hasPendingRequest: false };
    }

    // Check if user has any roles
    const { data: roles } = await supabase
      .from('roles')
      .select('*')
      .eq('user_id', user.id);

    const hasRole = roles && roles.length > 0;

    // Check if user has a pending request
    const { data: pendingRequest } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const hasPendingRequest = !!pendingRequest;

    return { hasRole, hasPendingRequest, roles };
  } catch (error) {
    console.error('Error checking user role:', error);
    return { hasRole: false, hasPendingRequest: false };
  }
};
