
-- Add only the policies that don't exist yet

-- Check and add missing RLS policies for tests
DO $$
BEGIN
    -- Check if "Students can view active tests" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tests' 
        AND policyname = 'Students can view active tests'
    ) THEN
        CREATE POLICY "Students can view active tests" ON public.tests
          FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Add RLS policies for questions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'questions' 
        AND policyname = 'Owners can manage questions for their tests'
    ) THEN
        CREATE POLICY "Owners can manage questions for their tests" ON public.questions
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.tests 
              WHERE tests.id = questions.test_id 
              AND tests.owner_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'questions' 
        AND policyname = 'Students can view questions for tests they are taking'
    ) THEN
        CREATE POLICY "Students can view questions for tests they are taking" ON public.questions
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.tests 
              WHERE tests.id = questions.test_id 
              AND tests.is_active = true
            )
          );
    END IF;
END $$;

-- Add RLS policies for test_attempts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'test_attempts' 
        AND policyname = 'Students can manage their own attempts'
    ) THEN
        CREATE POLICY "Students can manage their own attempts" ON public.test_attempts
          FOR ALL USING (auth.uid() = student_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'test_attempts' 
        AND policyname = 'Owners can view attempts for their tests'
    ) THEN
        CREATE POLICY "Owners can view attempts for their tests" ON public.test_attempts
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.tests 
              WHERE tests.id = test_attempts.test_id 
              AND tests.owner_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Add RLS policies for study_resources
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'study_resources' 
        AND policyname = 'Owners can manage their resources'
    ) THEN
        CREATE POLICY "Owners can manage their resources" ON public.study_resources
          FOR ALL USING (auth.uid() = owner_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'study_resources' 
        AND policyname = 'Users can view public resources'
    ) THEN
        CREATE POLICY "Users can view public resources" ON public.study_resources
          FOR SELECT USING (is_public = true);
    END IF;
END $$;

-- Create function and trigger for updating question count (will replace if exists)
CREATE OR REPLACE FUNCTION update_test_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tests SET total_questions = total_questions + 1 WHERE id = NEW.test_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tests SET total_questions = total_questions - 1 WHERE id = OLD.test_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_question_count ON questions;
CREATE TRIGGER trigger_update_question_count
  AFTER INSERT OR DELETE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_test_question_count();
