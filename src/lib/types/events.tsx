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
}

export interface EventData {
  serial_no: number;
  paymentstatus: 'Paid' | 'Not Paid';
  eventname: string;
  type: string;
  teamname: string;
  college: string;
  gender: string;
  teamlead: string;
  teamleadphone: string;
  teamleademail: string;
  transactionid: string | null;
  transaction_screenshot: string;
  accountholdername: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount: number | null;
  currency: string | null;
  payment_status: string | null;
  payment_created_at: string | null;
  payment_verified_at: string | null;
  team_id: string;
  teammembers: TeamMember[];
  registeredat: string;
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
