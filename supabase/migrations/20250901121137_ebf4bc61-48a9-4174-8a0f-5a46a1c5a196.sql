-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending',
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Create policies for complaints
CREATE POLICY "Students can create their own complaints" 
ON public.complaints 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own complaints" 
ON public.complaints 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Owners can view all complaints" 
ON public.complaints 
FOR SELECT 
USING (auth.uid() IN ( SELECT profiles.id FROM profiles WHERE profiles.role = 'owner'::user_role));

CREATE POLICY "Owners can update complaint status" 
ON public.complaints 
FOR UPDATE 
USING (auth.uid() IN ( SELECT profiles.id FROM profiles WHERE profiles.role = 'owner'::user_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();