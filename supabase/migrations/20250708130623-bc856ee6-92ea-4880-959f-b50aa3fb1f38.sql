-- Create resource requests table
CREATE TABLE public.resource_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  book_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  edition TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for resource requests
CREATE POLICY "Students can create their own requests" 
ON public.resource_requests 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own requests" 
ON public.resource_requests 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Owners can view all requests" 
ON public.resource_requests 
FOR SELECT 
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'owner'
));

CREATE POLICY "Owners can update request status" 
ON public.resource_requests 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'owner'
));

-- Create function to update timestamps
CREATE TRIGGER update_resource_requests_updated_at
BEFORE UPDATE ON public.resource_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();