import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AttendanceAnalytics {
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  weeklyAttendance: Array<{
    week: string;
    attended: number;
    total: number;
    percentage: number;
  }>;
  monthlyStats: Array<{
    month: string;
    attended: number;
    total: number;
    percentage: number;
  }>;
  classwiseAttendance: Array<{
    className: string;
    attended: number;
    total: number;
    percentage: number;
  }>;
  statusBreakdown: {
    approved: number;
    pending: number;
    rejected: number;
    missed: number;
  };
  recentActivity: Array<{
    date: string;
    className: string;
    status: string;
  }>;
}

// Helper to get local YYYY-MM-DD
const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useAttendanceAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attendance-analytics", user?.id],
    queryFn: async (): Promise<AttendanceAnalytics> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Get this student's attendance records
      const { data: records, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", user.id)
        .order("date", { ascending: false })
        .order("time_marked", { ascending: false });

      if (attendanceError) {
        throw attendanceError;
      }

      const attendanceRecords = records || [];

      // Deduplicate by class+date for session-level stats (multiple attempts per day shouldn't inflate totals)
      type Key = string; // `${class}-${date}`
      const sessionMap: Map<Key, { className: string; statuses: Set<string>; latestStatus: string; date: string }>
        = new Map();

      for (const rec of attendanceRecords) {
        const key = `${rec.class}-${rec.date}`;
        const current = sessionMap.get(key);
        if (!current) {
          sessionMap.set(key, {
            className: rec.class,
            statuses: new Set([rec.status]),
            latestStatus: rec.status,
            date: rec.date,
          });
        } else {
          current.statuses.add(rec.status);
          // Prefer approved over others as the representative status
          current.latestStatus = current.latestStatus === 'approved' ? 'approved' : rec.status;
          sessionMap.set(key, current);
        }
      }

      const sessions = Array.from(sessionMap.values());
      const totalSessions = sessions.length;
      const approvedSessions = sessions.filter(s => s.latestStatus === 'approved').length;
      const pendingSessions = sessions.filter(s => s.latestStatus === 'pending').length;
      const rejectedSessions = sessions.filter(s => s.latestStatus === 'rejected').length;

      const attendancePercentage = totalSessions > 0
        ? Math.round((approvedSessions / totalSessions) * 100)
        : 0;

      // Weekly attendance (last 8 weeks)
      const weeklyAttendance: AttendanceAnalytics["weeklyAttendance"] = [];
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weekSessions = sessions.filter(s => {
          const d = new Date(`${s.date}T00:00:00`);
          return d >= weekStart && d <= weekEnd;
        });

        const weekApproved = weekSessions.filter(s => s.latestStatus === 'approved').length;
        const weekTotal = weekSessions.length;

        weeklyAttendance.push({
          week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
          attended: weekApproved,
          total: weekTotal,
          percentage: weekTotal > 0 ? Math.round((weekApproved / weekTotal) * 100) : 0,
        });
      }

      // Monthly stats (last 6 months)
      const monthlyStats: AttendanceAnalytics["monthlyStats"] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now);
        monthDate.setMonth(now.getMonth() - i);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        const monthSessions = sessions.filter(s => {
          const d = new Date(`${s.date}T00:00:00`);
          return d >= monthStart && d <= monthEnd;
        });

        const monthApproved = monthSessions.filter(s => s.latestStatus === 'approved').length;
        const monthTotal = monthSessions.length;

        monthlyStats.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          attended: monthApproved,
          total: monthTotal,
          percentage: monthTotal > 0 ? Math.round((monthApproved / monthTotal) * 100) : 0,
        });
      }

      // Classwise attendance
      const classBuckets = new Map<string, { approved: number; total: number }>();
      for (const s of sessions) {
        const b = classBuckets.get(s.className) || { approved: 0, total: 0 };
        b.total += 1;
        if (s.latestStatus === 'approved') b.approved += 1;
        classBuckets.set(s.className, b);
      }

      const classwiseAttendance = Array.from(classBuckets.entries()).map(([className, b]) => ({
        className,
        attended: b.approved,
        total: b.total,
        percentage: b.total > 0 ? Math.round((b.approved / b.total) * 100) : 0,
      }));

      // Status breakdown based on raw records for visibility
      const statusCounts = attendanceRecords.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recentActivity = attendanceRecords
        .slice(0, 10)
        .map(r => ({
          date: new Date(`${r.date}T00:00:00`).toLocaleDateString(),
          className: r.class,
          status: r.status,
        }));

      return {
        totalClasses: classwiseAttendance.length,
        attendedClasses: approvedSessions,
        attendancePercentage,
        weeklyAttendance,
        monthlyStats,
        classwiseAttendance,
        statusBreakdown: {
          approved: statusCounts['approved'] || 0,
          pending: statusCounts['pending'] || 0,
          rejected: statusCounts['rejected'] || 0,
          missed: 0, // Unknown without full class schedule mapping
        },
        recentActivity,
      };
    },
    enabled: !!user?.id,
  });

  // Realtime invalidation to keep analytics in sync
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('student-analytics-attendance')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance', filter: `student_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["attendance-analytics", user.id] });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'attendance', filter: `student_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["attendance-analytics", user.id] });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'attendance', filter: `student_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["attendance-analytics", user.id] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return {
    analytics,
    isLoading,
    error,
  };
};

// Hook for getting student enrollment in classes (based on actual attendance records)
export const useStudentEnrollments = () => {
  const { user } = useAuth();

  const {
    data: enrollments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["student-enrollments", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Get all events (classes) that the user has attendance records for
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from("attendance")
        .select("class")
        .eq("student_id", user.id);

      if (attendanceError) {
        throw attendanceError;
      }

      const uniqueClasses = [...new Set(attendanceRecords?.map(record => record.class) || [])];
      
      // For each class, get the corresponding event details
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in("title", uniqueClasses)
        .eq("event_type", "class");

      if (eventsError) {
        throw eventsError;
      }

      return events || [];
    },
    enabled: !!user?.id,
  });

  return {
    enrollments,
    isLoading,
    error,
  };
};
