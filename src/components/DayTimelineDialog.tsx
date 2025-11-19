import React, { useState, useEffect, useRef } from "react";
import { format, isSameDay, addDays, subDays, isToday } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/hooks/useEvents";
import { EventDetailsDialog } from "@/components/EventDetailsDialog";
import { HourGrid } from "@/components/calendar/HourGrid";
import { EventBlock } from "@/components/calendar/EventBlock";

interface DayTimelineDialogProps {
  date: Date | null;
  events: Event[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventClick: (event: Event) => void;
  onCreateEvent: (date: Date, hour?: number, minute?: number) => void;
}

const eventTypeIcons = {
  class: '📚',
  holiday: '🎉',
  exam: '📝',
  assignment: '📋',
  meeting: '👥',
  other: '📅',
};

export const DayTimelineDialog: React.FC<DayTimelineDialogProps> = ({
  date,
  events,
  open,
  onOpenChange,
  onEventClick,
  onCreateEvent,
}) => {
  const { profile } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [currentViewDate, setCurrentViewDate] = useState<Date>(date || new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);

  // Update current view date when date prop changes
  useEffect(() => {
    if (date) {
      setCurrentViewDate(date);
    }
  }, [date]);

  // Scroll to current time on mount if viewing today
  useEffect(() => {
    if (open && isToday(currentViewDate) && currentTimeRef.current) {
      setTimeout(() => {
        currentTimeRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }, [open, currentViewDate]);

  if (!date) return null;

  const isOwner = profile?.role === 'owner';
  
  // Get events for the selected date
  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.event_date), currentViewDate)
  );

  // Separate timed and all-day events
  const timedEvents = dayEvents.filter(event => event.event_time);
  const allDayEvents = dayEvents.filter(event => !event.event_time);

  const handleSlotClick = (hour: number, minute: number = 0) => {
    if (isOwner) {
      onCreateEvent(currentViewDate, hour, minute);
      onOpenChange(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
    onEventClick(event);
  };

  const handlePrevDay = () => {
    setCurrentViewDate(subDays(currentViewDate, 1));
  };

  const handleNextDay = () => {
    setCurrentViewDate(addDays(currentViewDate, 1));
  };

  const handleToday = () => {
    setCurrentViewDate(new Date());
  };

  // Current time indicator
  const CurrentTimeIndicator = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); // Update every minute

      return () => clearInterval(timer);
    }, []);

    if (!isToday(currentViewDate)) return null;

    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const topPosition = (currentHour * 60 + currentMinute) / 60 * 64; // 64px per hour

    return (
      <div
        ref={currentTimeRef}
        className="absolute left-0 right-0 z-50 pointer-events-none"
        style={{ top: `${topPosition}px` }}
      >
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-red-500 -ml-6 flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          <div className="flex-1 h-0.5 bg-red-500 shadow-lg" />
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:w-full max-w-6xl max-h-[92vh] flex flex-col p-0 gap-0 border-0 shadow-2xl bg-gradient-to-br from-card/95 via-card to-card/95 backdrop-blur-xl">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-border/50 bg-gradient-to-r from-background/50 to-accent/5">
            <DialogHeader className="p-6 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DialogTitle className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 shadow-lg">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      {format(currentViewDate, "EEEE, MMMM dd, yyyy")}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-normal flex items-center gap-2 mt-1">
                      <span className="inline-block w-2 h-2 bg-primary/60 rounded-full animate-pulse"></span>
                      {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} scheduled
                      {isToday(currentViewDate) && (
                        <Badge variant="secondary" className="ml-2 text-xs">Today</Badge>
                      )}
                    </div>
                  </div>
                </DialogTitle>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                    className="text-xs px-3 py-2 bg-gradient-to-r from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 border-accent/30 hover:border-accent/50"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Today
                  </Button>
                  <div className="flex gap-1 p-1 bg-muted/30 rounded-lg border border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrevDay}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNextDay}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  {isOwner && (
                    <Button
                      size="sm"
                      onClick={() => onCreateEvent(currentViewDate)}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="hidden xs:inline">Add </span>Event
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* All-day events section */}
            {allDayEvents.length > 0 && (
              <div className="px-6 pb-4">
                <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg border border-accent/30 p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    All Day Events
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allDayEvents.map(event => (
                      <button
                        key={event.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md border"
                        style={{
                          backgroundColor: `${event.color}20`,
                          borderColor: `${event.color}40`,
                          borderLeftWidth: '4px',
                          borderLeftColor: event.color,
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        <span className="text-base">{eventTypeIcons[event.event_type]}</span>
                        <span className="font-medium text-sm" style={{ color: event.color }}>
                          {event.title}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize ml-1" style={{ borderColor: event.color }}>
                          {event.event_type}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Content - Google Calendar Style */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full" ref={scrollRef}>
              <div className="p-6 pl-20">
                {dayEvents.length === 0 && !isOwner ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="text-6xl mb-4 opacity-50">📅</div>
                    <div className="text-lg text-muted-foreground mb-2">No events scheduled</div>
                    <div className="text-sm text-muted-foreground/70">
                      This day is free of scheduled events
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Hour grid background */}
                    <HourGrid 
                      startHour={0} 
                      endHour={24} 
                      onSlotClick={handleSlotClick}
                      isOwner={isOwner}
                    />
                    
                    {/* Events overlay */}
                    <div className="absolute top-0 left-16 right-0 pointer-events-none">
                      <div className="relative pointer-events-auto">
                        {timedEvents.map(event => (
                          <EventBlock
                            key={event.id}
                            event={event}
                            onClick={handleEventClick}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Current time indicator */}
                    <CurrentTimeIndicator />

                    {/* Empty state for owners */}
                    {timedEvents.length === 0 && isOwner && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center py-8 text-muted-foreground pointer-events-none">
                        <div className="text-4xl mb-4">🗓️</div>
                        <div className="text-lg mb-2">No timed events yet</div>
                        <div className="text-sm">
                          Click on any time slot to create an event
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <EventDetailsDialog
        event={selectedEvent}
        open={showEventDetails}
        onOpenChange={setShowEventDetails}
      />
    </>
  );
};
