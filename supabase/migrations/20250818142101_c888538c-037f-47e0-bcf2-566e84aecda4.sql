-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  class TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_marked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for students to mark their own attendance
CREATE POLICY "Students can mark their own attendance" 
ON public.attendance 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Create policies for students to view their own attendance
CREATE POLICY "Students can view their own attendance" 
ON public.attendance 
FOR SELECT 
USING (auth.uid() = student_id);

-- Create policies for owners to view all attendance records
CREATE POLICY "Owners can view all attendance records" 
ON public.attendance 
FOR SELECT 
USING (auth.uid() IN ( 
  SELECT profiles.id
  FROM profiles
  WHERE profiles.role = 'owner'::user_role
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint to prevent duplicate attendance on same date
ALTER TABLE public.attendance 
ADD CONSTRAINT unique_student_date 
UNIQUE (student_id, date);