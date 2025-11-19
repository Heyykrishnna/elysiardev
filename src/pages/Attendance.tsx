import { useState, useEffect } from "react";
import { useAttendance } from "@/hooks/useAttendance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Calendar, Phone, QrCode, Scan, Trash2, GraduationCap, User, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { BackToDashboard } from "@/components/BackToDashboard";
import { Layout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QRScannerWithLocation } from "@/components/QRScanner";
import { useAuth } from "@/contexts/AuthContext";

const attendanceSchema = z.object({
  phone_number: z.string()
    .regex(/^[9876]\d{9}$/, "Phone number must be 10 digits starting with 9, 8, 7, or 6"),
  class: z.string().min(1, "Please enter your class"),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

export default function Attendance() {
  const { attendanceRecords, markAttendance, isMarkingAttendance, deleteAttendance, isDeletingAttendance } = useAttendance();
  const [showForm, setShowForm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { user, profile } = useAuth();
  
  // Debug logging
  console.log('Attendance Page - User:', user?.id, 'Records:', attendanceRecords);

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      phone_number: "",
      class: "",
    },
  });

  const onSubmit = (data: AttendanceFormData) => {
    // Use logged-in user's email
    if (user?.email && data.phone_number && data.class) {
      markAttendance({
        email: user.email,
        phone_number: data.phone_number,
        class: data.class,
      });
      form.reset();
      setShowForm(false);
    }
  };

  // Check if attendance is already marked for today
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getLocalDateString(new Date());
  const todayAttendance = (attendanceRecords || [])
    .filter(record => record.date === today)
    .sort((a, b) => new Date(b.time_marked).getTime() - new Date(a.time_marked).getTime());

  const hasMarkedAttendanceToday = todayAttendance.length > 0;
  const canMarkMoreToday = todayAttendance.length < 3;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Approval</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Layout backgroundVariant="gradient-blue">
      <div className="container mx-auto p-6 space-y-8">
        {/* Back to Dashboard Button */}
        <div className="flex items-center mb-6">
          <BackToDashboard />
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-6 shadow-2xl">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mark Attendance
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Please mark your attendance for today either through manual entry or by scanning the QR code.
          </p>
          {user?.email && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-2 text-sm text-blue-700 bg-blue-100/70 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-200 shadow-sm">
                <User className="w-4 h-4" />
                Logged in as: <span className="font-semibold">{user.email}</span>
              </div>
              <Link to="/student-portal" className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <BookOpen className="w-4 h-4" />
                Visit Student Portal
              </Link>
            </div>
          )}
        </div>

        {/* Today's Attendance Card */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm ring-1 ring-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-t-lg border-b border-blue-100">
            <CardTitle className="flex items-center gap-3 text-2xl text-gray-800">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              Today's Attendance
            </CardTitle>
            <CardDescription className="text-base text-gray-600 font-medium">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            {hasMarkedAttendanceToday ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-4 shadow-xl">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">
                  Attendance Marked!
                </h3>
              <p className="text-muted-foreground mb-4">
                You have marked attendance {todayAttendance.length} time{todayAttendance.length > 1 ? 's' : ''} today
              </p>
              <div className="space-y-2">
                {todayAttendance.map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="text-sm">
                      <span className="font-medium">#{index + 1}</span> - {new Date(record.time_marked).toLocaleTimeString()}
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(record.status)}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteAttendance(record.id)}
                      disabled={isDeletingAttendance}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {canMarkMoreToday && (
                  <p className="text-sm text-blue-600 font-medium">
                    📝 You can mark attendance {3 - todayAttendance.length} more time{3 - todayAttendance.length > 1 ? 's' : ''} today
                  </p>
                )}
              </div>
            </div>
          ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mb-4 shadow-xl">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">
                  Mark Today's Attendance
                </h3>
                <p className="text-gray-600 mb-6 text-base">
                  Choose your preferred method to mark attendance
                  {hasMarkedAttendanceToday && (
                    <span className="block text-sm text-blue-600 mt-2 font-semibold">
                      ({3 - todayAttendance.length} attempts remaining today)
                    </span>
                  )}
                </p>
                <div className="grid gap-4 max-w-md mx-auto">
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="w-full h-14 text-base bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    disabled={!canMarkMoreToday}
                  >
                    <Phone className="w-5 h-5 mr-3" />
                    Manual Entry
                  </Button>
                  <Button 
                    onClick={() => setShowQRScanner(true)}
                    className="w-full h-14 text-base border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    variant="outline"
                    disabled={!canMarkMoreToday}
                  >
                    <QrCode className="w-5 h-5 mr-3" />
                    Scan QR Code
                  </Button>
                {!canMarkMoreToday && (
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ Daily limit reached (3 attempts maximum)
                  </p>
                )}
              </div>
            </div>
          )}

            {/* Manual Form */}
            {showForm && canMarkMoreToday && (
              <div className="border-t border-blue-200 pt-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-b-lg -mx-8 px-8 pb-8">
                <div className="mb-6">
                  <h4 className="text-xl font-bold mb-3 text-gray-800">Manual Attendance Entry</h4>
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600">
                      Email: <span className="font-semibold text-blue-700">{user?.email}</span>
                    </p>
                  </div>
                </div>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="phone_number" className="text-base font-semibold text-gray-700">Phone Number</Label>
                    <Input
                      id="phone_number"
                      {...form.register("phone_number")}
                      placeholder="Enter 10-digit phone number (9876543210)"
                      className="h-12 text-base border-2 border-blue-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 bg-white/80"
                      maxLength={10}
                    />
                    {form.formState.errors.phone_number && (
                      <p className="text-sm text-red-600 mt-2 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                        {form.formState.errors.phone_number.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                      Must start with 9, 8, 7, or 6 and be exactly 10 digits
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="class" className="text-base font-semibold text-gray-700">Class</Label>
                    <Input
                      id="class"
                      {...form.register("class")}
                      placeholder="Enter your class (e.g., Computer Science 101)"
                      className="h-12 text-base border-2 border-blue-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 bg-white/80"
                    />
                    {form.formState.errors.class && (
                      <p className="text-sm text-red-600 mt-2 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                        {form.formState.errors.class.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button 
                      type="submit" 
                      disabled={isMarkingAttendance || !canMarkMoreToday}
                      className="flex-1 h-12 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      {isMarkingAttendance ? "Submitting..." : "Submit Attendance"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="h-12 text-base border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* QR Scanner Modal */}
            {showQRScanner && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <QRScannerWithLocation 
                  studentName={profile?.full_name || user?.email || "Student"}
                  onClose={() => setShowQRScanner(false)} 
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance History Card */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm ring-1 ring-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-t-lg border-b border-purple-100">
            <CardTitle className="flex items-center gap-3 text-2xl text-gray-800">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              Attendance History
            </CardTitle>
            <CardDescription className="text-base text-gray-600 font-medium">
              Your attendance records and their current status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              {attendanceRecords && attendanceRecords.length > 0 ? (
                <div className="space-y-4">
                  {attendanceRecords.map((record, index) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-xl bg-gradient-to-r from-white/60 to-purple-50/60 hover:from-white/80 hover:to-purple-50/80 transition-all duration-300 hover:shadow-lg hover:border-purple-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-base">
                            {new Date(`${record.date}T00:00:00`).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Marked at {new Date(record.time_marked).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            Class: {record.class}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(record.status)}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteAttendance(record.id)}
                          disabled={isDeletingAttendance}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/50 rounded-full mb-4">
                    <Calendar className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-lg font-medium mb-2">No attendance records yet</p>
                  <p className="text-sm">Mark your first attendance above to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
