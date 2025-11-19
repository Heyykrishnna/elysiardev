import React from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin, User, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/hooks/useAttendance";
import { useNavigate } from "react-router-dom";
import { Event } from "@/hooks/useEvents";
import { toast } from "sonner";

const eventTypeIcons = {
  class: "📚",
  holiday: "🎉", 
  exam: "📝",
  assignment: "📋",
  meeting: "👥",
  other: "📅",
};

interface EventDetailsDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsDialog({ event, open, onOpenChange }: EventDetailsDialogProps) {
  const { profile } = useAuth();
  const { markAttendance, isMarkingAttendance, attendanceRecords } = useAttendance();
  const navigate = useNavigate();

  if (!event) return null;

  const isOwner = profile?.role === 'owner';
  const isStudent = !isOwner;

  // Check if student already marked attendance for this event's date
  const eventDate = new Date(event.event_date).toISOString().split('T')[0];
  const hasMarkedAttendance = attendanceRecords?.some(record => 
    new Date(record.date).toISOString().split('T')[0] === eventDate
  );

  const handleMarkAttendance = () => {
    if (!profile?.email) {
      toast.error("Profile information not found");
      return;
    }

    // Mark attendance for this event
    markAttendance({
      email: profile.email,
      phone_number: "000-000-0000", // Default phone number for event attendance
      class: event.title, // Use event title as class name
    });

    // Close dialog and navigate to attendance page
    setTimeout(() => {
      onOpenChange(false);
      navigate('/attendance');
    }, 1000);
  };

  const formatEventTime = (timeString: string | null) => {
    if (!timeString) return "No specific time";
    return format(new Date(`2000-01-01T${timeString}`), "h:mm a");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{eventTypeIcons[event.event_type]}</span>
            {event.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Event Type Badge */}
          <Badge 
            variant="outline" 
            className="capitalize"
            style={{ borderColor: event.color, color: event.color }}
          >
            {event.event_type}
          </Badge>

          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(event.event_date), "EEEE, MMMM dd, yyyy")}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatEventTime(event.event_time)}</span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Student Attendance Section */}
          {isStudent && event.event_type === 'class' && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Mark Attendance
              </h4>
              
              {hasMarkedAttendance ? (
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-700 font-medium">
                    Attendance already marked for this date
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/attendance');
                    }}
                  >
                    View Attendance
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Mark your attendance for this class event
                  </p>
                  <Button 
                    onClick={handleMarkAttendance}
                    disabled={isMarkingAttendance}
                    className="w-full"
                  >
                    {isMarkingAttendance ? "Marking..." : "Mark Present"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Owner View */}
          {isOwner && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Created by you</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}