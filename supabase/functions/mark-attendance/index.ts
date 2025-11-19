import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ/2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Mark attendance request received');
    const body = await req.json();
    console.log('Request body:', body);
    
    const { qrToken, studentId, studentName, studentLat, studentLng } = body;

    const token = (qrToken || '').toString().trim();
    if (!token) {
      console.error('Missing QR token');
      return new Response(JSON.stringify({ error: "Missing QR token" }), { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Make location optional for simplified QR attendance
    const hasLocationData = typeof studentLat === "number" && typeof studentLng === "number" && studentLat !== 0 && studentLng !== 0;
    console.log('Location data available:', hasLocationData, { studentLat, studentLng });

    // Extract class name from QR data
    let sessionClass = "QR Attendance";
    let session = null;
    let classDateFromQR: string | null = null;
    
    // Try to parse QR token as JSON to get class name
    try {
      const qrData = JSON.parse(token);
      console.log('Parsed QR data for class extraction:', qrData);
      
      // Normalize potential keys
      const classNameFromQR = qrData.class_name || qrData.className || qrData.title || null;
      const eventIdFromQR = qrData.event_id || qrData.eventId || null;
      const ownerIdFromQR = qrData.owner_id || qrData.ownerId || null;
      const dateFromQR = qrData.date || qrData.event_date || null;
      const typeFromQR = qrData.type || null;

      if (classNameFromQR) {
        // Verify against QR codes table when possible
        if (ownerIdFromQR && dateFromQR) {
          const { data: qrCodeRecord, error: qrError } = await supabase
            .from('attendance_qr_codes')
            .select('expires_at, is_active')
            .eq('owner_id', ownerIdFromQR)
            .eq('class_name', classNameFromQR)
            .eq('date', dateFromQR)
            .maybeSingle();
          
          if (qrError) {
            console.error('Error checking QR code:', qrError);
            throw new Error('Invalid QR code');
          }
          
          if (!qrCodeRecord) {
            throw new Error('QR code not found');
          }
          
          if (!qrCodeRecord.is_active) {
            throw new Error('QR code is no longer active');
          }
          
          if (qrCodeRecord.expires_at && new Date(qrCodeRecord.expires_at) < new Date()) {
            throw new Error('QR code has expired');
          }
        }
        
        sessionClass = classNameFromQR;
        classDateFromQR = dateFromQR;
        console.log('Using class name from QR payload:', sessionClass, 'date:', classDateFromQR);
      } else if (eventIdFromQR) {
        // Resolve class name via event id if provided
        const { data: ev, error: evErr } = await supabase
          .from('events')
          .select('title, event_date')
          .eq('id', eventIdFromQR)
          .maybeSingle();
        if (!evErr && ev) {
          sessionClass = ev.title;
          classDateFromQR = ev.event_date;
          console.log('Resolved class via event_id:', { sessionClass, classDateFromQR });
        }
      } else if (qrData.qr_token) {
        // This might be a session-based QR code
        console.log('Looking for session with token:', qrData.qr_token);
        const { data: sessionData, error } = await supabase.from("sessions")
          .select("*").eq("qr_token", qrData.qr_token).maybeSingle();
        
        if (sessionData) {
          session = sessionData;
          // If class_id looks like an event id, resolve to event title
          if (session.class_id) {
            const { data: ev, error: evErr } = await supabase
              .from('events')
              .select('title, event_date')
              .eq('id', session.class_id)
              .maybeSingle();
            if (!evErr && ev) {
              sessionClass = ev.title;
              classDateFromQR = ev.event_date;
            } else {
              sessionClass = session.class_id;
            }
          } else {
            sessionClass = "Session Attendance";
          }
          console.log('Using class from session:', sessionClass);
        }
      }
    } catch (parseError) {
      // Not JSON, might be a simple session token
      console.log('QR token is not JSON, checking as session token:', token);
      
      const { data: sessionData, error } = await supabase.from("sessions")
        .select("*").eq("qr_token", token).maybeSingle();
      
      if (sessionData) {
        session = sessionData;
        if (session.class_id) {
          const { data: ev, error: evErr } = await supabase
            .from('events')
            .select('title, event_date')
            .eq('id', session.class_id)
            .maybeSingle();
          if (!evErr && ev) {
            sessionClass = ev.title;
            classDateFromQR = ev.event_date;
          } else {
            sessionClass = session.class_id || "Session Attendance";
          }
        } else {
          sessionClass = "Session Attendance";
        }
        console.log('Using class from session lookup:', sessionClass);
      }
    }
    
    console.log('Final class name:', sessionClass);

    console.log('Inserting attendance record...');
    
    // Get student profile for proper data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', studentId)
      .maybeSingle();

    console.log('Profile lookup result:', { profile, profileError, studentId });
    
    const localDateString = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const attendanceData = {
      student_id: studentId,
      full_name: profile?.full_name || studentName || "Unknown Student",
      email: profile?.email || `student_${studentId}@example.com`,
      phone_number: 0, // Default phone number for QR attendance  
      class: sessionClass, // Use resolved class name
      date: classDateFromQR || localDateString(new Date()), // Prefer QR/event date when available
      status: 'approved' // Auto-approve QR attendance
    };
    
    console.log('Attendance data to insert:', attendanceData);
    
    const { data: attendance, error: insertErr } = await supabase.from("attendance")
      .insert([attendanceData])
      .select()
      .single();

    console.log('Insert result:', { attendance, insertErr });

    if (insertErr) {
      console.error('Database insert error:', insertErr);
      throw insertErr;
    }

    console.log('Attendance marked successfully:', attendance);
    return new Response(JSON.stringify({ success: true, attendance }), { 
      status: 200,
      headers: corsHeaders 
    });
  } catch (err) {
    console.error('Error marking attendance:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: corsHeaders 
    });
  }
});