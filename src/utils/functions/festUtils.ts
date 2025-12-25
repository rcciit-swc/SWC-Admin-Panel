import { supabase } from './supabase-client';
import { toast } from 'sonner';

export interface Fest {
  id: string;
  name: string;
  year: number;
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
  fest_id: string;
  event_category_id: string;
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
