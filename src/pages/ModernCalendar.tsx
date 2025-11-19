import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarLayout } from '@/components/calendar/CalendarLayout';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { useCalendarView, useViewEvents, useEventOperations, useCalendarStats } from '@/hooks/useCalendar';
import { CalendarEvent, CalendarFilter, ViewType } from '@/types/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EVENT_TYPE_CONFIG, EVENT_COLORS } from '@/types/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, AlertCircle, Trash2, Edit, Copy, Download, Share2, Settings as SettingsIcon, Palette, Bell, Eye, Moon, Sun } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
// Utility functions for exporting calendar data
const downloadICS = (events: CalendarEvent[], filename: string) => {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Modern Calendar//EN',
    'CALSCALE:GREGORIAN'
  ];

  events.forEach(event => {
    const startDate = new Date(event.event_date + (event.event_time ? `T${event.event_time}` : 'T00:00:00'));
    const endDate = event.is_all_day 
      ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours for all-day events
      : new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour for timed events

    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@moderncalendar.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      `CATEGORIES:${event.event_type}`,
      `STATUS:${event.status?.toUpperCase() || 'CONFIRMED'}`,
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\n')], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const downloadCSV = (events: CalendarEvent[], filename: string) => {
  const headers = ['Title', 'Description', 'Date', 'Time', 'Type', 'Location', 'Status', 'Priority'];
  const csvContent = [
    headers.join(','),
    ...events.map(event => [
      `"${event.title}"`,
      `"${event.description || ''}"`,
      event.event_date,
      event.event_time || '',
      event.event_type,
      `"${event.location || ''}"`,
      event.status || 'confirmed',
      event.priority || 'normal'
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const shareEvent = async (event: CalendarEvent, toast: any) => {
  const shareData = {
    title: event.title,
    text: `${event.title} - ${event.description || ''}`,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      toast({
        title: 'Success',
        description: 'Event shared successfully!',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  } else {
    // Fallback: copy to clipboard
    try {
      const textToShare = `${event.title}\n${event.description || ''}\n${event.event_date}${event.event_time ? ' at ' + event.event_time : ''}`;
      await navigator.clipboard.writeText(textToShare);
      toast({
        title: 'Success',
        description: 'Event details copied to clipboard!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to share event',
        variant: 'destructive',
      });
    }
  }
};
import { Switch } from '@/components/ui/switch';

// Day View Component (simplified for now)
const DayView: React.FC<{ currentDate: Date; events: CalendarEvent[]; onEventClick: (event: CalendarEvent) => void; onTimeSlotClick: (date: Date, time: string) => void }> = ({ 
  currentDate, 
  events, 
  onEventClick, 
  onTimeSlotClick 
}) => (
  <div className="h-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
    <div className="text-center space-y-4">
      <div className="text-6xl">📅</div>
      <h2 className="text-2xl font-semibold">Day View</h2>
      <p className="text-muted-foreground">Coming soon with detailed hourly layout</p>
      <Badge variant="outline">{events.length} events on {format(currentDate, 'MMMM dd, yyyy')}</Badge>
    </div>
  </div>
);

// Agenda View Component (simplified for now)
const AgendaView: React.FC<{ events: CalendarEvent[]; onEventClick: (event: CalendarEvent) => void }> = ({ events, onEventClick }) => (
  <div className="h-full p-6 bg-background/50 backdrop-blur-sm">
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Agenda View</h2>
        <p className="text-muted-foreground">Upcoming events in chronological order</p>
      </div>
      
      <div className="space-y-4">
        {events.slice(0, 10).map((event, index) => (
          <motion.div
            key={event.id}
            className="p-4 rounded-lg border bg-card cursor-pointer hover:shadow-md transition-all duration-200"
            style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onEventClick(event)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-muted-foreground text-sm">{event.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <span>{format(new Date(event.event_date), 'MMM dd, yyyy')}</span>
                  {event.event_time && <span>{event.event_time}</span>}
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {event.event_type}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Timeline View Component (simplified for now)
const TimelineView: React.FC<{ events: CalendarEvent[]; onEventClick: (event: CalendarEvent) => void }> = ({ events, onEventClick }) => (
  <div className="h-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
    <div className="text-center space-y-4">
      <div className="text-6xl">⏱️</div>
      <h2 className="text-2xl font-semibold">Timeline View</h2>
      <p className="text-muted-foreground">Visual timeline of your events</p>
      <Badge variant="outline">{events.length} events</Badge>
    </div>
  </div>
);

// Year View Component (simplified for now)
const YearView: React.FC<{ currentDate: Date; events: CalendarEvent[]; onEventClick: (event: CalendarEvent) => void }> = ({ currentDate, events, onEventClick }) => (
  <div className="h-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
    <div className="text-center space-y-4">
      <div className="text-6xl">📆</div>
      <h2 className="text-2xl font-semibold">Year View</h2>
      <p className="text-muted-foreground">{format(currentDate, 'yyyy')} Overview</p>
      <Badge variant="outline">{events.length} events this year</Badge>
    </div>
  </div>
);

export default function ModernCalendar() {
  const { profile } = useAuth();
  const { view, updateView, navigate } = useCalendarView();
  const [filter, setFilter] = useState<CalendarFilter>({});
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormData, setEventFormData] = useState<Partial<CalendarEvent>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { toast } = useToast();
  
  // Check if user is owner/admin
  const isOwner = profile?.role === 'owner';

  const { events, isLoading } = useViewEvents(view, filter);
  const { createEvent, updateEvent, deleteEvent, duplicateEvent } = useEventOperations();
  const stats = useCalendarStats();

  const handleViewChange = (newView: ViewType) => {
    updateView({ type: newView });
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleCreateEvent = (date?: Date, time?: string) => {
    setEventFormData({
      event_date: date ? format(date, 'yyyy-MM-dd') : format(view.current_date, 'yyyy-MM-dd'),
      event_time: time,
      event_type: 'other',
      color: EVENT_COLORS.blue,
      priority: 'normal',
      status: 'confirmed',
      is_all_day: !time,
      is_recurring: false,
    });
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEventFormData(event);
    setSelectedEvent(event);
    setShowEventForm(true);
    setShowEventDialog(false);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEvent.mutate(selectedEvent.id, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setShowEventDialog(false);
          setSelectedEvent(null);
        }
      });
    }
  };

  const handleDuplicateEvent = () => {
    if (selectedEvent) {
      duplicateEvent.mutate(selectedEvent, {
        onSuccess: () => {
          setShowEventDialog(false);
          setSelectedEvent(null);
        }
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventFormData.title || !eventFormData.event_date) {
      toast({
        title: 'Error',
        description: 'Title and date are required',
        variant: 'destructive',
      });
      return;
    }

    const mutation = selectedEvent ? updateEvent : createEvent;
    const data = selectedEvent 
      ? { id: selectedEvent.id, ...eventFormData }
      : eventFormData;

    mutation.mutate(data as any, {
      onSuccess: () => {
        setShowEventForm(false);
        setEventFormData({});
        setSelectedEvent(null);
      }
    });
  };

  const renderCalendarView = () => {
    const commonProps = {
      currentDate: view.current_date,
      events,
      onEventClick: handleEventClick,
    };

    switch (view.type) {
      case 'month':
        return (
          <MonthView
            {...commonProps}
            onDateClick={(date) => console.log('Date clicked:', date)}
            onEventCreate={handleCreateEvent}
          />
        );
      case 'week':
        return (
          <WeekView
            {...commonProps}
            onTimeSlotClick={(date, time) => handleCreateEvent(date, time)}
          />
        );
      case 'day':
        return (
          <DayView
            {...commonProps}
            onTimeSlotClick={(date, time) => handleCreateEvent(date, time)}
          />
        );
      case 'agenda':
        return <AgendaView events={events} onEventClick={handleEventClick} />;
      case 'timeline':
        return <TimelineView events={events} onEventClick={handleEventClick} />;
      case 'year':
        return <YearView {...commonProps} />;
      default:
        return <MonthView {...commonProps} onDateClick={() => {}} onEventCreate={handleCreateEvent} />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <CalendarLayout
        currentView={view.type}
        currentDate={view.current_date}
        onViewChange={handleViewChange}
        onNavigate={navigate}
        onCreateEvent={() => handleCreateEvent()}
        onSettings={() => setShowSettings(true)}
        filter={filter}
        onFilterChange={setFilter}
        eventCount={stats.total}
        isOwner={isOwner}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={view.type}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="h-full"
          >
            {renderCalendarView()}
          </motion.div>
        </AnimatePresence>
      </CalendarLayout>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{selectedEvent && EVENT_TYPE_CONFIG[selectedEvent.event_type].icon}</span>
              <span>{selectedEvent?.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="space-y-2">
                {selectedEvent.description && (
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(selectedEvent.event_date), 'MMMM dd, yyyy')}</span>
                  {selectedEvent.event_time && <span>at {selectedEvent.event_time}</span>}
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className="capitalize"
                    style={{ borderColor: selectedEvent.color, color: selectedEvent.color }}
                  >
                    {selectedEvent.event_type}
                  </Badge>
                  
                  <div className="flex space-x-1">
                    {/* Share Event Button - Available to all users */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareEvent(selectedEvent, toast)}
                      title="Share event"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    
                    {/* Export to External Calendars - Available to all users */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExportDialog(true)}
                      title="Export event"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {/* Edit/Delete buttons - Only for owners */}
                    {isOwner && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEvent(selectedEvent)}
                          title="Edit event"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDuplicateEvent}
                          title="Duplicate event"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteDialog(true)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Delete event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Form Dialog */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={eventFormData.title || ''}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={eventFormData.description || ''}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter event description (optional)"
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventFormData.event_date || ''}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, event_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={eventFormData.event_time || ''}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, event_time: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={eventFormData.event_type}
                  onValueChange={(value) => setEventFormData(prev => ({ ...prev, event_type: value as any }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center space-x-2">
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {Object.entries(EVENT_COLORS).slice(0, 8).map(([key, color]) => (
                    <button
                      key={key}
                      type="button"
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-foreground transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => setEventFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEventForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEvent.isPending || updateEvent.isPending}
              >
                {selectedEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-primary" />
              <span>Export Event</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Export "{selectedEvent.title}" to your preferred calendar app.
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 h-12"
                  onClick={() => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedEvent.title)}&dates=${selectedEvent.event_date.replace(/-/g, '')}/${selectedEvent.event_date.replace(/-/g, '')}&details=${encodeURIComponent(selectedEvent.description || '')}`, '_blank')}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <span>Google Calendar</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 h-12"
                  onClick={() => window.open(`https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(selectedEvent.title)}&startdt=${selectedEvent.event_date}T${selectedEvent.event_time || '00:00'}`, '_blank')}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">O</span>
                  </div>
                  <span>Outlook</span>
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  className="w-full flex items-center space-x-2"
                  onClick={() => {
                    downloadICS([selectedEvent], `${selectedEvent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
                    setShowExportDialog(false);
                    toast({
                      title: 'Success',
                      description: 'Event exported as ICS file',
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span>Download as ICS file</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              <span>Calendar Settings</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* User Info Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold">{profile?.full_name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <Badge variant={profile?.role === 'owner' ? 'default' : 'secondary'} className="mt-1 text-xs">
                    {profile?.role === 'owner' ? '👑 Owner' : '👤 Student'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Calendar Statistics */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Calendar Overview</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-lg border">
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="text-2xl font-bold text-black">{stats.todayCount}</div>
                  <div className="text-sm text-muted-foreground">Today's Events</div>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">{stats.upcomingCount}</div>
                  <div className="text-sm text-muted-foreground">Upcoming</div>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">{Object.keys(stats.byType).length}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Calendar</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 h-12"
                  onClick={() => {
                    downloadICS(events, 'my_calendar.ics');
                    toast({
                      title: 'Success',
                      description: 'Calendar exported as ICS file',
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span>Export as ICS</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 h-12"
                  onClick={() => {
                    downloadCSV(events, 'my_calendar.csv');
                    toast({
                      title: 'Success',
                      description: 'Calendar exported as CSV file',
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span>Export as CSV</span>
                </Button>
              </div>
            </div>

            {/* Event Type Statistics */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Event Categories</span>
              </h3>
              
              <div className="space-y-2">
                {Object.entries(stats.byType).map(([type, count]) => {
                  const config = EVENT_TYPE_CONFIG[type as keyof typeof EVENT_TYPE_CONFIG];
                  return (
                    <div key={type} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{config?.icon}</span>
                        <span className="font-medium capitalize">{type}</span>
                      </div>
                      <Badge variant="outline">{count} events</Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Help Section */}
            <div className="space-y-3 border-t pt-6">
              <h3 className="text-lg font-semibold">Need Help?</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Double-click any day to create an all-day event</p>
                <p>• Click time slots in Week view to create timed events</p>
                <p>• Use natural language like "Meeting at 2pm tomorrow"</p>
                <p>• Export events to sync with external calendars</p>
                {profile?.role === 'owner' && (
                  <p className="text-primary font-medium">• As an owner, you can create, edit, and delete all events</p>
                )}
                {profile?.role === 'student' && (
                  <p className="text-black font-medium">• As a student, you can view and export events</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-6 border-t">
            <Button onClick={() => setShowSettings(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}