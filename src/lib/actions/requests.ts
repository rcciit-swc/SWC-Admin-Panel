import {
  getRoleRequests,
  approveEventForUser,
  approveSuperAdminRequest,
  rejectRoleRequest,
} from '@/utils/functions/requestsUtils';

export const populateRequests = async (set: any) => {
  set({ requestsLoading: true });
  const data = await getRoleRequests();
  set({ requests: data || [], requestsLoading: false });
};

export const approveEventAction = async (
  set: any,
  requestId: number,
  userId: string,
  role: string,
  eventId: string,
  eventCategoryId: string | null,
  festId: string | null,
  currentEventIds: string[]
) => {
  console.log('approveEventAction params:', {
    requestId,
    userId,
    role,
    eventId,
    eventCategoryId,
    festId,
    currentEventIds
  });

  const success = await approveEventForUser(
    requestId,
    userId,
    role,
    eventId,
    eventCategoryId,
    festId,
    currentEventIds
  );

  if (success) {
    // Refresh requests list
    await populateRequests(set);
  }

  return success;
};

export const approveSuperAdminAction = async (
  set: any,
  requestId: number,
  userId: string,
  role: string,
  festId?: string | null,
  eventCategoryId?: string | null
) => {
  const success = await approveSuperAdminRequest(
    requestId,
    userId,
    role,
    eventCategoryId
  );

  if (success) {
    // Refresh requests list
    await populateRequests(set);
  }

  return success;
};

export const rejectRequestAction = async (set: any, requestId: number) => {
  const success = await rejectRoleRequest(requestId);

  if (success) {
    // Refresh requests list
    await populateRequests(set);
  }

  return success;
};
