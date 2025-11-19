import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent, EVENT_TYPE_CONFIG } from '@/types/calendar';
import { Badge } from '@/components/ui/badge';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onEventCreate: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onEventCreate,
}) => {
  const { calendarDays, eventsByDate } = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    // Group events by date
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const dateKey = event.event_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    // Sort events within each date by priority and time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        // First by priority (urgent > high > normal > low)
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // Then by time
        if (!a.event_time && !b.event_time) return 0;
        if (!a.event_time) return -1;
        if (!b.event_time) return 1;
        return a.event_time.localeCompare(b.event_time);
      });
    });

    return { calendarDays: days, eventsByDate: grouped };
  }, [currentDate, events]);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  };

  const handleDateDoubleClick = (date: Date) => {
    onEventCreate(date);
  };

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-px bg-border/50 border-b border-border/50">
        {WEEKDAYS.map((day, index) => (
          <motion.div
            key={day}
            className="bg-background/80 backdrop-blur p-3 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="text-sm font-medium text-muted-foreground">
              {day}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-border/50">
        {calendarDays.map((day, dayIndex) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const dateString = format(day, 'yyyy-MM-dd');
          
          return (
            <motion.div
              key={day.toISOString()}
              className={cn(
                "bg-background/80 backdrop-blur-sm p-2 sm:p-3 min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] cursor-pointer group relative overflow-hidden",
                "hover:bg-background/95 hover:shadow-lg transition-all duration-300",
                !isCurrentMonth && "text-muted-foreground bg-muted/20",
                isDayToday && "bg-primary/5 border border-primary/20 shadow-inner"
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: dayIndex * 0.01,
                type: 'spring',
                stiffness: 400,
                damping: 25
              }}
              onClick={() => onDateClick(day)}
              onDoubleClick={() => handleDateDoubleClick(day)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-2">
                <motion.div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold transition-colors",
                    isDayToday 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : isCurrentMonth
                        ? "text-foreground group-hover:bg-accent/20"
                        : "text-muted-foreground"
                  )}
                  whileHover={{ scale: 1.1 }}
                >
                  {format(day, 'd')}
                </motion.div>
                
                {dayEvents.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs px-1.5 py-0.5 h-5",
                      dayEvents.some(e => e.priority === 'urgent') && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
                      dayEvents.some(e => e.priority === 'high') && "bg-orange-300 text-orange-900 dark:bg-orange-900/20 dark:text-orange-900"
                    )}
                  >
                    {dayEvents.length}
                  </Badge>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map((event, eventIndex) => {
                  const eventConfig = EVENT_TYPE_CONFIG[event.event_type];
                  
                  return (
                    <motion.div
                      key={event.id}
                      className={cn(
                        "group/event relative px-2 py-1 rounded-md cursor-pointer text-xs font-medium overflow-hidden",
                        "hover:scale-105 hover:shadow-md transition-all duration-200"
                      )}
                      style={{
                        backgroundColor: `${event.color}20`,
                        color: event.color,
                        borderLeft: `3px solid ${event.color}`,
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (dayIndex * 0.01) + (eventIndex * 0.05) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      whileHover={{ x: 2 }}
                    >
                      {/* Event Content */}
                      <div className="flex items-center space-x-1 truncate">
                        <span className="text-xs group-hover/event:animate-bounce">
                          {eventConfig.icon}
                        </span>
                        <span className="truncate">
                          {event.event_time && (
                            <span className="text-xs opacity-75 mr-1">
                              {format(parseISO(`2000-01-01T${event.event_time}`), 'h:mm a')}
                            </span>
                          )}
                          {event.title}
                        </span>
                      </div>
                      
                      {/* Priority Indicator */}
                      {event.priority !== 'normal' && (
                        <div 
                          className={cn(
                            "absolute top-1 right-1 w-2 h-2 rounded-full",
                            event.priority === 'urgent' && "bg-red-500",
                            event.priority === 'high' && "bg-orange-500",
                            event.priority === 'low' && "bg-gray-400"
                          )}
                        />
                      )}
                      
                      {/* Hover Effect */}
                      <motion.div
                        className="absolute inset-0 bg-white/10 opacity-0 group-hover/event:opacity-100 transition-opacity"
                        initial={false}
                      />
                    </motion.div>
                  );
                })}
                
                {/* More Events Indicator */}
                {dayEvents.length > 4 && (
                  <motion.div 
                    className="text-xs text-muted-foreground font-medium px-2 py-1 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick(day);
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    +{dayEvents.length - 4} more
                  </motion.div>
                )}
              </div>

              {/* Today Indicator */}
              {isDayToday && (
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                />
              )}

              {/* Quick Add Hint */}
              <motion.div
                className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center pointer-events-none"
                initial={false}
              >
                <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg border text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity delay-200">
                  Double-click to create event
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Month Navigation Hint */}
    </div>
  );
};