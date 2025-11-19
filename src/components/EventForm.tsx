import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CreateEventData, Event } from "@/hooks/useEvents";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  event_date: z.date(),
  event_time: z.string().optional(),
  end_time: z.string().optional(),
  event_type: z.enum(["class", "holiday", "exam", "assignment", "meeting", "other"]),
  color: z.string(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: Event;
  selectedDate?: Date | null;
  prefilledTime?: { hour?: number; minute?: number };
  onSubmit: (data: CreateEventData) => void;
  onCancel: () => void;
}

const eventColors = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
];

const eventTypeOptions = [
  { value: "class", label: "Class", icon: "📚" },
  { value: "holiday", label: "Holiday", icon: "🎉" },
  { value: "exam", label: "Exam", icon: "📝" },
  { value: "assignment", label: "Assignment", icon: "📋" },
  { value: "meeting", label: "Meeting", icon: "👥" },
  { value: "other", label: "Other", icon: "📅" },
];

export const EventForm: React.FC<EventFormProps> = ({
  event,
  selectedDate,
  prefilledTime,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      event_date: event ? new Date(event.event_date) : selectedDate || new Date(),
      event_time: event?.event_time || (prefilledTime?.hour !== undefined && prefilledTime?.minute !== undefined ? 
        `${prefilledTime.hour.toString().padStart(2, '0')}:${prefilledTime.minute.toString().padStart(2, '0')}` : ""),
      end_time: event?.end_time || "",
      event_type: event?.event_type || "class",
      color: event?.color || "#3b82f6",
    },
  });

  const watchedDate = watch("event_date");
  const selectedColor = watch("color");
  const selectedType = watch("event_type");

  const handleFormSubmit = (data: EventFormData) => {
    onSubmit({
      title: data.title,
      description: data.description,
      event_date: format(data.event_date, "yyyy-MM-dd"),
      event_time: data.event_time,
      end_time: data.end_time,
      event_type: data.event_type,
      color: data.color,
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">
          {event ? "Edit Event" : "Create New Event"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {event ? "Update event details" : "Add a new event to the calendar"}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            placeholder="Enter event title..."
            {...register("title")}
            className="text-base"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Enter event description..."
            rows={3}
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watchedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchedDate ? format(watchedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchedDate}
                  onSelect={(date) => setValue("event_date", date || new Date())}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_time">Start Time (Optional)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="event_time"
                type="time"
                {...register("event_time")}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_time">End Time (Optional)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="end_time"
                type="time"
                {...register("end_time")}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Event Type</Label>
          <Select
            value={selectedType}
            onValueChange={(value) => setValue("event_type", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Event Color</Label>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2 flex-wrap">
              {eventColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue("color", color.value)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                    selectedColor === color.value
                      ? "border-foreground ring-2 ring-offset-2 ring-foreground"
                      : "border-border"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {event ? "Update Event" : "Create Event"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};