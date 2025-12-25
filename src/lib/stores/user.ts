import { create } from 'zustand';
import { populateUserDetails } from '../actions';

const userState = {
  userData: null,
  userLoading: false,
};
export const useUser = create<
  typeof userState & {
    setUserData: () => void;
    clearUserData: () => void;
  }
>((set) => ({
  ...userState,
  setUserData: () => populateUserDetails(set),
  clearUserData: () => set({ userData: null, userLoading: false }),
}));
