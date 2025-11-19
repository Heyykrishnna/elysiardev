-- Add visibility field to events table
-- 'public' means visible to everyone (owner events)
-- 'private' means only visible to the creator (student personal events)

ALTER TABLE events 
ADD COLUMN visibility text DEFAULT 'public' 
CHECK (visibility IN ('public', 'private'));

-- Update existing events based on owner role
-- This assumes we need to identify owners vs students from the profiles table
UPDATE events 
SET visibility = CASE 
  WHEN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = events.owner_id 
    AND profiles.role = 'owner'
  ) THEN 'public'
  ELSE 'private'
END;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_events_visibility ON events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_owner_visibility ON events(owner_id, visibility);