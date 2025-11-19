import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

export const useAttendance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get student's attendance records
  const {
    data: attendanceRecords,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attendance", user?.id],
    queryFn: async () => {
      console.log('Fetching attendance for user ID:', user?.id);
      
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", user?.id)
        .order("date", { ascending: false })
        .order("time_marked", { ascending: false });

      console.log('Attendance query result:', { data, error });
      
      if (error) {
        console.error('Attendance fetch error:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Set up real-time listener for attendance updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('student-attendance-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance',
          filter: `student_id=eq.${user?.id}`
        },
        async (payload) => {
          console.log('New attendance record:', payload);
          await queryClient.invalidateQueries({ queryKey: ["attendance", user?.id] });
          queryClient.refetchQueries({ queryKey: ["attendance", user?.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', 
          schema: 'public',
          table: 'attendance',
          filter: `student_id=eq.${user?.id}`
        },
        async (payload) => {
          console.log('Attendance record updated:', payload);
          await queryClient.invalidateQueries({ queryKey: ["attendance", user?.id] });
          queryClient.refetchQueries({ queryKey: ["attendance", user?.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'attendance',
          filter: `student_id=eq.${user?.id}`
        },
        async (payload) => {
          console.log('Attendance record deleted:', payload);
          await queryClient.invalidateQueries({ queryKey: ["attendance", user?.id] });
          queryClient.refetchQueries({ queryKey: ["attendance", user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user?.id]);

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: {
      email: string;
      phone_number: string;
      class: string;
    }) => {
      // Check daily limit first
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = attendanceRecords?.filter(record => 
        new Date(record.date).toISOString().split('T')[0] === today
      ) || [];
      
      if (todayRecords.length >= 3) {
        throw new Error("Daily attendance limit exceeded. Maximum 3 attendance requests per day allowed.");
      }

      // First get the user's profile to get their name
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;

      const { phone_number, ...restData } = attendanceData;
      
      const { data, error } = await supabase
        .from("attendance")
        .insert({
          student_id: user?.id,
          full_name: profile.full_name || "Unknown",
          phone_number: parseInt(phone_number),
          ...restData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "all"] });
      toast.success("Attendance marked successfully!");
    },
    onError: (error: any) => {
      if (error.message?.includes("Daily attendance limit exceeded")) {
        toast.error("You can only mark attendance 3 times per day!");
      } else if (error.code === "23505") {
        toast.error("You have already marked attendance for today!");
      } else {
        toast.error("Failed to mark attendance. Please try again.");
      }
    },
  });

  // Delete attendance mutation
  const deleteAttendanceMutation = useMutation({
    mutationFn: async (attendanceId: string) => {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("id", attendanceId)
        .eq("student_id", user?.id); // Extra security check

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "all"] });
      toast.success("Attendance record deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete attendance record. Please try again.");
    },
  });

  return {
    attendanceRecords,
    isLoading,
    error,
    markAttendance: markAttendanceMutation.mutate,
    isMarkingAttendance: markAttendanceMutation.isPending,
    deleteAttendance: deleteAttendanceMutation.mutate,
    isDeletingAttendance: deleteAttendanceMutation.isPending,
  };
};

// Hook for owners to view all attendance records
export const useAllAttendance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: allAttendanceRecords,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attendance", "all"],
    queryFn: async () => {
      console.log('Fetching all attendance records for owner...');
      
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .order("date", { ascending: false });

      console.log('All attendance query result:', { data, error });
      
      if (error) {
        console.error('All attendance fetch error:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Set up real-time updates for all attendance records (owner view)
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('all-attendance-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance'
        },
        async (payload) => {
          console.log('New attendance record for owner view:', payload);
          await queryClient.invalidateQueries({ queryKey: ["attendance", "all"] });
          queryClient.refetchQueries({ queryKey: ["attendance", "all"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public', 
          table: 'attendance'
        },
        async (payload) => {
          console.log('Attendance record updated for owner view:', payload);
          await queryClient.invalidateQueries({ queryKey: ["attendance", "all"] });
          queryClient.refetchQueries({ queryKey: ["attendance", "all"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user?.id]);

  // Approve attendance mutation
  const approveAttendanceMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { data, error } = await supabase
        .from("attendance")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "all"] });
      toast.success("Attendance status updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update attendance status. Please try again.");
    },
  });

  return {
    allAttendanceRecords,
    isLoading,
    error,
    approveAttendance: approveAttendanceMutation.mutate,
    isUpdating: approveAttendanceMutation.isPending,
  };
};