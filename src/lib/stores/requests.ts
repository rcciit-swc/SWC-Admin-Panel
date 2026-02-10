import { create } from 'zustand';
import {
  approveEventAction,
  approveSuperAdminAction,
  populateRequests,
  rejectRequestAction,
} from '../actions/requests';
import { RequestsActionsType, RequestsStateType } from '../types/requests';

type RequestsStoreType = RequestsStateType & RequestsActionsType;

const requestsState: RequestsStateType = {
  requests: [],
  requestsLoading: false,
};

export const useRequests = create<RequestsStoreType>((set) => ({
  ...requestsState,
  getRequests: () => populateRequests(set),
  approveEvent: (
    requestId: number,
    userId: string,
    role: string,
    eventId: string,
    eventCategoryId: string | null,
    festId: string | null,
    currentEventIds: string[]
  ) =>
    approveEventAction(
      set,
      requestId,
      userId,
      role,
      eventId,
      eventCategoryId,
      festId,
      currentEventIds
    ),
  approveSuperAdmin: (
    requestId: number,
    userId: string,
    role: string,
    festId?: string | null,
    eventCategoryId?: string | null
  ) =>
    approveSuperAdminAction(
      set,
      requestId,
      userId,
      role,
      festId,
      eventCategoryId
    ),
  rejectRequest: (requestId: number) => rejectRequestAction(set, requestId),
}));
