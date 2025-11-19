import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface HourGridProps {
  startHour?: number;
  endHour?: number;
  onSlotClick?: (hour: number, minute: number) => void;
  isOwner?: boolean;
}

export const HourGrid: React.FC<HourGridProps> = ({
  startHour = 0,
  endHour = 24,
  onSlotClick,
  isOwner = false,
}) => {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => i + startHour);

  return (
    <div className="relative">
      {hours.map((hour) => (
        <div
          key={hour}
          className={cn(
            "relative border-t border-border/30 hover:bg-accent/5 transition-colors",
            "h-16 group"
          )}
        >
          {/* Hour label */}
          <div className="absolute -left-16 top-0 w-14 text-xs text-muted-foreground text-right pr-2 -mt-2.5">
            {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
          </div>

          {/* Hour slot - clickable for creating events */}
          {isOwner && onSlotClick && (
            <>
              <button
                onClick={() => onSlotClick(hour, 0)}
                className="absolute inset-0 w-full h-8 hover:bg-primary/5 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer border-b border-border/10"
                aria-label={`Create event at ${format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}`}
              >
                <span className="text-xs text-primary opacity-0 group-hover:opacity-100">
                  + Add event
                </span>
              </button>
              <button
                onClick={() => onSlotClick(hour, 30)}
                className="absolute bottom-0 w-full h-8 hover:bg-primary/5 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                aria-label={`Create event at ${format(new Date().setHours(hour, 30, 0, 0), 'h:mm a')}`}
              >
                <span className="text-xs text-primary opacity-0 group-hover:opacity-100">
                  + Add event
                </span>
              </button>
            </>
          )}

          {/* 30-minute divider line */}
          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-border/20" />
        </div>
      ))}
    </div>
  );
};
