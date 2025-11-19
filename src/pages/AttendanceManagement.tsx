import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, FileText, Download, Check, X, QrCode, Clock, MapPin, BookOpen, BarChart3, Plus, Edit, Trash2, Link } from "lucide-react";
import { useAllAttendance } from "@/hooks/useAttendance";
import { useClassSchedules, useAttendanceAnalytics } from "@/hooks/useClassSchedules";
import { useCalendarEvents } from "@/hooks/useCalendar";
import { QRCodeManager } from "@/components/QRCodeGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getEventDuration, getEventInstructor, getEventLocation } from "@/utils/eventUtils";
import { BackToDashboard } from '@/components/BackToDashboard';

export const AttendanceManagement = () => {
  const queryClient = useQueryClient();
  const { allAttendanceRecords, approveAttendance, isUpdating } = useAllAttendance();
  const { classSchedules, createClassSchedule, isCreating, deleteClassSchedule, isDeleting } = useClassSchedules();
  const { attendanceAnalytics } = useAttendanceAnalytics();
  const { data: calendarEvents } = useCalendarEvents({ event_types: ['class'] });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState<"records" | "qr" | "classes" | "analytics">("records");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    title: "",
    description: "",
    instructor_name: "",
    event_date: new Date().toISOString().split('T')[0],
    event_time: "09:00",
    duration_minutes: 60,
    location: "",
    max_students: 50,
  });
  
  // Debug logging
  console.log('AttendanceManagement - All records:', allAttendanceRecords);

  // Set up real-time updates for attendance records
  useEffect(() => {
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance'
        },
        (payload) => {
          console.log('New attendance record:', payload);
          // Refresh the attendance records
          queryClient.invalidateQueries({ queryKey: ["attendance", "all"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'attendance'
        },
        (payload) => {
          console.log('Attendance record updated:', payload);
          // Refresh the attendance records
          queryClient.invalidateQueries({ queryKey: ["attendance", "all"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Filter records based on search term and date
  const filteredRecords = allAttendanceRecords?.filter((record) => {
    const matchesSearch = record.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate === "" || record.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  // Calculate statistics
  const todayCount = allAttendanceRecords?.filter(
    (record) => record.date === new Date().toISOString().split('T')[0]
  ).length || 0;

  const totalStudents = new Set(allAttendanceRecords?.map(record => record.student_id)).size;

  const exportToCSV = () => {
    if (!filteredRecords?.length) return;

    const headers = ["Date", "Name", "Email", "Phone", "Class", "Time Marked", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredRecords.map(record => [
        record.date,
        record.full_name,
        record.email,
        record.phone_number,
        record.class,
        new Date(record.time_marked).toLocaleTimeString(),
        record.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateClass = () => {
    if (!newClass.title || !newClass.instructor_name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    createClassSchedule(newClass);
    
    // Reset form
    setNewClass({
      title: "",
      description: "",
      instructor_name: "",
      event_date: new Date().toISOString().split('T')[0],
      event_time: "09:00",
      duration_minutes: 60,
      location: "",
      max_students: 50,
    });
    
    setIsCreateDialogOpen(false);
  };

  const handleStatusUpdate = (id: string, status: "approved" | "rejected") => {
    approveAttendance({ id, status });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-8">
            <BackToDashboard />
          </div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">
            View and manage student attendance records
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === "records" ? "default" : "ghost"}
          className="flex-1"
          onClick={() => setActiveTab("records")}
        >
          <Users className="w-4 h-4 mr-2" />
          Attendance Records
        </Button>
        <Button
          variant={activeTab === "classes" ? "default" : "ghost"}
          className="flex-1"
          onClick={() => setActiveTab("classes")}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Class Management
        </Button>
        <Button
          variant={activeTab === "qr" ? "default" : "ghost"}
          className="flex-1"
          onClick={() => setActiveTab("qr")}
        >
          <QrCode className="w-4 h-4 mr-2" />
          QR Codes
        </Button>
        <Button
          variant={activeTab === "analytics" ? "default" : "ghost"}
          className="flex-1"
          onClick={() => setActiveTab("analytics")}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </div>

      {activeTab === "records" ? (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayCount}</div>
                <p className="text-xs text-muted-foreground">
                  Students marked present today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  Unique students with attendance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allAttendanceRecords?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All attendance records
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Events</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calendarEvents?.filter(e => e.event_type === 'class').length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Calendar class events
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Export */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Records</CardTitle>
              <CardDescription>
                Search by name, email, or class. Filter by date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, email, or class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                    placeholder="Filter by date"
                  />
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedDate("");
                    }} 
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                  <Button onClick={exportToCSV} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
              {(searchTerm || selectedDate) && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredRecords?.length || 0} of {allAttendanceRecords?.length || 0} records
                  {searchTerm && ` matching "${searchTerm}"`}
                  {selectedDate && ` for ${new Date(selectedDate).toLocaleDateString()}`}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                All student attendance records with approval actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRecords && filteredRecords.length > 0 ? (
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <div>
                          <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.time_marked).toLocaleTimeString()}
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-medium">{record.full_name}</p>
                          <p className="text-sm text-muted-foreground">{record.email}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm">{record.phone_number}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm">{record.class}</p>
                        </div>
                        
                        <div>
                          <Badge 
                            variant={
                              record.status === 'approved' ? 'default' : 
                              record.status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {record.status}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          {record.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(record.id, 'approved')}
                                disabled={isUpdating}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(record.id, 'rejected')}
                                disabled={isUpdating}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : activeTab === "classes" ? (
        <>
          {/* Class Management */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Class Management</h2>
              <p className="text-muted-foreground">Create classes and generate QR codes from calendar events</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Class Schedule</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new class schedule.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Class Title *</Label>
                    <Input
                      id="title"
                      value={newClass.title}
                      onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                      placeholder="e.g., Mathematics 101 - Advanced Calculus"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newClass.description}
                      onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                      placeholder="Brief description of the class content"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor_name">Instructor Name *</Label>
                    <Input
                      id="instructor_name"
                      value={newClass.instructor_name}
                      onChange={(e) => setNewClass({ ...newClass, instructor_name: e.target.value })}
                      placeholder="e.g., Dr. Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newClass.location}
                      onChange={(e) => setNewClass({ ...newClass, location: e.target.value })}
                      placeholder="e.g., Room A-101"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event_date">Date</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={newClass.event_date}
                      onChange={(e) => setNewClass({ ...newClass, event_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event_time">Time</Label>
                    <Input
                      id="event_time"
                      type="time"
                      value={newClass.event_time}
                      onChange={(e) => setNewClass({ ...newClass, event_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      value={newClass.duration_minutes}
                      onChange={(e) => setNewClass({ ...newClass, duration_minutes: parseInt(e.target.value) })}
                      min="15"
                      max="480"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_students">Max Students</Label>
                    <Input
                      id="max_students"
                      type="number"
                      value={newClass.max_students}
                      onChange={(e) => setNewClass({ ...newClass, max_students: parseInt(e.target.value) })}
                      min="1"
                      max="200"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateClass} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Class"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Calendar Classes and QR Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar Classes & QR Generation</CardTitle>
              <CardDescription>Manage classes from calendar and generate QR codes</CardDescription>
            </CardHeader>
            <CardContent>
              {calendarEvents && calendarEvents.filter(e => e.event_type === 'class').length > 0 ? (
                <div className="space-y-4">
                  {calendarEvents.filter(e => e.event_type === 'class').map((classEvent) => (
                    <div key={classEvent.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">{classEvent.title}</h3>
                              <p className="text-sm text-muted-foreground">Class Event</p>
                              {classEvent.description && (
                                <p className="text-sm text-muted-foreground mt-1">{classEvent.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              {getEventInstructor(classEvent) && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span>{getEventInstructor(classEvent)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{new Date(classEvent.event_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{classEvent.event_time} ({getEventDuration(classEvent)}min)</span>
                              </div>
                              {getEventLocation(classEvent) && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span>{getEventLocation(classEvent)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              classEvent.status === 'confirmed' ? 'default' :
                              classEvent.status === 'tentative' ? 'secondary' :
                              classEvent.status === 'cancelled' ? 'destructive' :
                              'outline'
                            }
                          >
                            {classEvent.status || 'confirmed'}
                          </Badge>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              // Generate QR for this calendar event
                              // This will be handled by the QR management tab
                              setActiveTab('qr');
                            }}
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            Generate QR
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No class events in calendar</p>
                  <p className="text-sm">Create class events in the calendar or use the form above to add new classes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : activeTab === "analytics" ? (
        <>
          {/* Attendance Analytics */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Attendance Analytics</h2>
              <p className="text-muted-foreground">Track attendance performance across all classes</p>
            </div>

            {attendanceAnalytics && attendanceAnalytics.length > 0 ? (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(attendanceAnalytics.reduce((sum, record) => sum + record.attendance_percentage, 0) / attendanceAnalytics.length).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Across all classes
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Classes Tracked</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {new Set(attendanceAnalytics.map(record => record.class_schedule_id)).size}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unique classes with data
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Best Performing Class</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.max(...attendanceAnalytics.map(record => record.attendance_percentage)).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Highest attendance rate
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Trends</CardTitle>
                    <CardDescription>Attendance percentage over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={attendanceAnalytics.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="attendance_percentage" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          name="Attendance %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Class Performance Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Class Performance Comparison</CardTitle>
                    <CardDescription>Attendance rates by class</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={attendanceAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="events.title" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="attendance_percentage" fill="#82ca9d" name="Attendance %" />
                        <Bar dataKey="total_enrolled" fill="#8884d8" name="Enrolled" />
                        <Bar dataKey="total_present" fill="#ffc658" name="Present" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Detailed Analytics Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Analytics</CardTitle>
                    <CardDescription>Complete breakdown by class and date</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {attendanceAnalytics.map((record) => (
                        <div key={record.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div>
                              <p className="font-medium">{record.events?.title}</p>
                              <p className="text-sm text-muted-foreground">{record.events?.event_type}</p>
                            </div>
                            <div>
                              <p className="text-sm">{new Date(record.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">{record.total_enrolled}</p>
                              <p className="text-xs text-muted-foreground">Enrolled</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">{record.total_present}</p>
                              <p className="text-xs text-muted-foreground">Present</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">{record.attendance_percentage.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">Rate</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No analytics data available</p>
                <p className="text-sm">Analytics will appear once students start marking attendance</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <QRCodeManager />
      )}
    </div>
  );
};