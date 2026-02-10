import { create } from 'zustand';
import {
  populateCategoriesByFest,
  populateEventsByCategory,
  populateEventsByFest,
  populateFests,
  resetCategoriesData,
  resetEventsData,
} from '../actions/fests';
import { FestsActionsType, FestsStateType } from '../types/fests';

type FestsStoreType = FestsStateType & FestsActionsType;

const festsState: FestsStateType = {
  fests: [],
  categories: [],
  events: [],
  festsLoading: false,
  categoriesLoading: false,
  eventsLoading: false,
};

export const useFests = create<FestsStoreType>((set) => ({
  ...festsState,
  getFests: () => populateFests(set),
  getCategoriesByFest: (festId: string) =>
    populateCategoriesByFest(set, festId),
  getEventsByCategory: (categoryId: string) =>
    populateEventsByCategory(set, categoryId),
  getEventsByFest: (festId: string) => populateEventsByFest(set, festId),
  resetCategories: () => resetCategoriesData(set),
  resetEvents: () => resetEventsData(set),
}));
