import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents, useCreateEvent, Event } from "@/hooks/useEvents";
import { EventForm } from "@/components/EventForm";
import { EventDetailsDialog } from "@/components/EventDetailsDialog";

const eventTypeIcons = {
  class: "📚",
  holiday: "🎉", 
  exam: "📝",
  assignment: "📋",
  meeting: "👥",
  other: "📅",
};

export default function DashboardCalendar() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  const { data: events = [], isLoading } = useEvents();
  const createEventMutation = useCreateEvent();

  // Get the proper calendar grid - start from Sunday of the week containing the first day of month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.event_date), date)
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCreateEvent = (eventData: any) => {
    createEventMutation.mutate(eventData, {
      onSuccess: () => {
        setShowEventForm(false);
      },
    });
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const isOwner = profile?.role === 'owner';

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 animate-slide-in-right">
              <CalendarIcon className="h-5 w-5 text-primary animate-pulse" />
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                {format(currentDate, "MMMM yyyy")}
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isOwner ? "Manage events and schedule" : "View upcoming events"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0 hover:scale-110 hover:shadow-md transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0 hover:scale-110 hover:shadow-md transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {isOwner && (
              <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                    <Plus className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <EventForm
                    onSubmit={handleCreateEvent}
                    onCancel={() => setShowEventForm(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Calendar Grid */}
        <div className="space-y-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-semibold text-muted-foreground bg-gradient-to-b from-accent/20 to-transparent rounded-md animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "h-16 sm:h-20 p-1 sm:p-2 border rounded-lg transition-all duration-300 cursor-pointer text-center group hover:scale-105 hover:-translate-y-1 animate-fade-in",
                    isCurrentMonth
                      ? "bg-gradient-to-br from-background to-accent/10 border-border hover:bg-gradient-to-br hover:from-accent/20 hover:to-accent/10 hover:shadow-lg hover:border-primary/30"
                      : "bg-gradient-to-br from-muted/30 to-muted/10 text-muted-foreground border-muted/50 hover:bg-gradient-to-br hover:from-muted/50 hover:to-muted/20",
                    isDayToday && "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/50 ring-2 ring-primary/30 shadow-lg shadow-primary/20"
                  )}
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <div
                    className={cn(
                      "text-xs sm:text-sm font-bold transition-all duration-200 group-hover:scale-110",
                      isDayToday ? "text-primary" : isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                  
                  <div className="mt-0.5 sm:mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className="text-[9px] sm:text-[10px] px-1 py-0.5 rounded-md truncate cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md animate-slide-in-right group/event"
                        style={{
                          backgroundColor: `${event.color}25`,
                          color: event.color,
                          borderLeft: `2px solid ${event.color}`,
                          animationDelay: `${(index * 20) + (eventIndex * 100)}ms`
                        }}
                        title={event.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        <div className="flex items-center gap-0.5">
                          <span className="group-hover/event:animate-bounce">{eventTypeIcons[event.event_type]}</span>
                          <span className="hidden sm:inline">{event.title.substring(0, 8)}</span>
                          <span className="sm:hidden">{event.title.substring(0, 4)}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] sm:text-[9px] text-muted-foreground font-medium bg-accent/30 rounded px-1 py-0.5 hover:bg-accent/50 transition-colors">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Details Dialog */}
        <EventDetailsDialog
          event={selectedEvent}
          open={showEventDetails}
          onOpenChange={setShowEventDetails}
        />
      </CardContent>
    </Card>
  );
}