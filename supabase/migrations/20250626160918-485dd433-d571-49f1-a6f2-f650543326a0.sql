
-- Create a storage bucket for study resources
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-resources', 'study-resources', true);

-- Create RLS policies for the study-resources bucket
CREATE POLICY "Users can upload their own study resources" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'study-resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view study resources" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'study-resources');

CREATE POLICY "Users can update their own study resources" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'study-resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own study resources" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'study-resources' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update the study_resources table to include file_url and file_name columns if they don't exist
ALTER TABLE study_resources 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT;
