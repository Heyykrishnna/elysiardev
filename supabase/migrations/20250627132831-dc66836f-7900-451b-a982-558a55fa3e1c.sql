
-- Create a function to calculate test scores based on answers
CREATE OR REPLACE FUNCTION calculate_test_score(
    p_test_id UUID,
    p_answers JSONB
) RETURNS TABLE (
    calculated_score INTEGER,
    total_points INTEGER
) AS $$
DECLARE
    question_record RECORD;
    correct_answers INTEGER := 0;
    total_questions INTEGER := 0;
    points_earned INTEGER := 0;
    max_points INTEGER := 0;
BEGIN
    -- Loop through all questions for this test
    FOR question_record IN 
        SELECT id, correct_answer, points, question_type, options
        FROM questions 
        WHERE test_id = p_test_id
        ORDER BY order_number
    LOOP
        total_questions := total_questions + 1;
        max_points := max_points + question_record.points;
        
        -- Check if the answer is correct
        IF p_answers ? question_record.id::text THEN
            DECLARE
                user_answer TEXT := p_answers ->> question_record.id::text;
                is_correct BOOLEAN := FALSE;
            BEGIN
                -- For multiple choice and true/false, exact match
                IF question_record.question_type IN ('multiple_choice', 'true_false') THEN
                    is_correct := LOWER(TRIM(user_answer)) = LOWER(TRIM(question_record.correct_answer));
                -- For short answer, case-insensitive match
                ELSIF question_record.question_type = 'short_answer' THEN
                    is_correct := LOWER(TRIM(user_answer)) = LOWER(TRIM(question_record.correct_answer));
                END IF;
                
                IF is_correct THEN
                    correct_answers := correct_answers + 1;
                    points_earned := points_earned + question_record.points;
                END IF;
            END;
        END IF;
    END LOOP;
    
    -- Calculate percentage score
    IF max_points > 0 THEN
        calculated_score := ROUND((points_earned::FLOAT / max_points::FLOAT) * 100);
    ELSE
        calculated_score := 0;
    END IF;
    
    total_points := max_points;
    
    RETURN QUERY SELECT calculated_score, total_points;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to automatically calculate scores when test attempts are completed
CREATE OR REPLACE FUNCTION update_test_attempt_score()
RETURNS TRIGGER AS $$
DECLARE
    score_result RECORD;
BEGIN
    -- Only calculate score if the attempt is being marked as completed
    IF NEW.is_completed = TRUE AND (OLD.is_completed IS NULL OR OLD.is_completed = FALSE) THEN
        -- Calculate the score using our function
        SELECT * INTO score_result 
        FROM calculate_test_score(NEW.test_id, NEW.answers);
        
        -- Update the attempt with calculated score and total points
        NEW.score := score_result.calculated_score;
        NEW.total_points := score_result.total_points;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_test_attempt_score ON test_attempts;
CREATE TRIGGER trigger_update_test_attempt_score
    BEFORE UPDATE ON test_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_test_attempt_score();

-- Also create a trigger for INSERT operations
DROP TRIGGER IF EXISTS trigger_insert_test_attempt_score ON test_attempts;
CREATE TRIGGER trigger_insert_test_attempt_score
    BEFORE INSERT ON test_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_test_attempt_score();

-- Update existing completed attempts that don't have scores
UPDATE test_attempts 
SET score = subq.calculated_score, total_points = subq.total_points
FROM (
    SELECT 
        ta.id,
        COALESCE((
            SELECT calculated_score 
            FROM calculate_test_score(ta.test_id, ta.answers)
        ), 0) as calculated_score,
        COALESCE((
            SELECT total_points 
            FROM calculate_test_score(ta.test_id, ta.answers)
        ), 0) as total_points
    FROM test_attempts ta
    WHERE ta.is_completed = TRUE AND ta.score IS NULL
) subq
WHERE test_attempts.id = subq.id;
