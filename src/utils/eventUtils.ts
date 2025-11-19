import { CalendarEvent } from "@/types/calendar";

export interface ParsedClassInfo {
  instructor_name?: string;
  location?: string;
  duration_minutes?: number;
  max_students?: number;
  original_description?: string;
}

// Parse class information from event description
export const parseClassInfo = (event: CalendarEvent): ParsedClassInfo => {
  if (!event.description) {
    return {};
  }

  const lines = event.description.split('\n');
  const info: ParsedClassInfo = {};
  let originalDescLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('Instructor: ')) {
      info.instructor_name = trimmedLine.replace('Instructor: ', '');
    } else if (trimmedLine.startsWith('Location: ')) {
      info.location = trimmedLine.replace('Location: ', '');
    } else if (trimmedLine.startsWith('Duration: ')) {
      const durationMatch = trimmedLine.match(/Duration: (\d+) minutes/);
      if (durationMatch) {
        info.duration_minutes = parseInt(durationMatch[1]);
      }
    } else if (trimmedLine.startsWith('Max Students: ')) {
      const maxStudentsMatch = trimmedLine.match(/Max Students: (\d+)/);
      if (maxStudentsMatch) {
        info.max_students = parseInt(maxStudentsMatch[1]);
      }
    } else if (trimmedLine && !trimmedLine.includes(': ')) {
      // This is likely part of the original description
      originalDescLines.push(trimmedLine);
    }
  }

  if (originalDescLines.length > 0) {
    info.original_description = originalDescLines.join(' ');
  }

  return info;
};

// Create enhanced event object with parsed class info
export const enhanceClassEvent = (event: CalendarEvent): CalendarEvent & ParsedClassInfo => {
  const classInfo = parseClassInfo(event);
  return {
    ...event,
    ...classInfo
  };
};

// Get duration with fallback
export const getEventDuration = (event: CalendarEvent): number => {
  const classInfo = parseClassInfo(event);
  return classInfo.duration_minutes || 60; // Default to 60 minutes
};

// Get instructor name with fallback
export const getEventInstructor = (event: CalendarEvent): string | undefined => {
  const classInfo = parseClassInfo(event);
  return classInfo.instructor_name;
};

// Get location with fallback
export const getEventLocation = (event: CalendarEvent): string | undefined => {
  const classInfo = parseClassInfo(event);
  return classInfo.location;
};

// Get max students with fallback
export const getEventMaxStudents = (event: CalendarEvent): number => {
  const classInfo = parseClassInfo(event);
  return classInfo.max_students || 100; // Default to 100
};