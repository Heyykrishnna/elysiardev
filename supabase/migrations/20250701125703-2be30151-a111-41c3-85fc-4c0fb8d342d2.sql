
-- Create a table for custom notifications that owners can send to students
CREATE TABLE public.owner_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Add Row Level Security (RLS)
ALTER TABLE public.owner_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for owner notifications
CREATE POLICY "Owners can view their own notifications" 
  ON public.owner_notifications 
  FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'owner'));

CREATE POLICY "Owners can create notifications" 
  ON public.owner_notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'owner') AND auth.uid() = owner_id);

CREATE POLICY "Owners can update their own notifications" 
  ON public.owner_notifications 
  FOR UPDATE 
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'owner') AND auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own notifications" 
  ON public.owner_notifications 
  FOR DELETE 
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'owner') AND auth.uid() = owner_id);

-- Students can view all active notifications
CREATE POLICY "Students can view active notifications" 
  ON public.owner_notifications 
  FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role != 'owner') AND is_active = true);
