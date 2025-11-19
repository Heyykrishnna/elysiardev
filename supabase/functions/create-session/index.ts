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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Create session request received');
    const body = await req.json();
    console.log('Request body:', body);
    
    const { teacherId, classId, teacherLat, teacherLng, radiusMeters } = body;
    
    if (typeof teacherLat !== "number" || typeof teacherLng !== "number") {
      console.error('Invalid location data:', { teacherLat, teacherLng });
      return new Response(JSON.stringify({ error: "Missing or invalid teacher location" }), { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const expires_at = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // 2 min
    const qr_token = crypto.randomUUID();

    const { data, error } = await supabase.from("sessions").insert([{
      teacher_id: teacherId || null,
      class_id: classId || null,
      qr_token,
      expires_at,
      latitude: teacherLat,
      longitude: teacherLng,
      radius_meters: radiusMeters || 50,
      active: true
    }]).select().single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Session created successfully:', data);
    return new Response(JSON.stringify({ session: data }), { 
      status: 200,
      headers: corsHeaders 
    });
  } catch (err) {
    console.error('Error creating session:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: corsHeaders 
    });
  }
});