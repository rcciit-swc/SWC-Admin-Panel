import { getUserData } from '@/utils/functions';

export const populateUserDetails = async (set: any) => {
  set({ userLoading: true });
  const data = await getUserData();
  if (data) {
    set({ userData: data.data, userLoading: false });
  } else {
    set({ userLoading: false });
  }
};
