import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scan, X } from "lucide-react";
import QrScanner from "qr-scanner";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

interface QRScannerProps {
  studentName: string;
  onClose?: () => void;
}

export const QRScannerWithLocation = ({ studentName, onClose }: QRScannerProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (videoRef.current && !scannerRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        { highlightScanRegion: true, highlightCodeOutline: true }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, []);

  const handleScanResult = async (data: string) => {
    console.log('QR scan result:', data);
    
    try {
      // Stop scanner while processing
      if (scannerRef.current) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }

      // Simplified QR handling - just mark attendance directly
      console.log('Marking attendance for QR code:', data);
      setMessage("Processing attendance...");

      try {
        console.log('Calling mark-attendance function...');
        
        const { data: result, error } = await supabase.functions.invoke('mark-attendance', {
          body: {
            qrToken: data?.toString().trim(),
            studentId: user?.id,
            studentName,
            // Remove GPS requirement for now
            studentLat: 0,
            studentLng: 0,
          }
        });

        console.log('Mark attendance response:', { result, error });

        if (error) {
          console.error("Mark attendance function error:", error);
          throw error;
        }

        // Check for success response (the function returns success: true)
        if (result && (result.success === true || result.attendance)) {
          setMessage("Attendance marked successfully ✅");
          toast.success("Attendance marked successfully!");
          
          // Force refresh attendance records immediately
          await queryClient.invalidateQueries({ queryKey: ["attendance"] });
          await queryClient.invalidateQueries({ queryKey: ["attendance", user?.id] });
          await queryClient.invalidateQueries({ queryKey: ["attendance", "all"] });
          
          // Refetch queries to update UI immediately
          queryClient.refetchQueries({ queryKey: ["attendance", user?.id] });
          queryClient.refetchQueries({ queryKey: ["attendance", "all"] });
        } else {
          const errorMsg = result?.error || "Failed to mark attendance";
          console.error("Attendance marking failed:", errorMsg);
          setMessage("Failed to mark attendance ❌");
          toast.error(errorMsg);
        }

        // Close scanner after a short delay
        setTimeout(() => {
          onClose?.();
        }, 1500);
      } catch (error) {
        console.error("Error marking attendance:", error);
        const errorMsg = error?.message || "Failed to mark attendance";
        setMessage(errorMsg + " ❌");
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error handling QR scan:", error);
      toast.error("Error processing QR code. Please try again.");
    }
  };

  const startScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.start();
        setIsScanning(true);
        setMessage("");
      }
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast.error("Failed to start camera. Check camera permissions.");
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
    } catch (error) {
      console.error("Error stopping scanner:", error);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Scan className="w-6 h-6 text-primary" />
              </div>
              Scan QR Code
            </CardTitle>
            <CardDescription className="text-base mt-1">
              Position the QR code within the camera frame to mark attendance
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 rounded-full">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="relative rounded-xl overflow-hidden shadow-inner">
          <video
            ref={videoRef}
            className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 object-cover"
            style={{ display: isScanning ? "block" : "none" }}
          />
          {!isScanning && (
            <div className="w-full h-80 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center border-2 border-dashed border-primary/20 rounded-xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Scan className="w-8 h-8 text-primary" />
                </div>
                <p className="text-base font-medium text-foreground mb-2">Ready to Scan</p>
                <p className="text-sm text-muted-foreground">Click start to activate camera</p>
              </div>
            </div>
          )}

          {/* Scanning overlay */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-primary/60 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
              </div>
              <div className="absolute inset-4 overflow-hidden rounded-lg">
                <div
                  className="absolute left-0 right-0 h-0.5 bg-primary/80 animate-pulse"
                  style={{ top: "50%", boxShadow: "0 0 10px rgba(var(--primary), 0.6)" }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              className="flex-1 h-12 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              Start Camera
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="outline"
              className="flex-1 h-12 text-base border-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              Stop Camera
            </Button>
          )}
        </div>

        {message && (
          <p className="text-center text-sm font-medium mt-2">{message}</p>
        )}
      </CardContent>
    </Card>
  );
};