import {
  createEvent,
  getApprovalDashboardData,
  getEventByID,
  getEventCategories,
  getEventsData,
  getSecurity,
  updateEventById,
  updateRegisterStatusDb,
} from '@/utils/functions';
import { toast } from 'sonner';
import { events } from '../types/events';

export const populateEventDetails = async (set: any, all: boolean) => {
  set({ eventsLoading: true });
  const data = await getEventsData(all);
  set({ eventsData: data, eventsLoading: false });
};

export const populateCategories = async (set: any) => {
  set({ eventCategoriesLoading: true });
  // logic
  const data = await getEventCategories();
  if (!data) {
    set({ eventCategories: [], eventCategoriesLoading: false });
  } else {
    set({ eventCategories: data, eventCategoriesLoading: false });
  }
};

export const addEvent = async (set: any, eventData: events) => {
  try {
    set({ eventsLoading: true });
    await createEvent(eventData);
    const updatedData = await getEventsData(true);
    set({ eventsData: updatedData, eventsLoading: false });
  } catch (error: any) {
    set({ eventsLoading: false });
    toast.error('Failed to create event. ' + error.message);
  }
};

export const updateRegisterStatus = async (
  set: any,
  id: string,
  status: boolean
) => {
  await updateRegisterStatusDb(id, status);
  const updatedData = await getEventsData();
  set({ eventsData: updatedData });
};

export const updatePopulateEvents = async (set: any, id: string, data: any) => {
  set({ eventsLoading: true });
  const updatedEvent = await updateEventById(id, data);
  if (updatedEvent) {
    set((state: any) => ({
      eventsData: (state.eventsData || []).map((event: any) =>
        event.id === id ? { ...event, ...updatedEvent } : event
      ),
      eventsLoading: false,
    }));
    return;
  }

  // Fallback: if update didn't return a row, stop loading and keep existing state.
  set({ eventsLoading: false });
};

export const populateApprovalDashboard = async (
  set: any,
  rangeStart: number,
  rangeEnd: number,
  festId: string
) => {
  try {
    set({ approvalDashboardLoading: true });
    const res = await getApprovalDashboardData(rangeStart, rangeEnd, festId);
    set({ approvalDashboardData: res, approvalDashboardLoading: false });
    // if (!res) {
    //   set({ approvalDashboardData: [], approvalDashboardLoading: false });
    // } else {
    //   set({ approvalDashboardData: finalRes, approvalDashboardLoading: false });
    // }
  } catch (error: any) {
    console.log(error.message);
  }
};

export const populateEventDetailsByID = async (set: any, id: string) => {
  try {
    set({ eventDetailsLoading: true });
    const eventData = await getEventByID(id);
    if (!eventData) {
      set({ eventData: {}, eventDetailsLoading: false });
    } else {
      set({ eventData, eventDetailsLoading: false });
    }
  } catch (error: any) {
    set({ eventData: {}, eventDetailsLoading: false });
  }
};

export const getSecuritiesData = async (set: any, userId: string) => {
  set({ securitiesLoading: true });
  const data = await getSecurity(userId);
  if (!data) {
    set({ securitiesData: [], securitiesLoading: false });
  } else {
    set({ securitiesData: data, securitiesLoading: false });
  }
};
