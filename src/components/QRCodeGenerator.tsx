import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Download, Eye, EyeOff, MapPin, Clock, Calendar } from "lucide-react";
import { useQRCodes } from "@/hooks/useQRCodes";
import { useCalendarEvents } from "@/hooks/useCalendar";
import QRCodeLib from "qrcode";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const QRCodeManager = () => {
  const { qrCodes, createQRCode, isCreating, toggleQRCode, isToggling } = useQRCodes();
  const { data: calendarEvents } = useCalendarEvents({ event_types: ['class'] });
  const [className, setClassName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeLimit, setTimeLimit] = useState("60"); // Default 60 minutes
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<string>("");
  const [session, setSession] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Create QR Code from form
  const handleCreateQRCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    // Calculate expiration time
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + parseInt(timeLimit));

    createQRCode({
      class_name: className,
      date: date,
      expires_at: expirationTime.toISOString(),
    });
    setClassName("");
    setDate(new Date().toISOString().split('T')[0]);
    setTimeLimit("60");
  };

  // Generate QR image on canvas
  const generateQRImage = async (qrData: any) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Create QR data with class_name included
      const qrPayload = {
        class_name: qrData.class_name,
        date: qrData.date,
        owner_id: qrData.owner_id,
        type: 'attendance'
      };
      const qrString = JSON.stringify(qrPayload);
      await QRCodeLib.toCanvas(canvas, qrString, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code image");
    }
  };

  // Download QR code as PNG
  const downloadQRCode = async (qrData: any) => {
    try {
      // Create QR data with class_name included
      const qrPayload = {
        class_name: qrData.class_name,
        date: qrData.date,
        owner_id: qrData.owner_id,
        type: 'attendance'
      };
      const qrString = JSON.stringify(qrPayload);
      const qrDataUrl = await QRCodeLib.toDataURL(qrString, {
        width: 400,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      const link = document.createElement("a");
      link.download = `attendance-qr-${qrData.class_name}-${qrData.date}.png`;
      link.href = qrDataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Failed to download QR code");
    }
  };

  // Generate session QR using location
  const handleGenerateSessionQR = () => {
    console.log('Starting session QR generation...');
    
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      toast.error("Enable location services");
      return;
    }

    console.log('Requesting location permission...');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      console.log('Location obtained:', { latitude, longitude });
      
      try {
        console.log('Calling Supabase edge function...');
        
        const { data, error } = await supabase.functions.invoke('create-session', {
          body: {
            classId: "CLASS101",
            teacherLat: latitude,
            teacherLng: longitude,
            radiusMeters: 50,
          }
        });

        console.log('Edge function response:', { data, error });

        if (error) {
          console.error("Supabase function error:", error);
          throw error;
        }

        if (data?.session) {
          console.log('Session created successfully:', data.session);
          setSession(data.session);
          toast.success("Session QR generated!");
        } else {
          console.error('No session data returned:', data);
          throw new Error('No session data returned from server');
        }
      } catch (error) {
        console.error("Error creating session:", error);
        toast.error("Failed to generate session QR: " + (error.message || error));
      }
    }, (error) => {
      console.error("Geolocation error:", error);
      toast.error("Failed to get location: " + error.message);
    });
  };

  // Create QR Code from calendar event
  const handleCreateQRFromCalendar = async () => {
    const selectedEvent = calendarEvents?.find(e => e.id === selectedCalendarEvent);
    if (!selectedEvent) {
      toast.error("Please select a calendar event");
      return;
    }

    // Calculate expiration time
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + parseInt(timeLimit));

    createQRCode({
      class_name: selectedEvent.title,
      date: selectedEvent.event_date,
      expires_at: expirationTime.toISOString(),
    });
    setSelectedCalendarEvent("");
  };

  return (
    <div className="space-y-6">

      {/* Calendar Event QR Code Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Generate QR from Calendar Events
          </CardTitle>
          <CardDescription>Create QR codes from existing calendar class events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="calendarEvent">Select Calendar Event</Label>
              <Select value={selectedCalendarEvent} onValueChange={setSelectedCalendarEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class event..." />
                </SelectTrigger>
                <SelectContent>
                  {calendarEvents?.filter(e => e.event_type === 'class').map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} - {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
              {!calendarEvents?.length && (
                <p className="text-sm text-muted-foreground mt-2">
                  No class events found. Create some events in your calendar first.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="calendarTimeLimit">QR Code Expires After</Label>
              <Select value={timeLimit} onValueChange={setTimeLimit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleCreateQRFromCalendar} 
              disabled={isCreating || !selectedCalendarEvent}
              className="w-full"
            >
              {isCreating ? "Creating..." : "Generate QR Code from Calendar Event"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual QR Code Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Manual QR Code Generator
          </CardTitle>
          <CardDescription>Create QR codes manually for custom classes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateQRCode} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g., Mathematics 101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="timeLimit">QR Code Expires After</Label>
                <Select value={timeLimit} onValueChange={setTimeLimit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                    <SelectItem value="1440">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={isCreating} className="w-full">
              {isCreating ? "Creating..." : "Generate QR Code"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Session QR Code Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Generate Session QR (Location-based)
          </CardTitle>
          <CardDescription>Generates QR code for live attendance using your location</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateSessionQR} className="w-full mb-4">
            Generate Session QR
          </Button>
              {session && (
                <div className="flex flex-col items-center gap-2">
                  <QRCodeSVG value={JSON.stringify({
                    qr_token: session.qr_token,
                    event_id: session.class_id || null,
                    type: 'session'
                  })} size={200} />
                  <p>Expires: {new Date(session.expires_at).toLocaleTimeString()}</p>
                </div>
              )}
        </CardContent>
      </Card>

      {/* List of generated QR Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Generated QR Codes</CardTitle>
          <CardDescription>Manage your attendance QR codes</CardDescription>
        </CardHeader>
        <CardContent>
          {qrCodes && qrCodes.length > 0 ? (
            <div className="space-y-4">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{qr.class_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(qr.date).toLocaleDateString()}
                      </p>
                      {qr.expires_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires: {new Date(qr.expires_at).toLocaleString()}
                          {new Date(qr.expires_at) < new Date() && (
                            <Badge variant="destructive" className="ml-2 text-xs">Expired</Badge>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={qr.is_active ? "default" : "secondary"}>
                        {qr.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleQRCode({ id: qr.id, is_active: !qr.is_active })}
                        disabled={isToggling}
                      >
                        {qr.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        const qrPayload = {
                          class_name: qr.class_name,
                          date: qr.date,
                          owner_id: qr.owner_id,
                          type: 'attendance'
                        };
                        generateQRImage({ ...qr, qr_data: qrPayload });
                      }}>
                        View QR
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadQRCode(qr)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No QR codes generated yet. Create your first QR code above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Hidden canvas for QR generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};
