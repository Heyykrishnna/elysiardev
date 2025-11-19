
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const { profile } = useAuth();
  const [newTestsCount, setNewTestsCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch recent tests (created in last 24 hours)
  const { data: recentTests } = useQuery({
    queryKey: ['recent-tests', profile?.id],
    queryFn: async () => {
      if (!profile || profile.role === 'owner') return [];

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('is_active', true)
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recent tests:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!profile && profile.role !== 'owner',
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch owner notifications for students
  const { data: ownerNotifications } = useQuery({
    queryKey: ['owner-notifications', profile?.id],
    queryFn: async () => {
      if (!profile || profile.role === 'owner') return [];

      // Try to fetch owner notifications, but don't fail if table doesn't exist
      try {
        const { data, error } = await supabase
          .from('owner_notifications')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching owner notifications:', error);
          return [];
        }

        return data || [];
      } catch (err) {
        console.log('Owner notifications table not available:', err);
        return [];
      }
    },
    enabled: !!profile && profile.role !== 'owner',
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    // For students, show new test availability
    const testNotifications = recentTests?.map(test => ({
      id: test.id,
      title: `New test available: ${test.title}`,
      description: test.description || 'A new test has been published',
      timestamp: test.created_at,
      type: 'new_test'
    })) || [];

    const ownerNotifs = ownerNotifications?.map(notification => ({
      id: notification.id,
      title: notification.title,
      description: notification.description || '',
      timestamp: notification.created_at,
      type: 'owner_notification'
    })) || [];

    const allNotifications = [...testNotifications, ...ownerNotifs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setNotifications(allNotifications);
    setNewTestsCount(allNotifications.length);
  }, [recentTests, ownerNotifications]);

  // Set up real-time subscription for new tests
  useEffect(() => {
    if (!profile || profile.role === 'owner') return;

    const channel = supabase
      .channel('new-tests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tests',
          filter: 'is_active=eq.true'
        },
        (payload) => {
          console.log('New test created:', payload);
          const newTest = payload.new;
          setNewTestsCount(prev => prev + 1);
          setNotifications(prev => [{
            id: newTest.id,
            title: `New test available: ${newTest.title}`,
            description: newTest.description || 'A new test has been published',
            timestamp: newTest.created_at,
            type: 'new_test'
          }, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'owner_notifications',
          filter: 'is_active=eq.true'
        },
        (payload) => {
          console.log('New owner notification created:', payload);
          const newNotification = payload.new;
          setNewTestsCount(prev => prev + 1);
          setNotifications(prev => [{
            id: newNotification.id,
            title: newNotification.title,
            description: newNotification.description || '',
            timestamp: newNotification.created_at,
            type: 'owner_notification'
          }, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const clearNotifications = () => {
    setNewTestsCount(0);
    setNotifications([]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    setNewTestsCount(prev => Math.max(0, prev - 1));
  };

  return {
    newTestsCount,
    notifications,
    clearNotifications,
    markAsRead
  };
};
