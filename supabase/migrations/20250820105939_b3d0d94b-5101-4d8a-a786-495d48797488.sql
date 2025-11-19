-- Create QR codes table for attendance
CREATE TABLE public.attendance_qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  class_name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  qr_data JSONB NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.attendance_qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for QR codes
CREATE POLICY "Owners can manage their QR codes" 
ON public.attendance_qr_codes 
FOR ALL 
USING (auth.uid() = owner_id);

CREATE POLICY "Students can view active QR codes" 
ON public.attendance_qr_codes 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_qr_codes_updated_at
BEFORE UPDATE ON public.attendance_qr_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();