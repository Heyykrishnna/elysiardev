import { useState } from "react";
import { useCalendarEvents } from "@/hooks/useCalendar";
import { useStudentClasses, useAttendanceAnalytics } from "@/hooks/useClassSchedules";
import { useAllAttendance } from "@/hooks/useAttendance";
import { Layout } from "@/components/Layout";
import { BackToDashboard } from "@/components/BackToDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { runMigrations } from "@/utils/applyMigration";
import { toast } from "sonner";

export default function TestData() {
  const [isMigrating, setIsMigrating] = useState(false);
  const { data: calendarEvents, isLoading: calendarLoading } = useCalendarEvents();
  const { 
    upcomingClasses, 
    enrolledClasses, 
    availableClasses, 
    isLoading: studentLoading 
  } = useStudentClasses();
  const { attendanceAnalytics } = useAttendanceAnalytics();
  const { allAttendanceRecords } = useAllAttendance();

  const handleRunMigrations = async () => {
    setIsMigrating(true);
    try {
      await runMigrations();
      toast.success("Migrations completed! Check the console for details.");
      // Refresh the page to see new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.error("Migration failed! Check the console for details.");
      console.error("Migration error:", error);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Layout backgroundVariant="gradient-blue">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center mb-6">
          <BackToDashboard />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Data Debug Page</h1>
          <Button 
            onClick={handleRunMigrations} 
            disabled={isMigrating}
            className="flex items-center gap-2"
          >
            {isMigrating ? "Running..." : "Run Migrations & Add Sample Data"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Calendar Events */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Loading: {calendarLoading ? "Yes" : "No"}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Total Events: {calendarEvents?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Class Events: {calendarEvents?.filter(e => e.event_type === 'class').length || 0}
              </p>
              <div className="mt-4 max-h-40 overflow-y-auto">
                {calendarEvents?.slice(0, 5).map(event => (
                  <div key={event.id} className="text-xs border-b py-1">
                    <strong>{event.title}</strong><br />
                    Type: {event.event_type}<br />
                    Date: {event.event_date}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Student Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Loading: {studentLoading ? "Yes" : "No"}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Upcoming: {upcomingClasses?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Enrolled: {enrolledClasses?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Available: {availableClasses?.length || 0}
              </p>
              <div className="mt-4 max-h-40 overflow-y-auto">
                {enrolledClasses?.slice(0, 3).map(enrollment => (
                  <div key={enrollment.id} className="text-xs border-b py-1">
                    <strong>{enrollment.events?.title || 'N/A'}</strong><br />
                    Status: {enrollment.status}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Total Records: {allAttendanceRecords?.length || 0}
              </p>
              <div className="mt-4 max-h-40 overflow-y-auto">
                {allAttendanceRecords?.slice(0, 5).map(record => (
                  <div key={record.id} className="text-xs border-b py-1">
                    <strong>{record.full_name}</strong><br />
                    Class: {record.class}<br />
                    Status: {record.status}<br />
                    Date: {record.date}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Student Attendance Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Stats Count: 0
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                No detailed stats available yet
              </p>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Analytics Records: {attendanceAnalytics?.length || 0}
              </p>
              <div className="mt-4 max-h-40 overflow-y-auto">
                {attendanceAnalytics?.slice(0, 3).map(analytic => (
                  <div key={analytic.id} className="text-xs border-b py-1">
                    <strong>{analytic.events?.title || 'N/A'}</strong><br />
                    Enrolled: {analytic.total_enrolled}<br />
                    Present: {analytic.total_present}<br />
                    Rate: {analytic.attendance_percentage.toFixed(1)}%
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Raw Data Sample */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Data Sample</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                <strong>First Calendar Event:</strong><br />
                <pre>{JSON.stringify(calendarEvents?.[0], null, 2)}</pre>
                
                <strong className="block mt-2">First Enrollment:</strong><br />
                <pre>{JSON.stringify(enrolledClasses?.[0], null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}