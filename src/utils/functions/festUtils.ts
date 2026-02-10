import { toast } from 'sonner';
import { supabase } from './supabase-client';

export interface Fest {
  id: string;
  name: string;
  year: number;
  fest_logo: string | null;
  created_at?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  fest_id: string;
  created_at?: string;
}

export interface Event {
  id: string;
  name: string;
  event_category_id: string;
  description: string;
  min_team_size: number;
  max_team_size: number;
  registration_fees: number;
  prize_pool: number;
  schedule: string;
  rules: string;
  reg_status: boolean;
  image_url: string;
  links: any;
  coordinators: any[];
  created_at?: string;
}

/**
 * Fetch all fests for year 2026
 */
export const getFestsBy2026 = async (): Promise<Fest[] | null> => {
  try {
    const { data, error } = await supabase
      .from('fests')
      .select('*')
      .eq('year', 2026)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching fests:', error);
      toast.error('Failed to load fests');
      return null;
    }

    return data as Fest[];
  } catch (err) {
    console.error('Unexpected error fetching fests:', err);
    toast.error('Unexpected error occurred');
    return null;
  }
};

/**
 * Fetch all event categories for a specific fest
 */
export const getCategoriesByFestId = async (
  festId: string
): Promise<EventCategory[] | null> => {
  try {
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .eq('fest_id', festId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      return null;
    }

    return data as EventCategory[];
  } catch (err) {
    console.error('Unexpected error fetching categories:', err);
    toast.error('Unexpected error occurred');
    return null;
  }
};

/**
 * Fetch all events for a specific category
 */
export const getEventsByCategoryId = async (
  categoryId: string
): Promise<Event[] | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_category_id', categoryId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
      return null;
    }

    return data as Event[];
  } catch (err) {
    console.error('Unexpected error fetching events:', err);
    toast.error('Unexpected error occurred');
    return null;
  }
};

/**
 * Fetch all events for a specific fest using the get_events_by_fest RPC
 */
export const getEventsByFestId = async (
  festId: string
): Promise<any[] | null> => {
  try {
    // Get the current user's ID
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // Handle authentication errors gracefully
    let p_user_id: string | null = null;

    if (userError) {
      // If auth session is missing, continue with null user_id
      if (
        userError.message?.includes('Auth session missing') ||
        userError.name === 'AuthSessionMissingError'
      ) {
        p_user_id = null;
      } else {
        // Log other unexpected errors but continue
        console.error('Error getting user:', userError);
        p_user_id = null;
      }
    } else {
      p_user_id = userData.user?.id || null;
    }

    // Call the RPC with fest_id and user_id
    const { data, error } = await supabase.rpc('get_events_by_fest', {
      p_fest_id: festId,
      p_user_id,
    });

    if (error) {
      console.error('Error fetching events by fest:', error);
      toast.error('Failed to load events');
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error fetching events by fest:', err);
    toast.error('Unexpected error occurred');
    return null;
  }
};

