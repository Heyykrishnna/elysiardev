import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CalendarEvent } from "@/types/calendar";

// Use CalendarEvent as the base type for classes
export interface ClassSchedule extends CalendarEvent {
  // Additional fields specific to class scheduling
  instructor_name?: string;
  max_students?: number;
}

export interface ClassEnrollment {
  id: string;
  student_id: string;
  event_id: string;
  enrolled_at: string;
  status: string;
}

export interface AttendanceAnalytics {
  id: string;
  event_id: string;
  total_enrolled: number;
  total_present: number;
  attendance_percentage: number;
  date: string;
  updated_at: string;
  events?: CalendarEvent; // Joined event data
}

// Hook for managing class schedules (teacher/owner view)
export const useClassSchedules = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all class events
  const {
    data: classSchedules,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["classSchedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("event_type", "class")
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data as ClassSchedule[];
    },
    enabled: !!user?.id,
  });

  // Get instructor's class events
  const {
    data: instructorSchedules,
    isLoading: isLoadingInstructor,
  } = useQuery({
    queryKey: ["classSchedules", "instructor", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("event_type", "class")
        .eq("owner_id", user?.id)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data as ClassSchedule[];
    },
    enabled: !!user?.id,
  });

  // Create new class event
  const createClassScheduleMutation = useMutation({
    mutationFn: async (scheduleData: {
      title: string;
      description?: string;
      event_date: string;
      event_time?: string;
      duration_minutes?: number;
      location?: string;
      max_students?: number;
      instructor_name?: string;
    }) => {
      // Create description that includes additional class info
      const enhancedDescription = [
        scheduleData.description,
        scheduleData.instructor_name ? `Instructor: ${scheduleData.instructor_name}` : null,
        scheduleData.location ? `Location: ${scheduleData.location}` : null,
        scheduleData.duration_minutes ? `Duration: ${scheduleData.duration_minutes} minutes` : null,
        scheduleData.max_students ? `Max Students: ${scheduleData.max_students}` : null
      ].filter(Boolean).join('\n');

      const { data, error } = await supabase
        .from("events")
        .insert({
          title: scheduleData.title,
          description: enhancedDescription,
          event_date: scheduleData.event_date,
          event_time: scheduleData.event_time,
          event_type: "class",
          color: "#1976d2", // Default blue color for classes
          owner_id: user?.id,
          visibility: "public"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classSchedules"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Class created successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to create class: " + error.message);
    },
  });

  // Update class event
  const updateClassScheduleMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ClassSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classSchedules"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Class updated successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to update class: " + error.message);
    },
  });

  // Delete class event
  const deleteClassScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classSchedules"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Class deleted successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to delete class: " + error.message);
    },
  });

  return {
    classSchedules,
    instructorSchedules,
    isLoading: isLoading || isLoadingInstructor,
    error,
    createClassSchedule: createClassScheduleMutation.mutate,
    isCreating: createClassScheduleMutation.isPending,
    updateClassSchedule: updateClassScheduleMutation.mutate,
    isUpdating: updateClassScheduleMutation.isPending,
    deleteClassSchedule: deleteClassScheduleMutation.mutate,
    isDeleting: deleteClassScheduleMutation.isPending,
  };
};

// Hook for student class enrollments and upcoming classes
export const useStudentClasses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get student's enrolled classes - temporarily use all class events
  const {
    data: enrolledClasses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["studentClasses", user?.id],
    queryFn: async () => {
      // Temporarily return all class events as if the user is enrolled
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("event_type", "class")
        .order("event_date", { ascending: true });

      if (error) throw error;
      
      // Mock enrollment structure
      return data?.map(event => ({
        id: `enrollment_${event.id}`,
        student_id: user?.id,
        event_id: event.id,
        enrolled_at: new Date().toISOString(),
        status: 'enrolled',
        events: event
      })) || [];
    },
    enabled: !!user?.id,
  });

  // Get upcoming classes for student - temporarily use future class events
  const {
    data: upcomingClasses,
    isLoading: isLoadingUpcoming,
  } = useQuery({
    queryKey: ["upcomingClasses", user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("event_type", "class")
        .gte("event_date", today)
        .order("event_date", { ascending: true });

      if (error) throw error;
      
      // Mock enrollment structure
      return data?.map(event => ({
        id: `enrollment_${event.id}`,
        student_id: user?.id,
        event_id: event.id,
        enrolled_at: new Date().toISOString(),
        status: 'enrolled',
        events: event
      })) || [];
    },
    enabled: !!user?.id,
  });

  // Get available classes for enrollment
  const {
    data: availableClasses,
    isLoading: isLoadingAvailable,
  } = useQuery({
    queryKey: ["availableClasses"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("event_type", "class")
        .gte("event_date", today)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return (data || []) as any as ClassSchedule[];
    },
    enabled: !!user?.id,
  });

  // Enroll in class - temporarily just show success
  const enrollInClassMutation = useMutation({
    mutationFn: async (eventId: string) => {
      // For now, just simulate success
      console.log(`Would enroll user ${user?.id} in event ${eventId}`);
      return {
        id: `enrollment_${eventId}`,
        student_id: user?.id,
        event_id: eventId,
        status: 'enrolled'
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentClasses"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
      toast.success("Successfully enrolled in class!");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("You are already enrolled in this class!");
      } else {
        toast.error("Failed to enroll in class: " + error.message);
      }
    },
  });

  // Drop from class - temporarily just show success
  const dropFromClassMutation = useMutation({
    mutationFn: async (eventId: string) => {
      // For now, just simulate success
      console.log(`Would drop user ${user?.id} from event ${eventId}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentClasses"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
      toast.success("Successfully dropped from class!");
    },
    onError: (error: any) => {
      toast.error("Failed to drop from class: " + error.message);
    },
  });

  return {
    enrolledClasses,
    upcomingClasses,
    availableClasses,
    isLoading: isLoading || isLoadingUpcoming || isLoadingAvailable,
    error,
    enrollInClass: enrollInClassMutation.mutate,
    isEnrolling: enrollInClassMutation.isPending,
    dropFromClass: dropFromClassMutation.mutate,
    isDropping: dropFromClassMutation.isPending,
  };
};

// Hook for attendance analytics
export const useAttendanceAnalytics = () => {
  const { user } = useAuth();

  // Mock attendance analytics data
  const attendanceAnalytics = null;
  const isLoading = false;
  const error = null;

  // Get analytics for specific class
  const getClassAnalytics = async (classScheduleId: string) => {
    // Mock implementation - return empty array
    return [];
  };

  // Get student's attendance statistics - with mock data
  const {
    data: studentAttendanceStats,
    isLoading: isLoadingStudentStats,
  } = useQuery({
    queryKey: ["studentAttendanceStats", user?.id],
    queryFn: async () => {
      // Get student's attendance records with class info
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", user?.id)
        .eq("status", "approved");

      if (attendanceError) throw attendanceError;

      // Get class events instead of enrollments
      const { data: classEvents, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("event_type", "class");

      if (eventsError) throw eventsError;

      // Calculate attendance statistics by class
      const statsByClass = classEvents?.map(classEvent => {
        const attendanceForClass = attendanceRecords?.filter(
          record => record.class === classEvent.title
        ) || [];

        // Count total scheduled classes up to today
        const today = new Date();
        const scheduledDate = new Date(classEvent.event_date);
        
        // For simplicity, assume one class per scheduled date
        // In a real system, you'd have recurring schedules
        const totalScheduled = scheduledDate <= today ? 1 : 0;
        const totalAttended = attendanceForClass.length;
        const attendanceRate = totalScheduled > 0 ? (totalAttended / totalScheduled) * 100 : 0;

        return {
          ...classEvent,
          totalScheduled,
          totalAttended,
          attendanceRate,
        };
      }) || [];

      return statsByClass;
    },
    enabled: !!user?.id,
  });

  return {
    attendanceAnalytics,
    studentAttendanceStats,
    isLoading: isLoading || isLoadingStudentStats,
    error,
    getClassAnalytics,
  };
};