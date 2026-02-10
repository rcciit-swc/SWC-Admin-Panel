import {
  getCategoriesByFestId,
  getEventsByCategoryId,
  getEventsByFestId,
  getFestsBy2026,
} from '@/utils/functions/festUtils';

export const populateFests = async (set: any) => {
  set({ festsLoading: true });
  const data = await getFestsBy2026();
  set({ fests: data || [], festsLoading: false });
};

export const populateCategoriesByFest = async (set: any, festId: string) => {
  set({ categoriesLoading: true });
  const data = await getCategoriesByFestId(festId);
  set({ categories: data || [], categoriesLoading: false });
};

export const populateEventsByCategory = async (
  set: any,
  categoryId: string
) => {
  set({ eventsLoading: true });
  const data = await getEventsByCategoryId(categoryId);
  set({ events: data || [], eventsLoading: false });
};

export const populateEventsByFest = async (set: any, festId: string) => {
  set({ eventsLoading: true });
  const data = await getEventsByFestId(festId);
  set({ events: data || [], eventsLoading: false });
};

export const resetCategoriesData = (set: any) => {
  set({ categories: [] });
};

export const resetEventsData = (set: any) => {
  set({ events: [] });
};

