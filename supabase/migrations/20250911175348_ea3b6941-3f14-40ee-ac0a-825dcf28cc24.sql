-- Enable replica identity for real-time updates on attendance table
ALTER TABLE public.attendance REPLICA IDENTITY FULL;

-- Add the attendance table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;