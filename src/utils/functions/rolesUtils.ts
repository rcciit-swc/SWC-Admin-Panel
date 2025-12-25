import { supabase } from './supabase-client';
import { toast } from 'sonner';

export interface UserRole {
  id: string;
  user_id: string;
  created_at: string;
  role: string;
  event_category_id: string | null;
  event_id: string | null;
  granted_by?: string | null;
  // Joined data
  user_name?: string;
  user_email?: string;
  event_name?: string;
  category_name?: string;
  fest_name?: string;
}

/**
 * Fetch all user roles with related data
 */
export const getAllUserRoles = async (): Promise<UserRole[] | null> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select(
        `
        *,
        users!roles_user_id_fkey(name, email),
        events!roles_event_id_fkey(name, event_category_id),
        event_categories!roles_event_category_id_fkey(name, fest_id, fests(name))
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user roles:', error);
      toast.error('Failed to load user roles');
      return null;
    }

    // Transform data to include nested fields
    const rolesWithDetails = (data || []).map((role: any) => {
      // Get fest name from event_categories (either from role's category or event's category)
      let festName = 'N/A';

      if (role.event_categories?.fests?.name) {
        // From role's event_category_id
        festName = role.event_categories.fests.name;
      } else if (role.events?.event_category_id) {
        // Need to get category info from event
        // This will be handled by a second query if needed
        festName = 'N/A';
      }

      return {
        id: role.id,
        user_id: role.user_id,
        created_at: role.created_at,
        role: role.role,
        event_category_id: role.event_category_id,
        event_id: role.event_id,
        granted_by: role.granted_by,
        user_name: role.users?.name || 'Unknown',
        user_email: role.users?.email || 'N/A',
        event_name: role.events?.name || 'N/A',
        category_name: role.event_categories?.name || 'N/A',
        fest_name: festName,
      };
    });

    return rolesWithDetails as UserRole[];
  } catch (err) {
    console.error('Unexpected error fetching user roles:', err);
    toast.error('Unexpected error occurred');
    return null;
  }
};

/**
 * Remove a user's role
 */
export const removeUserRole = async (
  userId: string,
  roleId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .delete()
      .eq('user_id', userId)
      .eq('id', roleId)
      .select();

    if (error) {
      console.error('Error removing role:', error);
      toast.error(`Failed to remove role: ${error.message}`);
      return false;
    }

    if (!data || data.length === 0) {
      console.warn('No rows were deleted. Role might not exist.');
      toast.error('Role not found or already deleted');
      return false;
    }

    toast.success('Role removed successfully!');
    return true;
  } catch (err) {
    console.error('Unexpected error removing role:', err);
    toast.error('Unexpected error occurred');
    return false;
  }
};

/**
 * Remove all roles for a specific user
 */
export const removeAllUserRoles = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing all roles:', error);
      toast.error('Failed to remove all roles');
      return false;
    }

    toast.success('All roles removed successfully!');
    return true;
  } catch (err) {
    console.error('Unexpected error removing all roles:', err);
    toast.error('Unexpected error occurred');
    return false;
  }
};
