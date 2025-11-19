import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: string;
  points: number;
  order_number: number;
}

interface TestAttempt {
  id: string;
  test_id: string;
  answers: Record<string, string>;
  score: number;
  total_points: number;
  completed_at: string;
  tests: {
    title: string;
    description: string;
  };
}

const TestAnalysis = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Fetch test attempt data
  const { data: attempt, isLoading: attemptLoading } = useQuery({
    queryKey: ['test-attempt', attemptId],
    queryFn: async () => {
      if (!attemptId || !profile) return null;

      const { data, error } = await supabase
        .from('test_attempts')
        .select(`
          *,
          tests (
            title,
            description
          )
        `)
        .eq('id', attemptId)
        .eq('student_id', profile.id)
        .single();

      if (error) throw error;
      return data as TestAttempt;
    },
    enabled: !!attemptId && !!profile,
  });

  // Fetch questions for the test
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['test-questions', attempt?.test_id],
    queryFn: async () => {
      if (!attempt?.test_id) return [];

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', attempt.test_id)
        .order('order_number');

      if (error) throw error;
      return data as Question[];
    },
    enabled: !!attempt?.test_id,
  });

  const isLoading = attemptLoading || questionsLoading;

  const checkAnswer = (question: Question, userAnswer: string) => {
    if (!userAnswer) return false;
    
    // Case-insensitive comparison
    const correctAnswer = question.correct_answer.toLowerCase().trim();
    const studentAnswer = userAnswer.toLowerCase().trim();
    
    return correctAnswer === studentAnswer;
  };

  const getAnswerStatus = (question: Question, userAnswer: string) => {
    const isCorrect = checkAnswer(question, userAnswer);
    return {
      isCorrect,
      icon: isCorrect ? CheckCircle : XCircle,
      color: isCorrect ? 'text-green-600' : 'text-red-600',
      bgColor: isCorrect ? 'bg-green-50' : 'bg-red-50',
      borderColor: isCorrect ? 'border-green-200' : 'border-red-200'
    };
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-lg text-gray-600 mt-4">Loading your test analysis...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!attempt || !questions) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-red-600">Test analysis not found.</p>
            <Button onClick={() => navigate('/results')} className="mt-4">
              Back to Results
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const correctAnswers = questions.filter(q => 
    checkAnswer(q, attempt.answers?.[q.id] || '')
  ).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/results')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Results
            </Button>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800">Test Analysis</h1>
              <p className="text-gray-600">{attempt.tests.title}</p>
            </div>
          </div>

          {/* Overall Results Summary */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6" />
                Your Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{attempt.score}%</div>
                  <div className="text-gray-600">Final Score</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                  <div className="text-gray-600">Correct Answers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">{questions.length - correctAnswers}</div>
                  <div className="text-gray-600">Incorrect Answers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-600">{questions.length}</div>
                  <div className="text-gray-600">Total Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Analysis */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Question by Question Analysis</h2>
            
            {questions.map((question, index) => {
              const userAnswer = attempt.answers?.[question.id] || '';
              const status = getAnswerStatus(question, userAnswer);
              const StatusIcon = status.icon;

              return (
                <Card 
                  key={question.id} 
                  className={`bg-white/80 backdrop-blur-sm border-2 shadow-xl ${status.borderColor}`}
                >
                  <CardHeader className={`${status.bgColor}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Question {index + 1}
                        </CardTitle>
                        <p className="text-gray-700 mt-2">{question.question_text}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-6 w-6 ${status.color}`} />
                        <Badge variant={status.isCorrect ? "default" : "destructive"}>
                          {status.isCorrect ? 'Correct' : 'Incorrect'}
                        </Badge>
                        <Badge variant="outline">
                          {question.points} {question.points === 1 ? 'point' : 'points'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Show options for multiple choice */}
                    {question.question_type === 'multiple_choice' && question.options && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">Options:</h4>
                        <div className="space-y-1">
                          {question.options.map((option: string, optionIndex: number) => (
                            <div 
                              key={optionIndex}
                              className={`p-2 rounded border ${
                                option === question.correct_answer 
                                  ? 'bg-green-100 border-green-300' 
                                  : option === userAnswer 
                                  ? 'bg-red-100 border-red-300' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              {option}
                              {option === question.correct_answer && (
                                <CheckCircle className="inline h-4 w-4 text-green-600 ml-2" />
                              )}
                              {option === userAnswer && option !== question.correct_answer && (
                                <XCircle className="inline h-4 w-4 text-red-600 ml-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Your Answer:</h4>
                        <p className={`p-3 rounded border ${
                          status.isCorrect 
                            ? 'bg-green-100 border-green-300 text-green-800' 
                            : 'bg-red-100 border-red-300 text-red-800'
                        }`}>
                          {userAnswer || 'No answer provided'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Correct Answer:</h4>
                        <p className="p-3 rounded border bg-green-100 border-green-300 text-green-800">
                          {question.correct_answer}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Button 
              onClick={() => navigate('/results')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-lg px-8 py-3"
            >
              View All Results
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TestAnalysis;