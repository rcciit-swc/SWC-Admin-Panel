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

export interface FestsStateType {
  fests: Fest[];
  categories: EventCategory[];
  events: Event[];
  festsLoading: boolean;
  categoriesLoading: boolean;
  eventsLoading: boolean;
}

export interface FestsActionsType {
  getFests: () => Promise<void>;
  getCategoriesByFest: (festId: string) => Promise<void>;
  getEventsByCategory: (categoryId: string) => Promise<void>;
  getEventsByFest: (festId: string) => Promise<void>;
  resetCategories: () => void;
  resetEvents: () => void;
}
