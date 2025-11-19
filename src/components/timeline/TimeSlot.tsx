// DEPRECATED: This file is kept for backwards compatibility
// The new Google Calendar style uses HourGrid.tsx and EventBlock.tsx instead
import React from "react";
import { format, parse, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { Event } from "@/hooks/useEvents";
import { Badge } from "@/components/ui/badge";

interface TimeSlotProps {
  hour: number;
  events: Event[];
  onSlotClick: (hour: number, minute: number) => void;
  onEventClick: (event: Event) => void;
  className?: string;
}

const eventTypeIcons = {
  class: "📚",
  holiday: "🎉",
  exam: "📝",
  assignment: "📋",
  meeting: "👥",
  other: "📅",
};

export const TimeSlot: React.FC<TimeSlotProps> = ({
  hour,
  events,
  onSlotClick,
  onEventClick,
  className,
}) => {
  const timeString = `${hour.toString().padStart(2, "0")}:00`;
  const nextHourString = `${(hour + 1).toString().padStart(2, "0")}:00`;
  
  // Filter events that occur during this hour
  const hourEvents = events.filter(event => {
    if (!event.event_time) return false;
    
    const eventHour = parseInt(event.event_time.split(":")[0]);
    const eventMinute = parseInt(event.event_time.split(":")[1]);
    const eventStartInMinutes = eventHour * 60 + eventMinute;
    const slotStartInMinutes = hour * 60;
    const slotEndInMinutes = (hour + 1) * 60;
    
    // Check if event starts within this hour slot
    return eventStartInMinutes >= slotStartInMinutes && eventStartInMinutes < slotEndInMinutes;
  });

  const getEventPosition = (event: Event) => {
    if (!event.event_time) return { top: 0, height: 60 };
    
    const [eventHour, eventMinute] = event.event_time.split(":").map(Number);
    const minutesFromHourStart = eventMinute;
    const top = (minutesFromHourStart / 60) * 100; // Percentage from top of hour
    
    // Default event duration is 1 hour if no end time
    const duration = event.end_time ? 
      differenceInMinutes(
        parse(event.end_time, "HH:mm", new Date()),
        parse(event.event_time, "HH:mm", new Date())
      ) : 60;
    
    const height = Math.min((duration / 60) * 100, 100 - top); // Don't exceed hour boundary
    
    return { top, height: Math.max(height, 15) }; // Minimum 15% height for visibility
  };

  return (
    <div className={cn("relative border-b border-border/40", className)}>
      {/* Time label */}
      <div className="absolute -left-16 top-0 text-xs text-muted-foreground font-medium w-12 text-right">
        {format(parse(timeString, "HH:mm", new Date()), "h a")}
      </div>
      
      {/* Hour slot */}
      <div 
        className="min-h-[60px] relative hover:bg-accent/20 transition-colors cursor-pointer group border-l-2 border-transparent hover:border-primary/30"
        onClick={() => onSlotClick(hour, 0)}
      >
        {/* 15-minute subdivisions */}
        <div className="absolute inset-0">
          {[15, 30, 45].map(minute => (
            <div
              key={minute}
              className="absolute w-full border-t border-border/20 opacity-30 group-hover:opacity-60 transition-opacity"
              style={{ top: `${(minute / 60) * 100}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onSlotClick(hour, minute);
              }}
            />
          ))}
        </div>
        
        {/* Events in this slot */}
        <div className="absolute inset-0 pl-2 pr-1">
          {hourEvents.map((event, index) => {
            const position = getEventPosition(event);
            return (
              <div
                key={event.id}
                className="absolute left-2 right-1 rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg group/event z-10"
                style={{
                  top: `${position.top}%`,
                  height: `${position.height}%`,
                  backgroundColor: `${event.color}20`,
                  borderLeft: `4px solid ${event.color}`,
                  minHeight: '20px',
                  zIndex: 10 + index
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
              >
                <div className="flex items-start gap-2 h-full">
                  <span className="text-sm group-hover/event:animate-bounce flex-shrink-0">
                    {eventTypeIcons[event.event_type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: event.color }}>
                      {event.title}
                    </div>
                    {event.event_time && (
                      <div className="text-xs text-muted-foreground">
                        {format(parse(event.event_time, "HH:mm", new Date()), "h:mm a")}
                        {event.end_time && (
                          <>
                            {" - "}
                            {format(parse(event.end_time, "HH:mm", new Date()), "h:mm a")}
                          </>
                        )}
                      </div>
                    )}
                    {position.height > 40 && event.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Add event hint on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md shadow-sm">
            Click to add event
          </div>
        </div>
      </div>
    </div>
  );
};