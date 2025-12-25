export interface UserRole {
  id: string;
  user_id: string;
  created_at: string;
  role: string;
  event_category_id: string | null;
  event_id: string | null;
  granted_by?: string | null;
  user_name?: string;
  user_email?: string;
  event_name?: string;
  category_name?: string;
  fest_name?: string;
}

export interface RolesStateType {
  userRoles: UserRole[];
  rolesLoading: boolean;
}

export interface RolesActionsType {
  getUserRoles: () => Promise<void>;
  removeRole: (userId: string, roleId: string) => Promise<boolean>;
  removeAllRoles: (userId: string) => Promise<boolean>;
}
