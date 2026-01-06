import { EventData, events } from '@/lib/types/events';
import { supabase } from './supabase-client';
import { toast } from 'sonner';
import { supabaseServer } from './supabase-server';
import { getRoles } from './userUtils';

export const getEventCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .eq('fest_id', 'a4bc08e4-9af9-4212-8d32-cd88d2437f18');
    if (error) return error;
    return data;
  } catch (error: any) {
    toast.error(error.message);
  }
};

export async function createEvent(event: events) {
  const { data, error } = await supabase.from('events').insert(event);

  if (error) throw error;
  return data;
}

export const updateRegisterStatusDb = async (id: string, status: boolean) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update({ reg_status: status })
      .eq('id', id);

    if (error) {
      console.error('Error updating event:', error);
      return null;
    }
    toast.success('Event updated successfully');
    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    toast.error('Error updating event');
    return null;
  }
};

export const getEventsData = async (all: boolean = true) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      // AuthSessionMissingError is expected when user is not logged in
      if (
        userError.message?.includes('Auth session missing') ||
        userError.name === 'AuthSessionMissingError'
      ) {
        // Silently continue without user context
        const p_user_id = null;
        const p_fest_id = '5bff3a43-43b6-420a-8d42-9a96257cc351';

        // Fetch all events without user context
        const { data, error } = await supabase.rpc('get_events_by_fest', {
          p_fest_id,
          p_user_id,
        });

        if (error) {
          throw new Error(error.message);
        }

        return data;
      }

      // Log other unexpected errors
      console.error('Error getting user:', userError);
      return null;
    }

    const p_user_id = userData.user?.id || null;
    const p_fest_id = '5bff3a43-43b6-420a-8d42-9a96257cc351';
    const rolesData: {
      role: string;
      event_category_id?: string;
      event_id?: string;
    }[] = (await getRoles()) || []; // Provide a default empty array if getRoles() returns null or undefined

    let data, error;

    if (all || !rolesData || rolesData.length === 0) {
      // Fetch all events if `all` is true or rolesData is empty/null
      ({ data, error } = await supabase.rpc('get_events_by_fest', {
        p_fest_id,
        p_user_id,
      }));
    } else {
      // Determine the highest privileged role
      const roles = rolesData.map((role: { role: string }) => role.role);
      if (roles.includes('super_admin') || roles.includes('registrar')) {
        ({ data, error } = await supabase.rpc('get_events_by_fest', {
          p_fest_id,
          p_user_id,
        }));
      } else if (roles.includes('convenor')) {
        const eventCategoryIds = rolesData
          .filter(
            (role: { role: string; event_category_id?: string }) =>
              role.role === 'convenor'
          )
          .map(
            (role: { role: string; event_category_id?: string }) =>
              role.event_category_id
          );

        ({ data, error } = await supabase
          .from('events')
          .select('*')
          .in('event_category_id', eventCategoryIds));
      } else if (roles.includes('coordinator')) {
        const eventIds = rolesData
          .filter(
            (role: { role: string; event_id?: string }) =>
              role.role === 'coordinator'
          )
          .map((role: { event_id?: string | null }) => role.event_id);

        ({ data, error } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds));
      } else {
        throw new Error('Invalid role');
      }
    }

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

export const getEventsForAdmin = async (
  id: string,
  p_fest_id?: string,
  p_user_id?: string
) => {
  try {
    const rolesData = await getRoles(); // Expecting an array of roles

    if (!rolesData || rolesData.length === 0) {
      throw new Error('No roles found');
    }

    let data, error;
    const roles = rolesData.map((role: { role: string }) => role.role);

    if (roles.includes('super_admin')) {
      if (!p_fest_id || !p_user_id) {
        throw new Error('Missing parameters for super_admin');
      }
      ({ data, error } = await supabase.rpc('get_events_by_fest', {
        p_fest_id,
        p_user_id,
      }));
    } else if (roles.includes('convenor')) {
      const eventCategoryIds = rolesData
        .filter(
          (role: { role: string; event_category_id?: string }) =>
            role.role === 'convenor'
        )
        .map(
          (role: { role: string; event_category_id?: string }) =>
            role.event_category_id
        );

      ({ data, error } = await supabase
        .from('events')
        .select('*')
        .in('event_category_id', eventCategoryIds));
    } else if (roles.includes('coordinator')) {
      const eventIds = rolesData
        .filter(
          (role: { role: string; event_id?: string }) =>
            role.role === 'coordinator'
        )
        .map((role: { event_id?: string | null }) => role.event_id);

      ({ data, error } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds));
    } else {
      throw new Error('Invalid role');
    }

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching events:', error.message);
    return null;
  }
};

export const updateEventById = async (
  id: string,
  data: Partial<events>
): Promise<events | null> => {
  try {
    const { data: updatedData, error } = await supabase
      .from('events')
      .update(data)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating event:', error);
      return null;
    }
    toast.success('Event updated successfully');
    return updatedData && updatedData.length > 0 ? updatedData[0] : null;
  } catch (err) {
    console.error('Unexpected error:', err);
    toast.error('Error updating event');
    return null;
  }
};

export const getApprovalDashboardData = async (
  rangeStart: number,
  rangeEnd: number
): Promise<EventData[] | null> => {
  try {
    const rolesData = await getRoles();
    const isAdmin = rolesData?.find((role: any) => role.role === 'super_admin');
    const isCoordinator = rolesData?.find(
      (role: any) => role.role === 'coordinator' || role.role === 'convenor'
    );

    // Collect all event_ids from all coordinator/convenor roles
    const eventIds =
      rolesData
        ?.filter(
          (role: any) => role.role === 'coordinator' || role.role === 'convenor'
        )
        .map((role: any) => role.event_id)
        .filter((id: any) => id !== null && id !== undefined) || [];

    const { data, error } = await supabase
      .rpc('get_fest_registrations', {
        p_fest_id: '5bff3a43-43b6-420a-8d42-9a96257cc351',
        p_event_category_id:
          isAdmin?.role === 'super_admin'
            ? null
            : 'c90f8d69-3520-43ac-85f6-043c6f60bf49',
        p_event_id: isCoordinator ? eventIds : null,
      })
      .range(rangeStart, rangeEnd);

    if (error) {
      console.error('Error fetching event table data:', error);
      toast.error('Error fetching event table data');
      return null;
    }

    return data as EventData[];
  } catch (err) {
    console.error('Unexpected error:', err);
    toast.error('Unexpected error occurred');
    return null;
  }
};

export const getEventByID = async (id: string): Promise<events | null> => {
  const serverClient = await supabaseServer();
  const p_event_id = id;
  const { data, error } = await serverClient
    .from('events')
    .select('*')
    .eq('id', p_event_id);

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  // Return the first result, since the RPC returns a table (array)
  return data && data.length > 0 ? data[0] : null;
};

export const getSecurity = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*, users(name)');
    if (error) {
      console.error('Error fetching security:', error);
      return null;
    }
    return data?.flatMap((item: any) => {
      return [
        {
          id: item.id,
          created_at: item.created_at,
          user_id: item.user_id,
          requester_email: item.requester_email,
          name: item.users?.name || '',
        },
      ];
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return null;
  }
};

export const acceptSecurity = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('user_id', id);
    if (data && data.length > 0) {
      const securityRole = data.find((role: any) => role.role === 'security');
      if (securityRole && securityRole.event_id !== null) {
        return;
      }
    }
    await supabase.from('roles').insert({
      role: 'security',
      user_id: id,
      event_id: null,
      event_category_id: null,
    });

    await supabase.from('requests').delete().eq('user_id', id);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    toast.error('Error accepting security');
    return null;
  }
};

export const rejectSecurity = async (id: string) => {
  try {
    await supabase.from('requests').delete().eq('user_id', id);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    toast.error('Error accepting security');
    return null;
  }
};
