import { supabase } from '@/utils/functions/supabase-client';
import { EvangelistStats, RegistrationDetail } from '../types/evangelists';

/**
 * Fetch the evangelist leaderboard for the active fest (defaulting to 2026)
 */
export const getEvangelistLeaderboard = async (): Promise<
  EvangelistStats[]
> => {
  try {
    const { data, error } = await supabase.rpc('get_evangelist_leaderboard', {
      p_fest_id: '1e628648-6bde-4fb0-84eb-0083ca19ca95',
    });

    if (error) {
      console.error('Error fetching evangelist leaderboard:', error);
      return [];
    }

    return data as EvangelistStats[];
  } catch (err) {
    console.error('Unexpected error fetching evangelist leaderboard:', err);
    return [];
  }
};

/**
 * Fetch registration details for a specific evangelist referral code and event
 */
export const getEvangelistEventRegistrations = async (
  referralCode: string,
  eventId: string
): Promise<RegistrationDetail[]> => {
  try {
    const { data, error } = await supabase.rpc(
      'get_event_registrations_by_evangelist_referral',
      {
        p_referral_code: referralCode,
        p_event_id: eventId,
      }
    );

    if (error) {
      console.error('Error fetching evangelist event registrations:', error);
      return [];
    }

    return data as RegistrationDetail[];
  } catch (err) {
    console.error(
      'Unexpected error fetching evangelist event registrations:',
      err
    );
    return [];
  }
};
