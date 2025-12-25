import { create } from 'zustand';
import { RolesActionsType, RolesStateType } from '../types/roles';
import {
  populateUserRoles,
  removeRoleAction,
  removeAllRolesAction,
} from '../actions/roles';

type RolesStoreType = RolesStateType & RolesActionsType;

const rolesState: RolesStateType = {
  userRoles: [],
  rolesLoading: false,
};

export const useRoles = create<RolesStoreType>((set) => ({
  ...rolesState,
  getUserRoles: () => populateUserRoles(set),
  removeRole: (userId: string, roleId: string) =>
    removeRoleAction(set, userId, roleId),
  removeAllRoles: (userId: string) => removeAllRolesAction(set, userId),
}));
