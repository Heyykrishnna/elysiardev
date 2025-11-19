-- Add expires_at field to attendance_qr_codes table
ALTER TABLE public.attendance_qr_codes 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to never expire (set far future date)
UPDATE public.attendance_qr_codes 
SET expires_at = '2099-12-31 23:59:59+00'::timestamp with time zone 
WHERE expires_at IS NULL;