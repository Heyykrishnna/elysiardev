import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  points: number;
  order_number: number;
}

interface Test {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  password: string;
  hide_scores_after_submission: boolean;
}

const TakeTest = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (testId) {
      fetchTestData();
    }
  }, [testId]);

  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, timeLeft]);

  // Strict mode effects
  useEffect(() => {
    if (testStarted) {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(() => console.log('Fullscreen not supported'));
      }

      // Prevent page refresh and navigation
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your test progress will be lost.';
        return 'Are you sure you want to leave? Your test progress will be lost.';
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        // Disable F12, Ctrl+Shift+I, Ctrl+U, F5, Ctrl+R
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'u') ||
            e.key === 'F5' ||
            (e.ctrlKey && e.key === 'r')) {
          e.preventDefault();
        }
      };

      // Disable right-click context menu
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('contextmenu', handleContextMenu);
        
        // Exit fullscreen when test ends
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      };
    }
  }, [testStarted]);

  const fetchTestData = async () => {
    try {
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .eq('is_active', true)
        .single();

      if (testError) throw testError;
      
      setTest(testData);
      
      if (testData.password) {
        setShowPasswordPrompt(true);
        return;
      }
      
      await fetchQuestions();
    } catch (error) {
      console.error('Error fetching test:', error);
      toast({
        title: "Error",
        description: "Failed to load test. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data: questionsData, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', testId)
        .order('order_number');

      if (error) throw error;
      console.log('Loaded questions:', questionsData);
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePasswordSubmit = async () => {
    if (test && passwordInput === test.password) {
      setShowPasswordPrompt(false);
      await fetchQuestions();
    } else {
      toast({
        title: "Error",
        description: "Incorrect password. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startTest = () => {
    if (test?.time_limit) {
      setTimeLeft(test.time_limit * 60);
    }
    setTestStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    console.log('Answer changed:', { questionId, answer });
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const confirmSubmitTest = () => {
    setShowSubmitConfirmation(true);
  };

  const handleSubmitTest = async () => {
    if (!profile || !test) return;
    
    setShowSubmitConfirmation(false);
    setIsSubmitting(true);
    
    try {
      console.log('Submitting answers:', answers);
      
      const { data, error } = await supabase
        .from('test_attempts')
        .insert({
          test_id: testId,
          student_id: profile.id,
          answers: answers,
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .select('id, score, total_points')
        .single();

      if (error) throw error;

      console.log('Test submitted successfully:', data);

      // Invalidate queries to refresh the results
      await queryClient.invalidateQueries({ queryKey: ['test-attempts'] });
      await queryClient.invalidateQueries({ queryKey: ['tests'] });

      // Check if scores should be hidden
      if (test.hide_scores_after_submission) {
        toast({
          title: "Success!",
          description: "Test submitted successfully! Your results have been recorded.",
          duration: 5000
        });
        
        setTimeout(() => {
          navigate('/tests');
        }, 2000);
      } else {
        toast({
          title: "Success!",
          description: `Test submitted successfully! You scored ${data.score}%`,
          duration: 5000
        });
        
        setTimeout(() => {
          navigate(`/test-analysis/${data.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isTestCompleted = () => {
    return questions.length > 0 && questions.every(q => answers[q.id]);
  };

  if (showPasswordPrompt) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
          <div className="max-w-md mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Password Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter test password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/tests')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordSubmit}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!testStarted) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">{test?.title}</CardTitle>
                {test?.description && (
                  <p className="text-gray-600 mt-2">{test.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center space-x-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                      <div className="text-sm text-gray-600">Questions</div>
                    </div>
                    {test?.time_limit && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{test.time_limit}</div>
                        <div className="text-sm text-gray-600">Minutes</div>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Once you start the test, you cannot pause or go back. Make sure you have a stable internet connection.
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/tests')}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={startTest}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    Start Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <ProtectedRoute>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Strict Mode Warning */}
        {isFullscreen && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
              ⚠️ STRICT MODE ACTIVE - Navigation disabled during test
            </div>
          </div>
        )}
        
        <div className="h-full overflow-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            {/* Header with timer */}
            <div className="flex justify-between items-center mb-6 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 ">
              <div className="text-xl font-semibold text-white ">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              {timeLeft > 0 && (
                <div className="flex items-center space-x-3 bg-red-900/50 backdrop-blur-sm px-6 py-3 rounded-lg border border-red-700">
                  <Clock className="h-6 w-6 text-red-400 animate-pulse" />
                  <span className="text-xl font-bold text-red-400 font-mono">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </div>

            {/* Question Card */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-2xl flex-1 flex flex-col">
              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="space-y-8 flex-1 flex flex-col">
                  <div className="text-2xl font-medium text-white leading-relaxed">
                    {currentQuestion?.question_text}
                  </div>
                
                  {/* Multiple Choice Questions */}
                  {currentQuestion?.question_type === 'multiple_choice' && currentQuestion.options && (
                    <div className="flex-1">
                      <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                      >
                        {currentQuestion.options.map((option: string, index: number) => (
                          <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50 mb-3">
                            <RadioGroupItem value={option} id={`option-${index}`} className="border-slate-400 data-[state=checked]:bg-white data-[state=checked]:border-primary [state=checked]:bg-white [state=checked]:border-white" />
                            <Label htmlFor={`option-${index}`} className="text-lg cursor-pointer text-white leading-relaxed flex-1">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* True/False Questions */}
                  {currentQuestion?.question_type === 'true_false' && (
                    <div className="flex-1">
                      <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                      >
                        <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50 mb-3">
                          <RadioGroupItem value="True" id="true-option" className="border-slate-400" />
                          <Label htmlFor="true-option" className="text-lg cursor-pointer text-white leading-relaxed flex-1">
                            True
                          </Label>
                        </div>
                        <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50 mb-3">
                          <RadioGroupItem value="False" id="false-option" className="border-slate-400 data-[state=checked]:bg-white data-[state=checked]:border-primary [state=checked]:bg-white [state=checked]:border-white" />
                          <Label htmlFor="false-option" className="text-lg cursor-pointer text-white leading-relaxed flex-1">
                            False
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Short Answer Questions */}
                  {currentQuestion?.question_type === 'short_answer' && (
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Enter your answer..."
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="text-lg p-6 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-slate-500 focus:ring-slate-500 "
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 hover:text-white :bg-slate-600/50"
              >
                Previous
              </Button>
              
              <div className="flex space-x-3 max-w-md overflow-x-auto py-3 px-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 shrink-0
                      ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white shadow-md scale-110'
                          : answers[questions[index].id]
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={confirmSubmitTest}
                  disabled={isSubmitting || !isTestCompleted()}
                  className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="bg-slate-700 hover:bg-slate-600 text-white :bg-slate-600 "
                >
                  Next
                </Button>
              )}
            </div>

            {/* Test Completion Status */}
            <div className="mt-4 text-center bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
              <p className="text-sm text-white ">
                Answered: {Object.keys(answers).length} / {questions.length} questions
              </p>
              {isTestCompleted() && (
                <p className="text-sm text-green-400 font-medium mt-1">
                  All questions answered! You can submit the test now.
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Submit Confirmation Dialog */}
        <AlertDialog open={showSubmitConfirmation} onOpenChange={setShowSubmitConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Test</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit your test? Once submitted, you cannot make any changes to your answers.
                You have answered {Object.keys(answers).length} out of {questions.length} questions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmitTest}>Submit Test</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
};

export default TakeTest;
