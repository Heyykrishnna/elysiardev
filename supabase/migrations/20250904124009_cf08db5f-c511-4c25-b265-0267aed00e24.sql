-- Add option to hide scores after test submission
ALTER TABLE tests 
ADD COLUMN hide_scores_after_submission BOOLEAN DEFAULT false;