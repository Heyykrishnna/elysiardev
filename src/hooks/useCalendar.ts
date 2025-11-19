import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  CalendarEvent, 
  CalendarFilter, 
  CalendarView, 
  ViewType, 
  QuickAddEvent,
  EVENT_TYPE_CONFIG 
} from '@/types/calendar';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  startOfDay, 
  endOfDay,
  addDays,
  addWeeks,
  addMonths,
  format,
  isSameDay,
  isWithinInterval,
  parseISO
} from 'date-fns';

// Enhanced Events Hook with filtering and search
export const useCalendarEvents = (filter?: CalendarFilter) => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['calendar-events', filter, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      // Apply visibility filtering based on user role
      if (profile?.role === 'owner') {
        // Owners can see all events (no additional filter needed)
      } else {
        // Students can only see:
        // 1. Public events (created by owners)
        // 2. Their own private events
        query = query.or(`visibility.eq.public,and(visibility.eq.private,owner_id.eq.${user.id})`);
      }

      // Apply other filters
      if (filter?.event_types?.length) {
        query = query.in('event_type', filter.event_types);
      }

      if (filter?.date_range) {
        query = query
          .gte('event_date', filter.date_range.start)
          .lte('event_date', filter.date_range.end);
      }

      if (filter?.search_query && filter.search_query.trim()) {
        const searchTerm = filter.search_query.trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch calendar events',
          variant: 'destructive',
        });
        throw error;
      }

      // Transform legacy events to new format
      return (data || []).map((event: any) => ({
        ...event,
        priority: EVENT_TYPE_CONFIG[event.event_type as keyof typeof EVENT_TYPE_CONFIG]?.priority || 'normal',
        status: 'confirmed',
        is_all_day: !event.event_time,
        is_recurring: false,
        visibility: event.visibility || 'public', // Default for legacy events
      })) as CalendarEvent[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Calendar View Hook
export const useCalendarView = (initialView: ViewType = 'month') => {
  const [view, setView] = useState<CalendarView>({
    type: initialView,
    current_date: new Date(),
    start_date: new Date(),
    end_date: new Date(),
  });

  const updateView = useCallback((newView: Partial<CalendarView>) => {
    setView(prev => {
      const updated = { ...prev, ...newView };
      
      // Calculate start and end dates based on view type and current date
      switch (updated.type) {
        case 'month':
          updated.start_date = startOfWeek(startOfMonth(updated.current_date));
          updated.end_date = endOfWeek(endOfMonth(updated.current_date));
          break;
        case 'week':
          updated.start_date = startOfWeek(updated.current_date);
          updated.end_date = endOfWeek(updated.current_date);
          break;
        case 'day':
          updated.start_date = startOfDay(updated.current_date);
          updated.end_date = endOfDay(updated.current_date);
          break;
        case 'agenda':
          updated.start_date = startOfDay(updated.current_date);
          updated.end_date = addDays(updated.current_date, 30); // 30 days ahead
          break;
        case 'timeline':
          updated.start_date = startOfWeek(updated.current_date);
          updated.end_date = endOfWeek(addWeeks(updated.current_date, 3)); // 4 weeks
          break;
        case 'year':
          updated.start_date = startOfMonth(new Date(updated.current_date.getFullYear(), 0, 1));
          updated.end_date = endOfMonth(new Date(updated.current_date.getFullYear(), 11, 31));
          break;
      }
      
      return updated;
    });
  }, []);

  const navigate = useCallback((direction: 'prev' | 'next' | 'today') => {
    setView(prev => {
      let newDate = prev.current_date;
      
      switch (direction) {
        case 'today':
          newDate = new Date();
          break;
        case 'prev':
          switch (prev.type) {
            case 'month':
              newDate = addMonths(prev.current_date, -1);
              break;
            case 'week':
              newDate = addWeeks(prev.current_date, -1);
              break;
            case 'day':
              newDate = addDays(prev.current_date, -1);
              break;
            default:
              newDate = addWeeks(prev.current_date, -1);
          }
          break;
        case 'next':
          switch (prev.type) {
            case 'month':
              newDate = addMonths(prev.current_date, 1);
              break;
            case 'week':
              newDate = addWeeks(prev.current_date, 1);
              break;
            case 'day':
              newDate = addDays(prev.current_date, 1);
              break;
            default:
              newDate = addWeeks(prev.current_date, 1);
          }
          break;
      }
      
      const updated = { ...prev, current_date: newDate };
      
      // Recalculate date ranges
      switch (updated.type) {
        case 'month':
          updated.start_date = startOfWeek(startOfMonth(newDate));
          updated.end_date = endOfWeek(endOfMonth(newDate));
          break;
        case 'week':
          updated.start_date = startOfWeek(newDate);
          updated.end_date = endOfWeek(newDate);
          break;
        case 'day':
          updated.start_date = startOfDay(newDate);
          updated.end_date = endOfDay(newDate);
          break;
        case 'agenda':
          updated.start_date = startOfDay(newDate);
          updated.end_date = addDays(newDate, 30);
          break;
        case 'timeline':
          updated.start_date = startOfWeek(newDate);
          updated.end_date = endOfWeek(addWeeks(newDate, 3));
          break;
        case 'year':
          updated.start_date = startOfMonth(new Date(newDate.getFullYear(), 0, 1));
          updated.end_date = endOfMonth(new Date(newDate.getFullYear(), 11, 31));
          break;
      }
      
      return updated;
    });
  }, []);

  return {
    view,
    updateView,
    navigate,
  };
};

// Events for current view
export const useViewEvents = (view: CalendarView, filter?: CalendarFilter) => {
  const dateRangeFilter: CalendarFilter = {
    ...filter,
    date_range: {
      start: format(view.start_date, 'yyyy-MM-dd'),
      end: format(view.end_date, 'yyyy-MM-dd'),
    },
  };

  const { data: events, isLoading } = useCalendarEvents(dateRangeFilter);

  const eventsInView = useMemo(() => {
    if (!events) return [];
    
    return events.filter(event => {
      const eventDate = parseISO(event.event_date);
      return isWithinInterval(eventDate, {
        start: view.start_date,
        end: view.end_date,
      });
    });
  }, [events, view]);

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    
    eventsInView.forEach(event => {
      const dateKey = event.event_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    // Sort events within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        if (!a.event_time && !b.event_time) return 0;
        if (!a.event_time) return -1;
        if (!b.event_time) return 1;
        return a.event_time.localeCompare(b.event_time);
      });
    });
    
    return grouped;
  }, [eventsInView]);

  return {
    events: eventsInView,
    eventsByDate,
    isLoading,
  };
};

// Event CRUD operations
export const useEventOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: async (eventData: Partial<CalendarEvent>) => {
      if (!user) throw new Error('User not authenticated');

      // Get user profile to determine role and set visibility
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const visibility = profile?.role === 'owner' ? 'public' : 'private';

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title!,
          description: eventData.description,
          event_date: eventData.event_date!,
          event_time: eventData.event_time,
          end_time: eventData.end_time,
          event_type: eventData.event_type!,
          color: eventData.color || EVENT_TYPE_CONFIG[eventData.event_type! as keyof typeof EVENT_TYPE_CONFIG]?.color,
          owner_id: user.id,
          visibility,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.event_date,
          event_time: eventData.event_time,
          end_time: eventData.end_time,
          event_type: eventData.event_type,
          color: eventData.color,
          visibility: eventData.visibility,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    },
  });

  const duplicateEvent = useMutation({
    mutationFn: async (event: CalendarEvent) => {
      if (!user) throw new Error('User not authenticated');

      // Get user profile to determine role and set visibility
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const visibility = profile?.role === 'owner' ? 'public' : 'private';

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: `${event.title} (Copy)`,
          description: event.description,
          event_date: event.event_date,
          event_time: event.event_time,
          end_time: event.end_time,
          event_type: event.event_type,
          color: event.color,
          owner_id: user.id,
          visibility,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Success',
        description: 'Event duplicated successfully',
      });
    },
  });

  // Quick add event
  const quickAdd = useMutation({
    mutationFn: async (quickEvent: QuickAddEvent) => {
      if (!user) throw new Error('User not authenticated');

      // Get user profile to determine role and set visibility
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const visibility = profile?.role === 'owner' ? 'public' : 'private';

      const endTime = quickEvent.time && quickEvent.duration 
        ? format(new Date(`2000-01-01T${quickEvent.time}`).getTime() + quickEvent.duration * 60000, 'HH:mm')
        : undefined;

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: quickEvent.title,
          event_date: quickEvent.date,
          event_time: quickEvent.time,
          end_time: endTime,
          event_type: 'other',
          color: EVENT_TYPE_CONFIG.other.color,
          owner_id: user.id,
          visibility,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Success',
        description: 'Quick event added successfully',
      });
    },
  });

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    quickAdd,
  };
};

// Calendar statistics
export const useCalendarStats = (dateRange?: { start: Date; end: Date }) => {
  const filter = dateRange ? {
    date_range: {
      start: format(dateRange.start, 'yyyy-MM-dd'),
      end: format(dateRange.end, 'yyyy-MM-dd'),
    }
  } : undefined;

  const { data: events } = useCalendarEvents(filter);

  const stats = useMemo(() => {
    if (!events) {
      return {
        total: 0,
        byType: {},
        byPriority: {},
        upcomingCount: 0,
        todayCount: 0,
      };
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    events.forEach(event => {
      // Count by type
      byType[event.event_type] = (byType[event.event_type] || 0) + 1;
      
      // Count by priority
      byPriority[event.priority] = (byPriority[event.priority] || 0) + 1;
    });

    return {
      total: events.length,
      byType,
      byPriority,
      upcomingCount: events.filter(e => e.event_date > today).length,
      todayCount: events.filter(e => e.event_date === today).length,
    };
  }, [events]);

  return stats;
};