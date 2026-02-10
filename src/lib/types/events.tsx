export interface LinkType {
  title: string;
  url: string;
}

export interface Coordinator {
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
  image_url: string;
  min_team_size: number;
  max_team_size: number;
  schedule: string;
  description: string;
  rules: string;
  coordinators: {
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
}

export interface EventData {
  serial_no: number;
  paymentstatus: 'Verified' | 'Not Verified';
  eventname: string;
  type: string;
  teamname: string;
  college: string;
  teamlead: string;
  teamleadphone: string;
  teamleademail: string;
  transactionid: string;
  transaction_screenshot: string;
  registeredat: string;
  teammembers: TeamMember[];
  accountHolderName?: string;
  gender?: string;
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
