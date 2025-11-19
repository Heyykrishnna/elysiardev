-- Create sessions table for QR attendance system (only if not exists)
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

-- Create attendances table for storing attendance records (only if not exists)
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