export interface RoleRequest {
  id: number;
  created_at: string;
  user_id: string;
  requester_email: string;
  role: string;
  event_ids: string[] | null;
  event_category_id: string | null;
  fest_id: string | null;
  user_name?: string;
  fest_name?: string;
  category_name?: string;
  event_names?: string[];
}

export interface EventDetail {
  id: string;
  name: string;
}

export interface RequestsStateType {
  requests: RoleRequest[];
  requestsLoading: boolean;
}

export interface RequestsActionsType {
  getRequests: () => Promise<void>;
  approveEvent: (
    requestId: number,
    userId: string,
    role: string,
    eventId: string,
    eventCategoryId: string | null,
    festId: string | null,
    currentEventIds: string[]
  ) => Promise<boolean>;
  approveSuperAdmin: (
    requestId: number,
    userId: string,
    role: string,
    festId?: string | null,
    eventCategoryId?: string | null
  ) => Promise<boolean>;
  rejectRequest: (requestId: number) => Promise<boolean>;
}
