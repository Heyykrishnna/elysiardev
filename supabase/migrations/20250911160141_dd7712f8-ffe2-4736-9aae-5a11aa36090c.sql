-- Create sessions table for QR attendance system
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID,
  class_id TEXT,
  qr_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 50,
  active BOOLEAN DEFAULT true
);

-- Create attendances table for storing attendance records
CREATE TABLE IF NOT EXISTS public.attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id UUID,
  student_name TEXT,
  student_lat DOUBLE PRECISION,
  student_lng DOUBLE PRECISION,
  distance_meters DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id) -- prevent double attendance for same session
);

-- Enable RLS on sessions table
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on attendances table  
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Policy for sessions - allow teachers to create and view their sessions
CREATE POLICY "Teachers can manage their sessions" 
ON public.sessions 
FOR ALL 
USING (true);

-- Policy for attendances - allow anyone to create attendance records, teachers can view all
CREATE POLICY "Anyone can create attendance records" 
ON public.attendances 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Teachers can view attendance records" 
ON public.attendances 
FOR SELECT 
USING (true);