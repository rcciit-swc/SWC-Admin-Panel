import { supabase } from '@/utils/functions/supabase-client';
import { CommunityStats, RegistrationDetail } from '../types/communities';

/**
 * Fetch the community leaderboard for the active fest (defaulting to 2026)
 */
export const getCommunityLeaderboard = async (): Promise<CommunityStats[]> => {
  try {
    // 1. Get the fest ID for 2026
    // const fests = await getFestsBy2026();
    // if (!fests || fests.length === 0) return [];

    // Use the first fest found for 2026
    // const festId = fests[0].id;

    // 2. Call the RPC
    const { data, error } = await supabase.rpc('get_community_leaderboard', {
      p_fest_id: '1e628648-6bde-4fb0-84eb-0083ca19ca95',
    });

    if (error) {
      console.error('Error fetching community leaderboard:', error);
      return [];
    }

    return data as CommunityStats[];
  } catch (err) {
    console.error('Unexpected error fetching community leaderboard:', err);
    return [];
  }
};

/**
 * Fetch registration details for a specific community referral code and event
 */
export const getEventRegistrations = async (
  referralCode: string,
  eventId: string
): Promise<RegistrationDetail[]> => {
  try {
    const { data, error } = await supabase.rpc(
      'get_event_registrations_by_referral',
      {
        p_referral_code: referralCode,
        p_event_id: eventId,
      }
    );

    if (error) {
      console.error('Error fetching event registrations:', error);
      return [];
    }

    return data as RegistrationDetail[];
  } catch (err) {
    console.error('Unexpected error fetching event registrations:', err);
    return [];
  }
};
