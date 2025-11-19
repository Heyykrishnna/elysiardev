import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Event } from '@/hooks/useEvents';

interface EventBlockProps {
  event: Event;
  onClick: (event: Event) => void;
}

const eventTypeIcons = {
  class: '📚',
  holiday: '🎉',
  exam: '📝',
  assignment: '📋',
  meeting: '👥',
  other: '📅',
};

export const EventBlock: React.FC<EventBlockProps> = ({ event, onClick }) => {
  const getEventPosition = () => {
    if (!event.event_time) return null;

    const [hours, minutes] = event.event_time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    
    // Calculate duration (default 1 hour if no end time)
    let durationMinutes = 60;
    if (event.end_time) {
      const [endHours, endMinutes] = event.end_time.split(':').map(Number);
      const endTotalMinutes = endHours * 60 + endMinutes;
      durationMinutes = endTotalMinutes - startMinutes;
    }

    // Position from top (assuming we start from midnight)
    const top = (startMinutes / 60) * 64; // 64px per hour
    const height = Math.max((durationMinutes / 60) * 64, 40); // Minimum 40px height

    return { top, height };
  };

  const position = getEventPosition();
  
  if (!position) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 mx-1 rounded-lg border-l-4 p-2 cursor-pointer",
        "hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden",
        "bg-card/90 backdrop-blur-sm border border-border/50"
      )}
      style={{
        top: `${position.top}px`,
        height: `${position.height}px`,
        borderLeftColor: event.color,
        backgroundColor: `${event.color}15`,
      }}
      onClick={() => onClick(event)}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start gap-2 mb-1">
          <span className="text-sm flex-shrink-0">{eventTypeIcons[event.event_type]}</span>
          <div className="flex-1 min-w-0">
            <h4 
              className="font-semibold text-sm truncate leading-tight"
              style={{ color: event.color }}
            >
              {event.title}
            </h4>
            {event.event_time && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3" />
                <span>
                  {format(new Date(`2000-01-01T${event.event_time}`), 'h:mm a')}
                  {event.end_time && ` - ${format(new Date(`2000-01-01T${event.end_time}`), 'h:mm a')}`}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {position.height > 60 && event.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {event.description}
          </p>
        )}
        
        {position.height > 80 && (
          <div className="mt-auto pt-2">
            <Badge 
              variant="outline" 
              className="text-xs capitalize"
              style={{ borderColor: event.color, color: event.color }}
            >
              {event.event_type}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};
