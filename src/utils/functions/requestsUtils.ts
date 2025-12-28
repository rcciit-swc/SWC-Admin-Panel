import { supabase } from './supabase-client';
import { toast } from 'sonner';

export interface RoleRequest {
  id: number;
  created_at: string;
  user_id: string;
  requester_email: string;
  role: string;
  event_ids: string[] | null;
  event_category_id: string | null;
  fest_id: string | null;
  // Joined data
  user_name?: string;
  fest_name?: string;
  category_name?: string;
  event_names?: string[];
}

export interface EventDetail {
  id: string;
  name: string;
}

/**
 * Fetch all pending role requests with related data
 */
export const getRoleRequests = async (): Promise<RoleRequest[] | null> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select(
        `
        *,
        users!requests_user_id_fkey(name),
        fests!requests_fest_id_fkey(name),
        event_categories!requests_event_category_id_fkey(name)
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching role requests:', error);
      toast.error('Failed to load role requests');
      return null;
    }

    // Fetch event names for each request
    const requestsWithEvents = await Promise.all(
      (data || []).map(async (request: any) => {
        let event_names: string[] = [];

        if (request.event_ids && Array.isArray(request.event_ids)) {
          const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('id, name')
            .in('id', request.event_ids);

          if (!eventsError && events) {
            event_names = events.map((e: any) => e.name);
          }
        }

        return {
          id: request.id,
          created_at: request.created_at,
          user_id: request.user_id,
          requester_email: request.requester_email,
          role: request.role,
          event_ids: request.event_ids,
          event_category_id: request.event_category_id,
          fest_id: request.fest_id,
          user_name: request.users?.name || 'Unknown',
          fest_name: request.fests?.name || 'N/A',
          category_name: request.event_categories?.name || 'N/A',
          event_names,
        };
      })
    );

    return requestsWithEvents as RoleRequest[];
  } catch (err) {
    console.error('Unexpected error fetching role requests:', err);
    toast.error('Unexpected error occurred');
    return null;
  }
};

/**
 * Get event details for a specific request
 */
export const getEventDetailsForRequest = async (
  eventIds: string[]
): Promise<EventDetail[] | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, name')
      .in('id', eventIds);

    if (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
      return null;
    }

    return data as EventDetail[];
  } catch (err) {
    console.error('Unexpected error fetching event details:', err);
    toast.error('Unexpected error occurred');
    return null;
  }
};

/**
 * Approve a single event for a user
 * Creates role entry and removes event from request
 */
export const approveEventForUser = async (
  requestId: number,
  userId: string,
  role: string,
  eventId: string,
  eventCategoryId: string | null,
  festId: string | null,
  currentEventIds: string[]
): Promise<boolean> => {
  try {
    // Get the current user (approver)
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      toast.error('You must be logged in to approve requests');
      return false;
    }

    // Ensure currentEventIds is a valid array, use empty array as fallback
    const safeEventIds =
      currentEventIds && Array.isArray(currentEventIds) ? currentEventIds : [];
    console.log('Original currentEventIds:', currentEventIds);
    console.log('Safe eventIds:', safeEventIds);

    // Create role entry for the user
    const { error: roleError } = await supabase.from('roles').insert({
      user_id: userId,
      role: role,
      event_id: eventId,
      event_category_id: eventCategoryId,
      granted_by: currentUser.id,
    });

    if (roleError) {
      console.error('Error creating role:', roleError);
      toast.error('Failed to create role');
      return false;
    }

    // Remove event from request's event_ids array
    console.log('Filtering event:', eventId);
    const updatedEventIds = safeEventIds.filter((id) => id !== eventId);

    if (updatedEventIds.length === 0) {
      // Delete the entire request if no events left
      const { error: deleteError } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) {
        console.error('Error deleting request:', deleteError);
        toast.error('Failed to delete request');
        return false;
      }
    } else {
      // Update request with remaining events
      const { error: updateError } = await supabase
        .from('requests')
        .update({ event_ids: updatedEventIds })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating request:', updateError);
        toast.error('Failed to update request');
        return false;
      }
    }

    toast.success('Event approved successfully!');
    return true;
  } catch (err) {
    console.error('Unexpected error approving event:', err);
    toast.error('Unexpected error occurred');
    return false;
  }
};

/**
 * Approve request for super_admin, faculty, or graphics role
 */
export const approveSuperAdminRequest = async (
  requestId: number,
  userId: string,
  role: string,
  eventCategoryId?: string | null
): Promise<boolean> => {
  try {
    // Get the current user (approver)
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      toast.error('You must be logged in to approve requests');
      return false;
    }

    // Create role entry for super admin, faculty, or graphics
    const { error: roleError } = await supabase.from('roles').insert({
      user_id: userId,
      role: role,
      event_id: null,
      event_category_id: eventCategoryId || null,
      granted_by: currentUser.id, // Use approver's ID
    });

    if (roleError) {
      console.error('Error creating role:', roleError);
      toast.error('Failed to create role');
      return false;
    }

    // Delete the request
    const { error: deleteError } = await supabase
      .from('requests')
      .delete()
      .eq('id', requestId);

    if (deleteError) {
      console.error('Error deleting request:', deleteError);
      toast.error('Failed to delete request');
      return false;
    }

    toast.success(
      `${role.replace('_', ' ').toUpperCase()} role approved successfully!`
    );
    return true;
  } catch (err) {
    console.error('Unexpected error approving role:', err);
    toast.error('Unexpected error occurred');
    return false;
  }
};

/**
 * Reject a role request
 */
export const rejectRoleRequest = async (
  requestId: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
      return false;
    }

    toast.success('Request rejected successfully!');
    return true;
  } catch (err) {
    console.error('Unexpected error rejecting request:', err);
    toast.error('Unexpected error occurred');
    return false;
  }
};
