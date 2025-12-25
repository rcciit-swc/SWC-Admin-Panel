import {
  getAllUserRoles,
  removeUserRole,
  removeAllUserRoles,
} from '@/utils/functions/rolesUtils';

export const populateUserRoles = async (set: any) => {
  set({ rolesLoading: true });
  const data = await getAllUserRoles();
  set({ userRoles: data || [], rolesLoading: false });
};

export const removeRoleAction = async (
  set: any,
  userId: string,
  roleId: string
) => {
  const success = await removeUserRole(userId, roleId);

  if (success) {
    // Refresh roles list
    await populateUserRoles(set);
  }

  return success;
};

export const removeAllRolesAction = async (set: any, userId: string) => {
  const success = await removeAllUserRoles(userId);

  if (success) {
    // Refresh roles list
    await populateUserRoles(set);
  }

  return success;
};
