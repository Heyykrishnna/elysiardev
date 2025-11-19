import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, Event } from "@/hooks/useEvents";
import { EventForm } from "@/components/EventForm";
import { EventDetailsDialog } from "@/components/EventDetailsDialog";
import { DayTimelineDialog } from "@/components/DayTimelineDialog";

const eventTypeIcons = {
  class: "📚",
  holiday: "🎉",
  exam: "📝",
  assignment: "📋",
  meeting: "👥",
  other: "📅",
};

export default function CalendarPage() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [timelineDate, setTimelineDate] = useState<Date | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [prefilledTime, setPrefilledTime] = useState<{ hour?: number; minute?: number }>({});

  const { data: events = [], isLoading } = useEvents();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

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
        setSelectedDate(null);
      },
    });
  };

  const handleUpdateEvent = (eventData: any) => {
    if (editingEvent) {
      updateEventMutation.mutate(
        { id: editingEvent.id, ...eventData },
        {
          onSuccess: () => {
            setEditingEvent(null);
            setShowEventForm(false);
          },
        }
      );
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEventMutation.mutate(eventId);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleTimelineCreateEvent = (date: Date, hour?: number, minute?: number) => {
    setSelectedDate(date);
    if (hour !== undefined && minute !== undefined) {
      setPrefilledTime({ hour, minute });
    } else {
      setPrefilledTime({});
    }
    setShowTimeline(false);
    setShowEventForm(true);
  };

  const isOwner = profile?.role === 'owner';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-background via-background/98 to-primary/5 animate-fade-in bg-black">
      <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Header */}

        <div className="text-center mb-8 sm:mb-12 md:mb-16 relative px-2 mt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-3xl -z-10"></div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold to-accent bg-clip-text text-white mb-4 sm:mb-6 animate-fade-in">
            📅 Calendar & Events
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in px-4">
            Stay organized with classes, exams, holidays, and important dates.  
            <span className="text-white font-medium"> Never miss a deadline again!</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 mb-6 sm:mb-8 px-2">
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 rounded-full text-xs sm:text-sm font-medium text-accent border border-accent/20" style={{animationDelay: '1.2s'}}>
              ✨ <span className=" xs:inline">Smart </span>Scheduling
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 rounded-full text-xs sm:text-sm font-medium text-accent border border-accent/20" style={{animationDelay: '1.2s'}}>
              🔔 <span className="hidden xs:inline">Event </span>Reminders  
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 rounded-full text-xs sm:text-sm font-medium text-accent border border-accent/20" style={{animationDelay: '1.2s'}}>
              📊 Timeline <span className="hidden xs:inline">View</span>
            </div>
          </div>
          
          {isOwner && (
            <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 hover:scale-110 hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300 shadow-xl text-white border-0 px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl group animate-pulse hover:animate-none">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="hidden xs:inline">Create New </span>Event
                  <span className="ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">✨</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
                </DialogHeader>
                <EventForm
                  event={editingEvent || undefined}
                  selectedDate={selectedDate}
                  prefilledTime={prefilledTime}
                  onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
                  onCancel={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                    setSelectedDate(null);
                    setPrefilledTime({});
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-accent/50 to-accent/30 animate-fade-in justify-center items-center">
            <TabsTrigger value="calendar" className="flex justify-center items-center transition-all duration-200 hover:scale-105 data-[state=active]:from-primary data-[state=active]:to-primary/80">
              <span className="hidden sm:inline">Calendar View</span>
              <span className="sm:hidden">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex justify-center items-center transition-all duration-200 hover:scale-105 data-[state=active]:from-primary data-[state=active]:to-primary/80">
              <span className="hidden sm:inline">Event List</span>
              <span className="sm:hidden">List</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6 animate-fade-in">
            {/* Calendar Header */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-card/90 via-card/95 to-card/90 hover:shadow-3xl transition-all duration-500 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
              <CardHeader className="pb-4 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent animate-slide-in-right relative text-black">
                    <span className="inline-block animate-float text-black">📅</span>
                    <span className="ml-3">{format(currentDate, "MMMM yyyy")}</span>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/20 rounded-full animate-ping"></div>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevMonth}
                      className="h-8 w-8 p-0 hover:scale-110 hover:shadow-md transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 group"
                    >
                      <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextMonth}
                      className="h-8 w-8 p-0 hover:scale-110 hover:shadow-md transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 group"
                    >
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                    <div
                      key={day}
                      className="h-10 sm:h-12 flex items-center justify-center text-sm font-semibold text-muted-foreground bg-gradient-to-b from-accent/30 to-accent/10 rounded-lg hover:from-accent/50 hover:to-accent/20 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden text-xs">{day.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
                  {calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isDayToday = isToday(day);

                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "min-h-[80px] xs:min-h-[90px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] p-1 xs:p-1.5 sm:p-2 border rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-500 cursor-pointer group hover:scale-[1.02] sm:hover:scale-[1.05] hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-xl sm:hover:shadow-3xl hover:shadow-primary/10 animate-fade-in relative overflow-hidden backdrop-blur-sm",
                          isCurrentMonth
                            ? "bg-gradient-to-br from-background/90 via-background/95 to-accent/10 border-border/50 hover:bg-gradient-to-br hover:from-primary/10 hover:via-accent/10 hover:to-secondary/10 hover:border-primary/50 hover:shadow-primary/20"
                            : "bg-gradient-to-br from-muted/30 to-muted/20 text-muted-foreground border-muted/40 hover:bg-gradient-to-br hover:from-muted/50 hover:to-muted/30",
                          isDayToday && "bg-gradient-to-br from-primary/30 to-primary/15 border-primary/60 ring-4 ring-primary/30 shadow-2xl shadow-primary/30 animate-pulse",
                          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:via-accent/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
                          "after:absolute after:top-2 after:right-2 after:w-2 after:h-2 after:bg-primary/40 after:rounded-full after:opacity-0 hover:after:opacity-100 after:animate-ping after:transition-opacity after:duration-300"
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => {
                          setTimelineDate(day);
                          setShowTimeline(true);
                        }}
                      >
                        <div
                          className={cn(
                            "text-xs xs:text-sm sm:text-base font-bold mb-1 sm:mb-2 transition-all duration-200 group-hover:scale-110 flex justify-center items-center w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 rounded-full",
                            isDayToday 
                              ? "text-primary bg-primary/20 shadow-md" 
                              : isCurrentMonth 
                                ? "text-foreground hover:bg-accent/30" 
                                : "text-muted-foreground"
                          )}
                        >
                          {format(day, "d")}
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event, eventIndex) => (
                            <div
                              key={event.id}
                              className="text-xs px-2 xs:px-3 py-1 xs:py-1.5 sm:py-2 rounded-md sm:rounded-lg truncate cursor-pointer transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:-translate-y-1 hover:shadow-lg sm:hover:shadow-xl animate-slide-in-right group/event backdrop-blur-sm border"
                              style={{
                                backgroundColor: `${event.color}25`,
                                color: event.color,
                                borderLeft: `4px solid ${event.color}`,
                                borderColor: `${event.color}40`,
                                animationDelay: `${(index * 30) + (eventIndex * 150)}ms`,
                                boxShadow: `0 4px 12px ${event.color}20`
                              }}
                              title={event.title}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-xs xs:text-sm group-hover/event:animate-bounce">{eventTypeIcons[event.event_type]}</span>
                                <span className="font-medium text-xs xs:text-sm truncate">{event.title}</span>
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-muted-foreground font-medium bg-gradient-to-r from-accent/40 to-accent/20 rounded-md px-2 py-1 hover:from-accent/60 hover:to-accent/30 transition-all duration-200 hover:scale-105">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                        
                        {/* Day view hint overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl flex items-center justify-center pointer-events-none">
                          <div className="bg-background/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-2xl border border-primary/20 text-sm font-semibold text-foreground transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <span className="inline-block animate-bounce mr-2">📅</span>
                            Click for day timeline
                            <span className="inline-block animate-pulse ml-2">✨</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-4 animate-fade-in">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl animate-slide-in-right">
                  <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
                  <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    All Events
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {events.length === 0 ? (
                    <div className="text-center py-12 animate-fade-in">
                      <div className="text-6xl mb-4 opacity-50">📅</div>
                      <div className="text-muted-foreground text-lg">No events scheduled yet.</div>
                      <p className="text-sm text-muted-foreground/70 mt-2">Events will appear here once created</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event, index) => (
                        <div
                          key={event.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-xl border bg-gradient-to-r from-card to-card/90 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group animate-fade-in cursor-pointer"
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start sm:items-center gap-4 flex-1">
                            <div
                              className="w-5 h-5 rounded-full shadow-md group-hover:scale-110 transition-transform duration-200"
                              style={{ backgroundColor: event.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-xl group-hover:animate-bounce transition-all duration-200">
                                  {eventTypeIcons[event.event_type]}
                                </span>
                                <h3 className="font-semibold text-base sm:text-lg truncate">{event.title}</h3>
                                <Badge variant="outline" className="capitalize text-xs hover:bg-primary/10 transition-colors">
                                  {event.event_type}
                                </Badge>
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-primary/60 rounded-full"></span>
                                  {format(new Date(event.event_date), "MMM dd, yyyy")}
                                </span>
                                {event.event_time && (
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                                    {format(new Date(`2000-01-01T${event.event_time}`), "h:mm a")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {isOwner && (
                            <div className="flex gap-2 mt-3 sm:mt-0 sm:ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingEvent(event);
                                  setShowEventForm(true);
                                }}
                                className="hover:bg-primary/10 hover:scale-110 transition-all duration-200"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="hover:bg-destructive/10 hover:scale-110 transition-all duration-200"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="animate-scale-in">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{event.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteEvent(event.id)}
                                      className="bg-destructive hover:bg-destructive/90 hover:scale-105 transition-all duration-200"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Event Details Dialog */}
        <EventDetailsDialog
          event={selectedEvent}
          open={showEventDetails}
          onOpenChange={setShowEventDetails}
        />

        {/* Day Timeline Dialog */}
        <DayTimelineDialog
          date={timelineDate}
          events={events}
          open={showTimeline}
          onOpenChange={setShowTimeline}
          onEventClick={handleEventClick}
          onCreateEvent={handleTimelineCreateEvent}
        />
      </div>
    </div>
  );
}
