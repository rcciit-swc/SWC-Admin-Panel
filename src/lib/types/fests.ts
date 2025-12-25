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
  resetCategories: () => void;
  resetEvents: () => void;
}
