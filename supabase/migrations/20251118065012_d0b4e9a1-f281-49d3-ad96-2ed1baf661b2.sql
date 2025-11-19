-- Create student_notifications table
CREATE TABLE public.student_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'info',
  book_issue_id UUID REFERENCES public.book_issues(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;

-- Students can view their own notifications
CREATE POLICY "Students can view their own notifications"
ON public.student_notifications
FOR SELECT
USING (auth.uid() = student_id);

-- Students can update their own notifications (mark as read)
CREATE POLICY "Students can update their own notifications"
ON public.student_notifications
FOR UPDATE
USING (auth.uid() = student_id);

-- Owners can create notifications for students
CREATE POLICY "Owners can create notifications"
ON public.student_notifications
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'owner'
  )
);

-- System can create notifications (for automated notifications from edge functions)
CREATE POLICY "System can create notifications"
ON public.student_notifications
FOR INSERT
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_student_notifications_updated_at
BEFORE UPDATE ON public.student_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_student_notifications_student_id ON public.student_notifications(student_id);
CREATE INDEX idx_student_notifications_is_read ON public.student_notifications(is_read);
CREATE INDEX idx_student_notifications_created_at ON public.student_notifications(created_at DESC);