-- Add approval status to attendance table
ALTER TABLE public.attendance 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

-- Add check constraint for status values
ALTER TABLE public.attendance 
ADD CONSTRAINT attendance_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create policy for owners to update attendance status
CREATE POLICY "Owners can update attendance status" 
ON public.attendance 
FOR UPDATE 
USING (auth.uid() IN ( 
  SELECT profiles.id
  FROM profiles
  WHERE profiles.role = 'owner'::user_role
));