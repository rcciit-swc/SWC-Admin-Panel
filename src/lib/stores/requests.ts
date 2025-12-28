import { create } from 'zustand';
import { RequestsActionsType, RequestsStateType } from '../types/requests';
import {
  populateRequests,
  approveEventAction,
  approveSuperAdminAction,
  rejectRequestAction,
} from '../actions/requests';

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
    eventCategoryId?: string | null
  ) => approveSuperAdminAction(set, requestId, userId, role, null, eventCategoryId),
  rejectRequest: (requestId: number) => rejectRequestAction(set, requestId),
}));
