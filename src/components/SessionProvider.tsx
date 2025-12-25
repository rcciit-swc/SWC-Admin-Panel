'use client';

import { useUser } from '@/lib/stores/user';
import { useEvents } from '@/lib/stores';
import { useEffect } from 'react';

const SessionProvider = () => {
  const setUser = useUser((state) => state.setUserData);
  const setEvent = useEvents((state) => state.setEventsData);

  useEffect(() => {
    setUser();
    setEvent(true);
  }, [setUser]);

  return null;
};

export default SessionProvider;
