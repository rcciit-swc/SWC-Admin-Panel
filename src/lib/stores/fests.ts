import { create } from 'zustand';
import { FestsActionsType, FestsStateType } from '../types/fests';
import {
  populateFests,
  populateCategoriesByFest,
  populateEventsByCategory,
  resetCategoriesData,
  resetEventsData,
} from '../actions/fests';

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
  resetCategories: () => resetCategoriesData(set),
  resetEvents: () => resetEventsData(set),
}));
