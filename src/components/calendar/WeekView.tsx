import React, { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  differenceInMinutes,
  addMinutes
} from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent, EVENT_TYPE_CONFIG, generateTimeSlots } from '@/types/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, time: string) => void;
}

const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { weekDays, timeSlots, eventsByDay } = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const slots = generateTimeSlots(6, 23, 30); // 6 AM to 11 PM, 30-minute slots
    
    // Group events by day
    const grouped: Record<string, CalendarEvent[]> = {};
    days.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      grouped[dateKey] = events.filter(event => event.event_date === dateKey);
      
      // Sort by time
      grouped[dateKey].sort((a, b) => {
        if (!a.event_time && !b.event_time) return 0;
        if (!a.event_time) return -1;
        if (!b.event_time) return 1;
        return a.event_time.localeCompare(b.event_time);
      });
    });

    return { weekDays: days, timeSlots: slots, eventsByDay: grouped };
  }, [currentDate, events]);

  // Auto-scroll to current time
  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = new Date().getHours();
      const scrollPosition = Math.max(0, (currentHour - 6) * 120 - 200); // 120px per hour, with offset
      scrollRef.current.scrollTop = scrollPosition;
    }
  }, [currentDate]);

  const getEventPosition = (event: CalendarEvent, dayWidth: number) => {
    if (!event.event_time) return null;

    const startTime = parseISO(`2000-01-01T${event.event_time}`);
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const startHour = 6 * 60; // 6 AM in minutes
    
    if (startMinutes < startHour) return null; // Before visible hours

    const top = ((startMinutes - startHour) / 30) * 60; // 60px per 30-minute slot
    
    // Calculate duration
    let duration = 60; // Default 1 hour
    if (event.end_time) {
      const endTime = parseISO(`2000-01-01T${event.end_time}`);
      duration = differenceInMinutes(endTime, startTime);
    }
    
    const height = Math.max((duration / 30) * 60, 30); // Minimum 30px height

    return { top, height };
  };

  const handleTimeSlotClick = (day: Date, timeSlot: { time: string }) => {
    onTimeSlotClick(day, timeSlot.time);
  };

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm">
      {/* Week Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="grid grid-cols-8 gap-0">
          {/* Time Column Header */}
          <div className="p-4 border-r border-border/50">
            <div className="text-xs text-muted-foreground font-medium">
              {format(currentDate, 'MMM yyyy')}
            </div>
          </div>
          
          {/* Day Headers */}
          {weekDays.map((day, index) => {
            const isDayToday = isToday(day);
            
            return (
              <motion.div
                key={day.toISOString()}
                className={cn(
                  "p-4 text-center border-r border-border/50 last:border-r-0",
                  isDayToday && "bg-primary/5"
                )}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    {WEEKDAYS_SHORT[index]}
                  </div>
                  <motion.div
                    className={cn(
                      "text-lg font-semibold mx-auto w-8 h-8 rounded-full flex items-center justify-center",
                      isDayToday 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "text-foreground hover:bg-accent/20 transition-colors"
                    )}
                    whileHover={{ scale: 1.1 }}
                  >
                    {format(day, 'd')}
                  </motion.div>
                </div>
                
                {/* All-day events */}
                <div className="mt-2 space-y-1">
                  {eventsByDay[format(day, 'yyyy-MM-dd')]
                    ?.filter(event => !event.event_time)
                    .slice(0, 2)
                    .map((event, eventIndex) => (
                      <motion.div
                        key={event.id}
                        className="px-2 py-1 rounded-md cursor-pointer text-xs font-medium truncate hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: `${event.color}20`,
                          color: event.color,
                          borderLeft: `2px solid ${event.color}`,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (index * 0.05) + (eventIndex * 0.1) }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">
                            {EVENT_TYPE_CONFIG[event.event_type].icon}
                          </span>
                          <span className="truncate">{event.title}</span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="relative">
            {/* Time Grid */}
            <div className="grid grid-cols-8 gap-0">
              {/* Time Labels Column */}
              <div className="border-r border-border/50 bg-background/60">
                {timeSlots.map((slot, index) => (
                  <div
                    key={slot.time}
                    className={cn(
                      "h-15 px-3 py-2 border-b border-border/30 text-xs text-muted-foreground font-medium",
                      index % 2 === 0 && "bg-muted/10"
                    )}
                  >
                    {slot.label}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDays.map((day, dayIndex) => {
                const dayEvents = eventsByDay[format(day, 'yyyy-MM-dd')] || [];
                const timedEvents = dayEvents.filter(event => event.event_time);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "relative border-r border-border/50 last:border-r-0",
                      isDayToday && "bg-primary/[0.02]"
                    )}
                  >
                    {/* Time Slots */}
                    {timeSlots.map((slot, slotIndex) => (
                      <motion.div
                        key={slot.time}
                        className={cn(
                          "h-15 border-b border-border/30 hover:bg-accent/10 cursor-pointer group transition-colors relative",
                          slotIndex % 2 === 0 && "bg-muted/[0.02]"
                        )}
                        whileHover={{ backgroundColor: 'rgba(var(--primary), 0.05)' }}
                        onClick={() => handleTimeSlotClick(day, slot)}
                      >
                        {/* Hour line */}
                        {slot.time.endsWith('00') && (
                          <div className="absolute top-0 left-0 right-0 h-px bg-border/50" />
                        )}
                        
                        {/* Quick add hint */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-xs text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded-md shadow-sm">
                            + Add event
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Timed Events */}
                    <div className="absolute inset-0 p-1">
                      {timedEvents.map((event, eventIndex) => {
                        const position = getEventPosition(event, 150);
                        if (!position) return null;

                        return (
                          <motion.div
                            key={event.id}
                            className={cn(
                              "absolute left-1 right-1 rounded-lg p-2 cursor-pointer shadow-sm border-l-4 overflow-hidden group/event",
                              "hover:shadow-md hover:scale-[1.02] transition-all duration-200 z-10"
                            )}
                            style={{
                              top: position.top,
                              height: position.height,
                              backgroundColor: `${event.color}15`,
                              borderLeftColor: event.color,
                              minHeight: '30px',
                            }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (dayIndex * 0.05) + (eventIndex * 0.1) }}
                            onClick={() => onEventClick(event)}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="h-full flex flex-col justify-start">
                              <div className="flex items-center space-x-1 mb-1">
                                <span className="text-sm group-hover/event:animate-bounce">
                                  {EVENT_TYPE_CONFIG[event.event_type].icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div 
                                    className="font-semibold text-sm truncate leading-tight"
                                    style={{ color: event.color }}
                                  >
                                    {event.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {event.event_time && format(parseISO(`2000-01-01T${event.event_time}`), 'h:mm a')}
                                    {event.end_time && ' - ' + format(parseISO(`2000-01-01T${event.end_time}`), 'h:mm a')}
                                  </div>
                                </div>
                              </div>
                              
                              {position.height > 50 && event.description && (
                                <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                  {event.description}
                                </div>
                              )}

                              {/* Priority indicator */}
                              {event.priority !== 'normal' && (
                                <div className="absolute top-1 right-1">
                                  <div 
                                    className={cn(
                                      "w-2 h-2 rounded-full",
                                      event.priority === 'urgent' && "bg-red-500",
                                      event.priority === 'high' && "bg-orange-500",
                                      event.priority === 'low' && "bg-gray-400"
                                    )}
                                  />
                                </div>
                              )}
                            </div>
                            
                            {/* Hover overlay */}
                            <motion.div
                              className="absolute inset-0 bg-white/10 opacity-0 group-hover/event:opacity-100 transition-opacity rounded-lg"
                              initial={false}
                            />
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Current time indicator */}
                    {isDayToday && (
                      <CurrentTimeIndicator />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

// Current time indicator component
const CurrentTimeIndicator: React.FC = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  
  // Only show during business hours (6 AM to 11 PM)
  if (currentHour < 6 || currentHour >= 23) return null;

  const totalMinutes = (currentHour - 6) * 60 + currentMinute;
  const topPosition = (totalMinutes / 30) * 60; // 60px per 30-minute slot

  return (
    <motion.div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: topPosition }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center">
        <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-md shadow-lg font-medium">
          {format(currentTime, 'h:mm a')}
        </div>
        <div className="flex-1 h-0.5 bg-red-500 shadow-lg"></div>
        <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg"></div>
      </div>
    </motion.div>
  );
};