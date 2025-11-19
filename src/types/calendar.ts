// Enhanced Calendar Types - Inspired by Google Calendar and ClickUp
export type ViewType = 'month' | 'week' | 'day' | 'agenda' | 'timeline' | 'year';
export type EventPriority = 'low' | 'normal' | 'high' | 'urgent';
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled' | 'draft';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type ReminderType = 'notification' | 'email' | 'sms';
export type EventVisibility = 'public' | 'private';

export interface CalendarEvent {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  end_time?: string;
  end_date?: string;
  event_type: 'class' | 'holiday' | 'exam' | 'assignment' | 'meeting' | 'personal' | 'work' | 'other';
  color: string;
  priority: EventPriority;
  status: EventStatus;
  location?: string;
  visibility: EventVisibility; // Controls who can see the event
  
  // Advanced features
  is_all_day: boolean;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  attendees?: EventAttendee[];
  reminders?: EventReminder[];
  tags?: string[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_modified_by?: string;
}

export interface RecurrencePattern {
  type: RecurrenceType;
  interval: number; // Every N days/weeks/months/years
  days_of_week?: number[]; // 0 = Sunday, 1 = Monday, etc.
  day_of_month?: number;
  week_of_month?: number;
  month_of_year?: number;
  end_date?: string;
  occurrence_count?: number;
}

export interface EventAttendee {
  id: string;
  email: string;
  name?: string;
  role: 'organizer' | 'required' | 'optional';
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
}

export interface EventReminder {
  id: string;
  type: ReminderType;
  minutes_before: number; // Minutes before event to remind
  message?: string;
}

export interface CalendarFilter {
  event_types?: string[];
  priorities?: EventPriority[];
  statuses?: EventStatus[];
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  search_query?: string;
}

export interface CalendarView {
  type: ViewType;
  current_date: Date;
  start_date: Date;
  end_date: Date;
}

export interface QuickAddEvent {
  title: string;
  date: string;
  time?: string;
  duration?: number; // in minutes
}

// Color schemes inspired by modern calendar apps
export const EVENT_COLORS = {
  // Primary colors
  blue: '#1976d2',
  red: '#d32f2f',
  green: '#388e3c',
  orange: '#f57c00',
  purple: '#7b1fa2',
  teal: '#00796b',
  indigo: '#303f9f',
  pink: '#c2185b',
  
  // Pastel variants
  lightBlue: '#64b5f6',
  lightRed: '#e57373',
  lightGreen: '#81c784',
  lightOrange: '#ffb74d',
  lightPurple: '#ba68c8',
  lightTeal: '#4db6ac',
  lightIndigo: '#7986cb',
  lightPink: '#f48fb1',
  
  // Dark variants
  darkBlue: '#0d47a1',
  darkRed: '#b71c1c',
  darkGreen: '#1b5e20',
  darkOrange: '#e65100',
  darkPurple: '#4a148c',
  darkTeal: '#004d40',
  darkIndigo: '#1a237e',
  darkPink: '#880e4f',
} as const;

export const EVENT_TYPE_CONFIG = {
  class: { 
    color: EVENT_COLORS.blue, 
    icon: '📚', 
    label: 'Class',
    priority: 'high' as EventPriority
  },
  exam: { 
    color: EVENT_COLORS.red, 
    icon: '📝', 
    label: 'Exam',
    priority: 'urgent' as EventPriority
  },
  assignment: { 
    color: EVENT_COLORS.orange, 
    icon: '📋', 
    label: 'Assignment',
    priority: 'high' as EventPriority
  },
  meeting: { 
    color: EVENT_COLORS.purple, 
    icon: '👥', 
    label: 'Meeting',
    priority: 'normal' as EventPriority
  },
  holiday: { 
    color: EVENT_COLORS.green, 
    icon: '🎉', 
    label: 'Holiday',
    priority: 'low' as EventPriority
  },
  personal: { 
    color: EVENT_COLORS.teal, 
    icon: '🏠', 
    label: 'Personal',
    priority: 'normal' as EventPriority
  },
  work: { 
    color: EVENT_COLORS.indigo, 
    icon: '💼', 
    label: 'Work',
    priority: 'normal' as EventPriority
  },
  other: { 
    color: EVENT_COLORS.pink, 
    icon: '📅', 
    label: 'Other',
    priority: 'normal' as EventPriority
  },
} as const;

export const PRIORITY_CONFIG = {
  low: { color: EVENT_COLORS.lightTeal, label: 'Low', weight: 1 },
  normal: { color: EVENT_COLORS.lightBlue, label: 'Normal', weight: 2 },
  high: { color: EVENT_COLORS.lightOrange, label: 'High', weight: 3 },
  urgent: { color: EVENT_COLORS.lightRed, label: 'Urgent', weight: 4 },
} as const;

// Helper functions for calendar calculations
export const generateTimeSlots = (
  startHour: number = 0,
  endHour: number = 24,
  intervalMinutes: number = 30
) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const label = new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      slots.push({ time, label });
    }
  }
  return slots;
};

export const getEventDuration = (event: CalendarEvent): number => {
  if (!event.event_time || !event.end_time) return 60; // Default 1 hour
  
  const start = new Date(`2000-01-01T${event.event_time}`);
  const end = new Date(`2000-01-01T${event.end_time}`);
  
  return Math.max((end.getTime() - start.getTime()) / (1000 * 60), 15); // Minimum 15 minutes
};

export const isEventOverlapping = (event1: CalendarEvent, event2: CalendarEvent): boolean => {
  if (event1.event_date !== event2.event_date) return false;
  if (!event1.event_time || !event1.end_time || !event2.event_time || !event2.end_time) return false;
  
  const start1 = new Date(`2000-01-01T${event1.event_time}`);
  const end1 = new Date(`2000-01-01T${event1.end_time}`);
  const start2 = new Date(`2000-01-01T${event2.event_time}`);
  const end2 = new Date(`2000-01-01T${event2.end_time}`);
  
  return start1 < end2 && start2 < end1;
};