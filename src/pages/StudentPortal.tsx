import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, MapPin, Users, BookOpen, TrendingUp, Award, ChevronRight, Plus, Minus, BarChart3 } from "lucide-react";
import { useStudentClasses } from "@/hooks/useClassSchedules";
import { useAttendanceAnalytics, useStudentEnrollments } from "@/hooks/useAttendanceAnalytics";
import { Layout } from "@/components/Layout";
import { BackToDashboard } from "@/components/BackToDashboard";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from "sonner";
import { getEventDuration, getEventInstructor, getEventLocation } from "@/utils/eventUtils";
import { CalendarEvent } from "@/types/calendar";
import Loader from "@/components/loader";
import StudentLoader from "@/components/studentportalload";

export default function StudentPortal() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  const { 
    upcomingClasses, 
    enrolledClasses, 
    availableClasses, 
    enrollInClass, 
    dropFromClass, 
    isEnrolling, 
    isDropping,
    isLoading 
  } = useStudentClasses();
  const { analytics, isLoading: analyticsLoading } = useAttendanceAnalytics();
  const { enrollments } = useStudentEnrollments();
  const [activeTab, setActiveTab] = useState<"upcoming" | "enrolled" | "available" | "analytics">("upcoming");

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Use the analytics data from the new hook
  const overallAttendanceRate = analytics?.attendancePercentage || 0;
  const totalClassesAttended = analytics?.attendedClasses || 0;
  const totalEnrolledClasses = analytics?.totalClasses || 0;

  // Format upcoming classes for display
  const formattedUpcomingClasses = upcomingClasses?.map(enrollment => ({
    ...enrollment.events,
    event_type: (enrollment.events.event_type || 'class') as CalendarEvent['event_type'],
    enrollment_id: enrollment.id,
    enrollment_status: enrollment.status,
    priority: 'normal' as const,
    status: 'confirmed' as const,
    is_all_day: false,
    is_recurring: false,
    visibility: 'public' as const
  })) || [];

  // Format enrolled classes for display
  const formattedEnrolledClasses = enrolledClasses?.map(enrollment => ({
    ...enrollment.events,
    event_type: (enrollment.events.event_type || 'class') as CalendarEvent['event_type'],
    enrollment_id: enrollment.id,
    enrollment_status: enrollment.status,
    priority: 'normal' as const,
    status: 'confirmed' as const,
    is_all_day: false,
    is_recurring: false,
    visibility: 'public' as const
  })) || [];

  const handleEnroll = (classId: string) => {
    enrollInClass(classId);
  };

  const handleDrop = (classId: string) => {
    dropFromClass(classId);
  };

  const isEnrolledInClass = (classId: string) => {
    return formattedEnrolledClasses.some(cls => cls.id === classId);
  };

  const getTimeUntilClass = (date: string, time: string) => {
    const classDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diffMs = classDateTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Class time has passed";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      return `in ${days} day${days > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `in ${diffHours}h ${diffMinutes}m`;
    } else {
      return `in ${diffMinutes}m`;
    }
  };

  if (isLoading || showLoader) {
    return (
      <div className="bg-black min-h-screen">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <StudentLoader />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout backgroundVariant="gradient-blue">
      <div className="container mx-auto p-6 space-y-8">
        {/* Back to Dashboard */}
        <div className="flex items-center mb-6">
          <BackToDashboard />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-6 shadow-2xl">
            <Loader />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Student Portal
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage your classes, track attendance, and view your academic progress.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formattedEnrolledClasses.length}</div>
              <p className="text-xs text-muted-foreground">Active enrollments</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formattedUpcomingClasses.length}</div>
              <p className="text-xs text-muted-foreground">Classes this week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallAttendanceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes Attended</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClassesAttended}</div>
              <p className="text-xs text-muted-foreground">Total sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-muted p-1 rounded-lg mb-8">
          <Button
            variant={activeTab === "upcoming" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab("upcoming")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming
          </Button>
          <Button
            variant={activeTab === "enrolled" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab("enrolled")}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            My Classes
          </Button>
          <Button
            variant={activeTab === "available" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab("available")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Enroll
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

        {/* Tab Content */}
        {activeTab === "upcoming" && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Classes
              </CardTitle>
              <CardDescription>
                Your next classes and their schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formattedUpcomingClasses.length > 0 ? (
                <div className="space-y-4">
                  {formattedUpcomingClasses.map((classSchedule) => (
                    <div key={classSchedule.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <div>
                              <h3 className="font-semibold text-lg">{classSchedule.title}</h3>
                              <p className="text-sm text-muted-foreground">{classSchedule.event_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 mt-2 text-sm">
                            {getEventInstructor(classSchedule) && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{getEventInstructor(classSchedule)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(classSchedule.event_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{classSchedule.event_time}</span>
                            </div>
                            {getEventLocation(classSchedule) && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{getEventLocation(classSchedule)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium text-blue-600">
                              {getTimeUntilClass(classSchedule.event_date, classSchedule.event_time)}
                            </p>
                            <p className="text-xs text-muted-foreground">{getEventDuration(classSchedule)} minutes</p>
                          </div>
                          <Link to="/attendance">
                            <Button size="sm" className="flex items-center gap-1">
                              Mark Attendance
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No upcoming classes</p>
                  <p className="text-sm">Check the "Enroll" tab to join new classes</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "enrolled" && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                My Enrolled Classes
              </CardTitle>
              <CardDescription>
                Classes you are currently enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formattedEnrolledClasses.length > 0 ? (
                <div className="space-y-4">
                  {formattedEnrolledClasses.map((classSchedule) => (
                    <div key={classSchedule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{classSchedule.title}</h3>
                              <p className="text-sm text-muted-foreground">{classSchedule.event_type}</p>
                              {classSchedule.description && (
                                <p className="text-sm text-gray-600 mt-1">{classSchedule.description}</p>
                              )}
                            </div>
                            <Badge variant="default">Enrolled</Badge>
                          </div>
                          <div className="flex items-center gap-6 mt-3 text-sm">
                            {getEventInstructor(classSchedule) && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{getEventInstructor(classSchedule)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(classSchedule.event_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{classSchedule.event_time} ({getEventDuration(classSchedule)}min)</span>
                            </div>
                            {getEventLocation(classSchedule) && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{getEventLocation(classSchedule)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No enrolled classes</p>
                  <p className="text-sm">Browse available classes to start your learning journey</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "available" && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Available Classes
              </CardTitle>
              <CardDescription>
                Enroll in new classes to expand your learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableClasses && availableClasses.length > 0 ? (
                <div className="space-y-4">
                  {availableClasses.map((classSchedule) => (
                    <div key={classSchedule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{classSchedule.title}</h3>
                              <p className="text-sm text-muted-foreground">{classSchedule.event_type}</p>
                              {classSchedule.description && (
                                <p className="text-sm text-gray-600 mt-1">{classSchedule.description}</p>
                              )}
                            </div>
                            <Badge 
                              variant={isEnrolledInClass(classSchedule.id) ? "default" : "secondary"}
                            >
                              {isEnrolledInClass(classSchedule.id) ? "Enrolled" : "Available"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 mt-3 text-sm">
                            {getEventInstructor(classSchedule) && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{getEventInstructor(classSchedule)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(classSchedule.event_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{classSchedule.event_time} ({getEventDuration(classSchedule)}min)</span>
                            </div>
                            {getEventLocation(classSchedule) && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{getEventLocation(classSchedule)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isEnrolledInClass(classSchedule.id) ? (
                            <Button
                              size="sm"
                              onClick={() => handleEnroll(classSchedule.id)}
                              disabled={isEnrolling}
                              className="flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Enroll
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDrop(classSchedule.id)}
                              disabled={isDropping}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Minus className="w-4 h-4 mr-1" />
                              Drop
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No classes available</p>
                  <p className="text-sm">New classes will appear here when instructors create them</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">My Attendance Analytics</h2>
              <p className="text-muted-foreground">Track your attendance performance and progress</p>
            </div>

            {!analyticsLoading && analytics && analytics.totalClasses > 0 ? (
              <>
                {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Approved</CardTitle>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{analytics.statusBreakdown.approved}</div>
                      <p className="text-xs text-muted-foreground">Classes attended</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{analytics.statusBreakdown.pending}</div>
                      <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{analytics.statusBreakdown.rejected}</div>
                      <p className="text-xs text-muted-foreground">Not approved</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Weekly Attendance Trend</CardTitle>
                      <CardDescription>Last 8 weeks performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={analytics.weeklyAttendance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="percentage" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Classwise Attendance</CardTitle>
                      <CardDescription>Attendance rate by class</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={analytics.classwiseAttendance}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ className }) => className.length > 10 ? className.substring(0, 10) + '...' : className}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="attended"
                          >
                            {analytics.classwiseAttendance.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Stats */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Class Performance Details</CardTitle>
                    <CardDescription>Detailed breakdown by class</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.classwiseAttendance.map((classStats, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div>
                              <p className="font-medium">{classStats.className}</p>
                              <p className="text-sm text-muted-foreground">Class</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{classStats.total}</p>
                              <p className="text-xs text-muted-foreground">Total Marked</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{classStats.attended}</p>
                              <p className="text-xs text-muted-foreground">Approved</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600">{classStats.percentage.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">Success Rate</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Recent Attendance Activity</CardTitle>
                    <CardDescription>Your latest attendance submissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'approved' ? 'bg-green-500' :
                            activity.status === 'pending' ? 'bg-yellow-500' :
                            activity.status === 'missed' ? 'bg-gray-500' : 'bg-red-500'
                          }`}></div>
                            <div>
                              <p className="font-medium text-sm">{activity.className}</p>
                              <p className="text-xs text-muted-foreground">{activity.date}</p>
                            </div>
                          </div>
                          <Badge variant={
                            activity.status === 'approved' ? 'default' :
                            activity.status === 'pending' ? 'secondary' :
                            activity.status === 'missed' ? 'outline' : 'destructive'
                          }>
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : analyticsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading your analytics...</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No attendance data yet</p>
                <p className="text-sm">Start attending classes to see your performance analytics</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}