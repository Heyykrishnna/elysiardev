-- Update events table to include additional fields for class management
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 100;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS instructor_name TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS qr_code_id UUID;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';

-- Ensure the events table has all the fields we need
COMMENT ON TABLE public.events IS 'Events table that serves as both calendar events and class schedules';

-- Create class enrollment table using events instead of class_schedules
CREATE TABLE IF NOT EXISTS class_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL, -- References auth.users
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'enrolled', -- enrolled, dropped, completed
    UNIQUE(student_id, event_id)
);

-- Create attendance analytics table using events
CREATE TABLE IF NOT EXISTS attendance_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    total_enrolled INTEGER DEFAULT 0,
    total_present INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0.0,
    date DATE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, date)
);

-- Create triggers to update attendance analytics using events
CREATE OR REPLACE FUNCTION update_attendance_analytics()
RETURNS TRIGGER AS $$
DECLARE
    class_date DATE;
    target_event_id UUID;
    enrolled_count INTEGER;
    present_count INTEGER;
    percentage DECIMAL(5,2);
BEGIN
    -- Get class info from attendance record
    class_date := NEW.date::DATE;
    
    -- Find matching event (class)
    SELECT id INTO target_event_id 
    FROM public.events 
    WHERE title = NEW.class 
    AND event_date = class_date
    AND event_type = 'class';
    
    -- If no matching event found, skip analytics update
    IF target_event_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Count enrolled students for this event
    SELECT COUNT(*) INTO enrolled_count
    FROM class_enrollments
    WHERE event_id = target_event_id
    AND status = 'enrolled';
    
    -- Count present students (approved attendance)
    SELECT COUNT(DISTINCT student_id) INTO present_count
    FROM attendance
    WHERE class = NEW.class
    AND date::DATE = class_date
    AND status = 'approved';
    
    -- Calculate percentage
    percentage := CASE 
        WHEN enrolled_count > 0 THEN (present_count::DECIMAL / enrolled_count::DECIMAL) * 100
        ELSE 0
    END;
    
    -- Update or insert analytics record
    INSERT INTO attendance_analytics (
        event_id,
        total_enrolled,
        total_present,
        attendance_percentage,
        date
    ) VALUES (
        target_event_id,
        enrolled_count,
        present_count,
        percentage,
        class_date
    )
    ON CONFLICT (event_id, date)
    DO UPDATE SET
        total_enrolled = enrolled_count,
        total_present = present_count,
        attendance_percentage = percentage,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for attendance analytics
DROP TRIGGER IF EXISTS update_analytics_on_attendance_change ON attendance;
CREATE TRIGGER update_analytics_on_attendance_change
    AFTER INSERT OR UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_analytics();

-- Also update analytics on DELETE by recalculating for the affected class/date
CREATE OR REPLACE FUNCTION recalc_attendance_analytics_on_delete()
RETURNS TRIGGER AS $$
DECLARE
    class_date DATE;
    target_event_id UUID;
    enrolled_count INTEGER;
    present_count INTEGER;
    percentage DECIMAL(5,2);
BEGIN
    class_date := OLD.date::DATE;

    SELECT id INTO target_event_id 
    FROM public.events 
    WHERE title = OLD.class 
      AND event_date = class_date
      AND event_type = 'class';

    IF target_event_id IS NULL THEN
        RETURN OLD;
    END IF;

    SELECT COUNT(*) INTO enrolled_count
    FROM class_enrollments
    WHERE event_id = target_event_id
      AND status = 'enrolled';

    SELECT COUNT(DISTINCT student_id) INTO present_count
    FROM attendance
    WHERE class = OLD.class
      AND date::DATE = class_date
      AND status = 'approved';

    percentage := CASE 
        WHEN enrolled_count > 0 THEN (present_count::DECIMAL / enrolled_count::DECIMAL) * 100
        ELSE 0
    END;

    INSERT INTO attendance_analytics (
        event_id,
        total_enrolled,
        total_present,
        attendance_percentage,
        date
    ) VALUES (
        target_event_id,
        enrolled_count,
        present_count,
        percentage,
        class_date
    )
    ON CONFLICT (event_id, date)
    DO UPDATE SET
        total_enrolled = enrolled_count,
        total_present = present_count,
        attendance_percentage = percentage,
        updated_at = NOW();

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_analytics_on_attendance_delete ON attendance;
CREATE TRIGGER update_analytics_on_attendance_delete
    AFTER DELETE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION recalc_attendance_analytics_on_delete();

-- Update events when QR code is created
CREATE OR REPLACE FUNCTION link_qr_to_event()
RETURNS TRIGGER AS $$
DECLARE
    target_event_id UUID;
BEGIN
    -- Find matching event
    SELECT id INTO target_event_id
    FROM public.events
    WHERE title = NEW.class_name
    AND event_date = NEW.date::DATE
    AND event_type = 'class';
    
    -- Update event with QR code reference
    IF target_event_id IS NOT NULL THEN
        UPDATE public.events
        SET qr_code_id = NEW.id,
            updated_at = NOW()
        WHERE id = target_event_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to link QR codes to events
DROP TRIGGER IF EXISTS link_qr_on_create ON attendance_qr_codes;
CREATE TRIGGER link_qr_on_create
    AFTER INSERT ON attendance_qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION link_qr_to_event();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_owner ON public.events(owner_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_event ON class_enrollments(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_analytics_event ON attendance_analytics(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_analytics_date ON attendance_analytics(date);

-- Insert some sample events (classes) for testing
INSERT INTO public.events (
    title,
    description,
    event_date,
    event_time,
    event_type,
    color,
    owner_id,
    duration_minutes,
    location,
    max_students,
    instructor_name,
    status,
    visibility
) VALUES 
    ('Mathematics 101', 'Introduction to Calculus and Algebra', CURRENT_DATE + INTERVAL '1 day', '09:00:00', 'class', '#1976d2', '00000000-0000-0000-0000-000000000000', 90, 'Room A-101', 50, 'Dr. Smith', 'scheduled', 'public'),
    ('Physics 201', 'Classical Mechanics and Thermodynamics', CURRENT_DATE + INTERVAL '2 days', '11:00:00', 'class', '#d32f2f', '00000000-0000-0000-0000-000000000000', 120, 'Lab B-205', 30, 'Prof. Johnson', 'scheduled', 'public'),
    ('Computer Science 101', 'Introduction to Programming', CURRENT_DATE + INTERVAL '1 day', '14:00:00', 'class', '#388e3c', '00000000-0000-0000-0000-000000000000', 90, 'Computer Lab C-301', 40, 'Dr. Brown', 'scheduled', 'public'),
    ('Chemistry 150', 'Organic Chemistry Basics', CURRENT_DATE + INTERVAL '3 days', '10:00:00', 'class', '#f57c00', '00000000-0000-0000-0000-000000000000', 75, 'Chemistry Lab D-102', 25, 'Prof. Davis', 'scheduled', 'public');

-- Add some sample enrollments for testing
-- Note: You'll need to replace the student_id with actual user IDs after users are created
-- INSERT INTO class_enrollments (student_id, event_id, status) 
-- SELECT 
--     '11111111-1111-1111-1111-111111111111', -- Replace with actual student ID
--     id,
--     'enrolled'
-- FROM public.events 
-- WHERE event_type = 'class' 
-- LIMIT 2;
