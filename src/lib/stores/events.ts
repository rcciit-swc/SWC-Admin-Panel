import { create } from 'zustand';
import { events, EventsActionsType, EventsStateType } from '../types/events';
import {
  addEvent,
  getSecuritiesData,
  populateApprovalDashboard,
  populateCategories,
  populateEventDetails,
  populateEventDetailsByID,
  updatePopulateEvents,
  updateRegisterStatus,
} from '../actions/events';

type EventsStoreType = EventsStateType & EventsActionsType;
const eventState: EventsStateType = {
  eventCategories: [],
  eventsData: [],
  eventData: {},
  eventCategoriesLoading: false,
  eventsLoading: false,
  eventDetailsLoading: false,
  approvalDashboardData: [],
  approvalDashboardLoading: false,
  securitiesLoading: false,
  securitiesData: [],
};
export const useEvents = create<EventsStoreType>((set) => ({
  ...eventState,
  setEventsData: (all: boolean = true) => populateEventDetails(set, all),
  getEventByID: (id: string) => populateEventDetailsByID(set, id),
  getEventCategories: () => populateCategories(set),
  postEvent: (eventData: events) => addEvent(set, eventData),
  updateRegisterStatus: (id: string, status: boolean) =>
    updateRegisterStatus(set, id, status),
  updateEventsData: (id: string, data: any) =>
    updatePopulateEvents(set, id, data),
  getApprovalDashboardData: (rangeStart: number, rangeEnd: number) =>
    populateApprovalDashboard(set, rangeStart, rangeEnd),
  markEventAsRegistered: (eventId: string) =>
    set((state) => ({
      eventsData: state.eventsData.map((event) =>
        event.id === eventId ? { ...event, registered: true } : event
      ),
    })),
  getSecuritiesData: (userId: string) => getSecuritiesData(set, userId),
}));
