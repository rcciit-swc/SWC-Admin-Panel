export interface LinkType {
  title: string;
  url: string;
}

export interface Coordinator {
  name: string;
  phone: string;
}

export interface Convenor {
  name: string;
  phone: string;
}

export interface events {
  id?: string;
  name: string;
  event_category_id?: string;
  reg_status: boolean;
  registration_fees: number;
  prize_pool: number;
  image_url?: string | null;
  min_team_size: number;
  max_team_size: number;
  schedule: string;
  description: string;
  rules: string;
  coordinators: {
    name: string;
    phone: string;
  }[];
  convenors: {
    name: string;
    phone: string;
  }[];
  links: {
    title: string;
    url: string;
  }[];
  registered?: boolean;
}

export interface eventCategories {
  id: string;
  fest_id: string;
  name: string;
  tagline: string;
  convenors: string;
}

export interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college?: string;
  extras?: Record<string, any>;
  is_rcciit_email?: boolean;
  swc_cleared?: boolean | null;
}

export interface TeamDiscoveryEntry {
  id: string;
  user_id: string;
  type: 'looking' | 'open_team';
  slots_available: number | null;
  message: string | null;
  status: 'active' | 'matched' | 'withdrawn';
  created_at: string;
}

export interface EventData {
  // ── Meta ──────────────────────────────────────────────
  serial_no: number;
  registration_status: string;
  event_name: string;
  event_category: string;
  registration_type: string;

  // ── Team ──────────────────────────────────────────────
  team_id: string;
  team_name: string;
  team_status: string;
  invite_code: string | null;
  college: string;
  reg_mode: string | null;
  payment_mode: string | null;

  // ── Team lead (users) ─────────────────────────────────
  team_lead_id: string;
  team_lead_name: string;
  team_lead_email: string;
  team_lead_phone: string;
  team_lead_gender: string;
  team_lead_college: string;
  team_lead_college_roll: string | null;
  team_lead_course: string | null;
  team_lead_stream: string | null;
  team_lead_coin: number | null;
  team_lead_referral: string | null;
  team_lead_user_created_at: string | null;
  team_lead_is_rcciit_email: boolean;
  team_lead_swc_cleared: boolean | null;

  // ── Offline transaction ───────────────────────────────
  transaction_id: string | null;
  transaction_screenshot: string | null;
  account_holder_name: string | null;
  transaction_verified: string | null;

  // ── Razorpay / payments ───────────────────────────────
  payment_row_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  payment_amount: number | null;
  payment_currency: string | null;
  razorpay_status: string | null;
  payment_created_at: string | null;
  payment_updated_at: string | null;
  payment_verified_at: string | null;
  webhook_verified: boolean | null;

  // ── Registration metadata ─────────────────────────────
  registered_at: string;
  attendance: boolean;
  verification_mail_sent: boolean;
  referral_code: string | null;

  // ── Event size / fees ─────────────────────────────────
  member_count: number;
  min_team_size: number;
  max_team_size: number;
  registration_fees: number;
  prize_pool: number | null;

  // ── Event details ─────────────────────────────────────
  event_description: string | null;
  event_schedule: string | null;
  event_rules: string | null;
  event_reg_status: boolean | null;
  event_image_url: string | null;
  event_links: Record<string, any>[] | null;
  event_coordinators: { name: string; phone: string }[] | null;
  event_convenors: { name: string; phone: string }[] | null;
  event_extra_fields: string[] | null;

  // ── Event category ────────────────────────────────────
  event_category_tagline: string | null;
  event_category_convenors: Record<string, any> | null;

  // ── Fest ──────────────────────────────────────────────
  fest_name: string | null;
  fest_year: number | null;
  fest_logo: string | null;
  fest_is_active: boolean | null;
  fest_website: string | null;

  // ── SWC eligibility ───────────────────────────────────
  is_swc_eligible_category: boolean;
  all_rcciit_members_swc_cleared: boolean | null;

  // ── Aggregates ────────────────────────────────────────
  team_discovery: TeamDiscoveryEntry[];
  team_members: TeamMember[];
}

export interface EventsStateType {
  eventCategories: eventCategories[];
  eventCategoriesLoading: boolean;
  eventsData: events[];
  eventData: any;
  eventDetailsLoading: boolean;
  eventsLoading: boolean;
  approvalDashboardData: any[];
  approvalDashboardLoading: boolean;
  securitiesLoading: boolean;
  securitiesData: any[];
}

export interface EventsActionsType {
  setEventsData: (all: boolean) => void;
  postEvent: (eventsData: events) => void;
  getEventCategories: () => void;
  getEventByID: (id: string) => void;
  markEventAsRegistered: (eventId: string) => void;
  updateRegisterStatus: (id: string, status: boolean) => void;
  updateEventsData: (id: string, data: any) => void;
  getApprovalDashboardData: (
    rangeStart: number,
    rangeEnd: number,
    festId: string
  ) => void;
  getSecuritiesData: (userId: string) => void;
}
