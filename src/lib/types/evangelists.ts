export interface EventBreakdown {
  event_id: string;
  event_name: string;
  registration_count: number;
}

export interface EvangelistStats {
  referral_code: string;
  name: string;
  image: string | null;
  email: string | null;
  total_signups: number;
  total_registrations: number;
  event_breakdown: EventBreakdown[];
}

export interface Participant {
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
}

export interface RegistrationDetail {
  team_id: string;
  team_name: string | null;
  team_lead_email: string | null;
  college: string | null;
  registered_at: string | null;
  is_team: boolean;
  participants: Participant[];
}
