-- Manual SQL script to add visibility column to events table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/[your-project]/sql)

-- Step 1: Add the visibility column with default 'public'
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public';

-- Step 2: Add check constraint
ALTER TABLE events 
ADD CONSTRAINT events_visibility_check 
CHECK (visibility IN ('public', 'private'));

-- Step 3: Update existing events based on owner role
-- Set visibility to 'public' for owner events, 'private' for student events
UPDATE events 
SET visibility = CASE 
  WHEN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = events.owner_id 
    AND profiles.role = 'owner'
  ) THEN 'public'
  ELSE 'private'
END
WHERE visibility IS NULL;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_visibility ON events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_owner_visibility ON events(owner_id, visibility);

-- Step 5: Verify the changes
SELECT 
  COUNT(*) as total_events,
  COUNT(CASE WHEN visibility = 'public' THEN 1 END) as public_events,
  COUNT(CASE WHEN visibility = 'private' THEN 1 END) as private_events
FROM events;