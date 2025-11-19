
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  points: number;
  order_number: number;
}

export const useTestQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = (questionData: Omit<Question, 'id' | 'order_number'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: crypto.randomUUID(),
      order_number: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, questionData: Omit<Question, 'id' | 'order_number'>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...questionData, id, order_number: q.order_number } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    // Reorder remaining questions
    setQuestions(prev => prev.map((q, index) => ({
      ...q,
      order_number: index + 1
    })));
  };

  const loadQuestionsFromDatabase = async (testId: string) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', testId)
        .order('order_number');

      if (error) throw error;

      const loadedQuestions: Question[] = (data || []).map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type as Question['question_type'],
        options: Array.isArray(q.options) ? q.options.filter((opt): opt is string => typeof opt === 'string') : undefined,
        correct_answer: q.correct_answer,
        points: q.points,
        order_number: q.order_number
      }));

      setQuestions(loadedQuestions);
      return { success: true };
    } catch (error) {
      console.error('Error loading questions:', error);
      return { success: false, error };
    }
  };

  const saveQuestionsToDatabase = async (testId: string) => {
    try {
      // Delete existing questions for this test
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('test_id', testId);

      if (deleteError) throw deleteError;

      // Insert new questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map(q => ({
          test_id: testId,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options || null,
          correct_answer: q.correct_answer,
          points: q.points,
          order_number: q.order_number
        }));

        const { error: insertError } = await supabase
          .from('questions')
          .insert(questionsToInsert);

        if (insertError) throw insertError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving questions:', error);
      return { success: false, error };
    }
  };

  const reorderQuestions = (startIndex: number, endIndex: number) => {
    const result = Array.from(questions);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update order numbers
    const reorderedQuestions = result.map((question, index) => ({
      ...question,
      order_number: index + 1
    }));
    
    setQuestions(reorderedQuestions);
  };

  const clearQuestions = () => {
    setQuestions([]);
  };

  return {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    loadQuestionsFromDatabase,
    saveQuestionsToDatabase,
    clearQuestions
  };
};
