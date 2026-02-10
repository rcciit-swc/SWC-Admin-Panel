import { SupabaseClient } from '@supabase/supabase-js';
import { UserRole } from './rolesUtils';

/**
 * Validates if a user has access to a specific fest based on their roles.
 * Access is granted if:
 * 1. User is a super_admin.
 * 2. User has a role linked to an event in the fest.
 * 3. User has a role linked to an event category in the fest.
 *
 * @param festId The ID of the fest to check access for.
 * @param roles The user's roles.
 * @param supabase The Supabase client instance.
 * @returns Promise<boolean> True if access is granted, false otherwise.
 */
export const validateFestAccess = async (
  festId: string,
  roles: Partial<UserRole>[],
  supabase: SupabaseClient
): Promise<boolean> => {
  try {
    // 1. Check for Super Admin
    const isSuperAdmin = roles.some((role) => role.role === 'super_admin');
    if (isSuperAdmin) return true;

    // 2. Extract IDs
    const eventIds = roles
      .map((role) => role.event_id)
      .filter((id): id is string => id !== null && id !== undefined);

    const eventCategoryIds = roles
      .map((role) => role.event_category_id)
      .filter((id): id is string => id !== null && id !== undefined);

    if (eventIds.length === 0 && eventCategoryIds.length === 0) {
      return false;
    }

    // 3. Check Access via Events
    // Logic: Get categories from events -> Check if categories belong to fest
    if (eventIds.length > 0) {
      const { data: eventsData, error: eventError } = await supabase
        .from('events')
        .select('event_category_id')
        .in('id', eventIds);

      if (eventError) {
        console.error(
          'validateFestAccess: Error fetching event categories:',
          eventError
        );
      } else if (eventsData && eventsData.length > 0) {
        const categoryIdsFromEvents = eventsData
          .map((e) => e.event_category_id)
          .filter(Boolean);

        if (categoryIdsFromEvents.length > 0) {
          const { count, error: categoryError } = await supabase
            .from('event_categories')
            .select('*', { count: 'exact', head: true })
            .in('id', categoryIdsFromEvents)
            .eq('fest_id', festId);

          if (categoryError) {
            console.error(
              'validateFestAccess: Error checking event category access:',
              categoryError
            );
          }

          if (count && count > 0) return true;
        }
      }
    }

    // 4. Check Access via Event Categories (Direct roles)
    if (eventCategoryIds.length > 0) {
      const { count, error } = await supabase
        .from('event_categories')
        .select('*', { count: 'exact', head: true })
        .in('id', eventCategoryIds)
        .eq('fest_id', festId);

      if (error) {
        console.error(
          'validateFestAccess: Error checking category access:',
          error
        );
      }

      if (count && count > 0) return true;
    }

    return false;
  } catch (error) {
    console.error('validateFestAccess: Unexpected error:', error);
    return false;
  }
};
