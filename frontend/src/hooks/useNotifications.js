import { useEffect, useState, useCallback } from 'react';
import { notificationAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    if (!user) return;
    notificationAPI.getUnreadCount()
      .then(({ data }) => setUnreadCount(data.count || 0))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (loading || !user) return;
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh, loading, user]);

  return { unreadCount, refresh };
}
