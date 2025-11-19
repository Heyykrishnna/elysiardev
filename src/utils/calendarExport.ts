import { CalendarEvent } from '@/types/calendar';
import { format, parseISO } from 'date-fns';

/**
 * Generate ICS (iCalendar) format for events export
 */
export const generateICS = (events: CalendarEvent[], calendarName = 'My Calendar'): string => {
  const icsHeader = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Elysiar//Calendar//EN',
    `X-WR-CALNAME:${calendarName}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ].join('\r\n');

  const icsFooter = 'END:VCALENDAR';

  const icsEvents = events.map(event => {
    const startDate = event.event_time 
      ? format(parseISO(`${event.event_date}T${event.event_time}`), "yyyyMMdd'T'HHmmss")
      : format(parseISO(event.event_date), 'yyyyMMdd');
    
    const endDate = event.end_time
      ? format(parseISO(`${event.event_date}T${event.end_time}`), "yyyyMMdd'T'HHmmss")
      : event.event_time
        ? format(parseISO(`${event.event_date}T${event.event_time}`).getTime() + 60 * 60 * 1000, "yyyyMMdd'T'HHmmss")
        : format(parseISO(event.event_date).getTime() + 24 * 60 * 60 * 1000, 'yyyyMMdd');

    const eventLines = [
      'BEGIN:VEVENT',
      `UID:${event.id}@quizoasis.com`,
      `DTSTART${event.event_time ? '' : ';VALUE=DATE'}:${startDate}`,
      `DTEND${event.event_time ? '' : ';VALUE=DATE'}:${endDate}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `CATEGORIES:${event.event_type.toUpperCase()}`,
      `STATUS:${event.status?.toUpperCase() || 'CONFIRMED'}`,
      `PRIORITY:${getPriorityNumber(event.priority)}`,
      `CREATED:${format(parseISO(event.created_at), "yyyyMMdd'T'HHmmss'Z'")}`,
      `LAST-MODIFIED:${format(parseISO(event.updated_at), "yyyyMMdd'T'HHmmss'Z'")}`,
      'END:VEVENT',
    ];

    return eventLines.join('\r\n');
  }).join('\r\n');

  return [icsHeader, icsEvents, icsFooter].join('\r\n');
};

/**
 * Convert priority to RFC5545 priority number
 */
const getPriorityNumber = (priority: string): number => {
  switch (priority) {
    case 'urgent': return 1;
    case 'high': return 4;
    case 'normal': return 5;
    case 'low': return 9;
    default: return 5;
  }
};

/**
 * Download ICS file
 */
export const downloadICS = (events: CalendarEvent[], filename = 'calendar.ics'): void => {
  const icsContent = generateICS(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate CSV format for events export
 */
export const generateCSV = (events: CalendarEvent[]): string => {
  const headers = [
    'Title',
    'Description',
    'Date',
    'Time',
    'End Time',
    'Type',
    'Priority',
    'Status',
    'Color',
    'Created',
    'Updated'
  ];

  const csvRows = events.map(event => [
    `"${event.title.replace(/"/g, '""')}"`,
    `"${(event.description || '').replace(/"/g, '""')}"`,
    event.event_date,
    event.event_time || '',
    event.end_time || '',
    event.event_type,
    event.priority,
    event.status,
    event.color,
    event.created_at,
    event.updated_at
  ]);

  return [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (events: CalendarEvent[], filename = 'calendar.csv'): void => {
  const csvContent = generateCSV(events);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate Google Calendar URL for single event
 */
export const generateGoogleCalendarURL = (event: CalendarEvent): string => {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description || '',
    dates: event.event_time 
      ? `${event.event_date.replace(/-/g, '')}T${event.event_time.replace(':', '')}00/${event.end_time ? event.event_date.replace(/-/g, '') + 'T' + event.end_time.replace(':', '') + '00' : ''}`
      : `${event.event_date.replace(/-/g, '')}/${event.event_date.replace(/-/g, '')}`,
  });

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generate Outlook Calendar URL for single event
 */
export const generateOutlookURL = (event: CalendarEvent): string => {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  const params = new URLSearchParams({
    subject: event.title,
    body: event.description || '',
    startdt: event.event_time 
      ? parseISO(`${event.event_date}T${event.event_time}`).toISOString()
      : parseISO(event.event_date).toISOString(),
    enddt: event.end_time
      ? parseISO(`${event.event_date}T${event.end_time}`).toISOString()
      : event.event_time
        ? new Date(parseISO(`${event.event_date}T${event.event_time}`).getTime() + 60 * 60 * 1000).toISOString()
        : new Date(parseISO(event.event_date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    allday: event.event_time ? 'false' : 'true',
  });

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Share event via Web Share API (if available) or copy to clipboard
 */
export const shareEvent = async (event: CalendarEvent): Promise<void> => {
  const shareData = {
    title: event.title,
    text: `${event.title}\n${format(parseISO(event.event_date), 'MMMM dd, yyyy')}${event.event_time ? ` at ${event.event_time}` : ''}\n${event.description || ''}`,
    url: window.location.href,
  };

  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.error('Error sharing event:', error);
      // Fallback to clipboard
      await copyEventToClipboard(event);
    }
  } else {
    // Fallback to clipboard
    await copyEventToClipboard(event);
  }
};

/**
 * Copy event details to clipboard
 */
export const copyEventToClipboard = async (event: CalendarEvent): Promise<void> => {
  const eventText = `${event.title}\n${format(parseISO(event.event_date), 'MMMM dd, yyyy')}${event.event_time ? ` at ${event.event_time}` : ''}\n${event.description || ''}`;
  
  try {
    await navigator.clipboard.writeText(eventText);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = eventText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

/**
 * Generate calendar statistics for export
 */
export const generateCalendarStats = (events: CalendarEvent[]) => {
  const stats = {
    totalEvents: events.length,
    eventsByType: {} as Record<string, number>,
    eventsByPriority: {} as Record<string, number>,
    eventsByMonth: {} as Record<string, number>,
    upcomingEvents: 0,
    overdueEvents: 0,
  };

  const now = new Date();
  const nowString = format(now, 'yyyy-MM-dd');

  events.forEach(event => {
    // Count by type
    stats.eventsByType[event.event_type] = (stats.eventsByType[event.event_type] || 0) + 1;
    
    // Count by priority
    stats.eventsByPriority[event.priority] = (stats.eventsByPriority[event.priority] || 0) + 1;
    
    // Count by month
    const monthKey = format(parseISO(event.event_date), 'yyyy-MM');
    stats.eventsByMonth[monthKey] = (stats.eventsByMonth[monthKey] || 0) + 1;
    
    // Count upcoming/overdue
    if (event.event_date > nowString) {
      stats.upcomingEvents++;
    } else if (event.event_date < nowString) {
      stats.overdueEvents++;
    }
  });

  return stats;
};