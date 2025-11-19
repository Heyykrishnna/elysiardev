-- Allow students to delete their own attendance records
DROP POLICY IF EXISTS "Students can delete their own attendance" ON public.attendance;

CREATE POLICY "Students can delete their own attendance" 
ON public.attendance 
FOR DELETE 
USING (auth.uid() = student_id);

-- Create a function to check daily attendance limit
CREATE OR REPLACE FUNCTION public.check_daily_attendance_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    daily_count INTEGER;
BEGIN
    -- Count existing attendance records for the user on the same date
    SELECT COUNT(*) INTO daily_count
    FROM public.attendance
    WHERE student_id = NEW.student_id 
    AND date = NEW.date;
    
    -- Check if limit would be exceeded
    IF daily_count >= 3 THEN
        RAISE EXCEPTION 'Daily attendance limit exceeded. Maximum 3 attendance requests per day allowed.';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to enforce daily attendance limit
DROP TRIGGER IF EXISTS enforce_daily_attendance_limit ON public.attendance;

CREATE TRIGGER enforce_daily_attendance_limit
    BEFORE INSERT ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.check_daily_attendance_limit();