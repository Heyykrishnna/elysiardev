import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useQRCodes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get owner's QR codes
  const {
    data: qrCodes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["qr-codes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_qr_codes")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Create QR code mutation
  const createQRCodeMutation = useMutation({
    mutationFn: async (qrData: {
      class_name: string;
      date: string;
      expires_at?: string;
    }) => {
      const qrPayload = {
        class_name: qrData.class_name,
        date: qrData.date,
        owner_id: user?.id,
      };

      const { data, error } = await supabase
        .from("attendance_qr_codes")
        .insert({
          owner_id: user?.id,
          class_name: qrData.class_name,
          date: qrData.date,
          expires_at: qrData.expires_at,
          qr_data: qrPayload,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
      toast.success("QR code created successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to create QR code. Please try again.");
      console.error("QR code creation error:", error);
    },
  });

  // Toggle QR code status mutation
  const toggleQRCodeMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("attendance_qr_codes")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
      toast.success("QR code status updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update QR code status. Please try again.");
    },
  });

  return {
    qrCodes,
    isLoading,
    error,
    createQRCode: createQRCodeMutation.mutate,
    isCreating: createQRCodeMutation.isPending,
    toggleQRCode: toggleQRCodeMutation.mutate,
    isToggling: toggleQRCodeMutation.isPending,
  };
};

// Hook for QR-based attendance marking
export const useQRAttendance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const markQRAttendanceMutation = useMutation({
    mutationFn: async (qrData: {
      class_name: string;
      date: string;
      owner_id: string;
    }) => {
      if (!user?.id) {
        throw new Error("User not authenticated. Please log in and try again.");
      }

      // First get the user's profile to get their email and name
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profile) {
        throw new Error("User profile not found. Please contact administrator.");
      }

      // Check if the QR code is still active and not expired
      const { data: qrCodeData, error: qrError } = await supabase
        .from("attendance_qr_codes")
        .select("is_active, expires_at")
        .eq("owner_id", qrData.owner_id)
        .eq("class_name", qrData.class_name)
        .eq("date", qrData.date)
        .maybeSingle();

      if (qrError) throw qrError;
      
      if (!qrCodeData) {
        throw new Error("QR code not found. Please scan a valid QR code.");
      }

      if (!qrCodeData.is_active) {
        throw new Error("This QR code is no longer active. Please contact your instructor.");
      }

      // Check if QR code has expired
      if (qrCodeData.expires_at && new Date(qrCodeData.expires_at) < new Date()) {
        throw new Error("This QR code has expired. Please contact your instructor for a new code.");
      }

      // Check if user already marked attendance for today
      const { data: existingAttendance, error: checkError } = await supabase
        .from("attendance")
        .select("id")
        .eq("student_id", user.id)
        .eq("date", qrData.date)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existingAttendance) {
        throw new Error("You have already marked attendance for today!");
      }

      const { data, error } = await supabase
        .from("attendance")
        .insert({
          student_id: user.id,
          full_name: profile.full_name || "Unknown Student",
          email: profile.email,
          phone_number: 9000000000, // Default phone for QR attendance - will be updated by admin if needed
          class: qrData.class_name,
          date: qrData.date,
          status: "approved", // QR attendance is automatically approved
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance marked successfully via QR code!");
    },
    onError: (error: any) => {
      console.error("QR attendance error:", error);
      
      if (error.message?.includes("already marked attendance")) {
        toast.error("You have already marked attendance for today!");
      } else if (error.message?.includes("not authenticated")) {
        toast.error("Please log in to mark attendance!");
      } else if (error.message?.includes("profile not found")) {
        toast.error("User profile not found. Please contact administrator.");
      } else if (error.message?.includes("no longer active")) {
        toast.error("This QR code is no longer active. Please contact your instructor.");
      } else if (error.message?.includes("has expired")) {
        toast.error("This QR code has expired. Please contact your instructor for a new code.");
      } else if (error.message?.includes("QR code not found")) {
        toast.error("QR code not found. Please scan a valid QR code.");
      } else if (error.code === "23505") {
        toast.error("You have already marked attendance for today!");
      } else {
        toast.error("Failed to mark attendance. Please try again.");
      }
    },
  });

  return {
    markQRAttendance: markQRAttendanceMutation.mutate,
    isMarking: markQRAttendanceMutation.isPending,
  };
};