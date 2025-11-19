
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Plus, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTestQuestions } from '@/hooks/useTestQuestions';
import QuestionForm, { Question } from '@/components/QuestionForm';
import QuestionList from '@/components/QuestionList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Test {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  password: string;
  is_active: boolean;
  hide_scores_after_submission: boolean;
}

const EditTest = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [test, setTest] = useState<Test | null>(null);
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState<number | ''>('');
  const [testPassword, setTestPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [hideScores, setHideScores] = useState(false);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    loadQuestionsFromDatabase,
    saveQuestionsToDatabase
  } = useTestQuestions();

  useEffect(() => {
    if (testId) {
      fetchTestData();
    }
  }, [testId]);

  const fetchTestData = async () => {
    try {
      const { data: testData, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .eq('owner_id', profile?.id)
        .single();

      if (error) throw error;
      
      setTest(testData);
        setTestTitle(testData.title);
        setTestDescription(testData.description || '');
        setTimeLimit(testData.time_limit || '');
        setTestPassword(testData.password || '');
        setIsActive(testData.is_active);
        setHideScores(testData.hide_scores_after_submission || false);
      
      // Load questions for this test
      await loadQuestionsFromDatabase(testId);
    } catch (error) {
      console.error('Error fetching test:', error);
      toast({
        title: "Error",
        description: "Failed to load test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionFormOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsQuestionFormOpen(true);
  };

  const handleSaveQuestion = (questionData: Omit<Question, 'id'>) => {
    if (editingQuestion) {
      updateQuestion(editingQuestion.id, questionData);
    } else {
      addQuestion(questionData);
    }
    setHasUnsavedChanges(true);
    setIsQuestionFormOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    deleteQuestion(questionId);
    setHasUnsavedChanges(true);
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowBackConfirmation(true);
    } else {
      navigate('/tests');
    }
  };

  const confirmBackNavigation = () => {
    setShowBackConfirmation(false);
    navigate('/tests');
  };

  const handleReorderQuestions = (startIndex: number, endIndex: number) => {
    reorderQuestions(startIndex, endIndex);
    setHasUnsavedChanges(true);
  };

  // Track changes in form fields
  const handleTitleChange = (value: string) => {
    setTestTitle(value);
    setHasUnsavedChanges(true);
  };

  const handleDescriptionChange = (value: string) => {
    setTestDescription(value);
    setHasUnsavedChanges(true);
  };

  const handleTimeLimitChange = (value: string) => {
    setTimeLimit(value === '' ? '' : Number(value));
    setHasUnsavedChanges(true);
  };

  const handlePasswordChange = (value: string) => {
    setTestPassword(value);
    setHasUnsavedChanges(true);
  };

  const handleActiveChange = (value: boolean) => {
    setIsActive(value);
    setHasUnsavedChanges(true);
  };

  const handleHideScoresChange = (value: boolean) => {
    setHideScores(value);
    setHasUnsavedChanges(true);
  };

  const confirmSaveTest = () => {
    setShowSaveConfirmation(true);
  };

  const handleSaveTest = async () => {
    setShowSaveConfirmation(false);
    if (!testTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test title.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Update the test
      const { error: testError } = await supabase
        .from('tests')
        .update({
          title: testTitle,
          description: testDescription || null,
          time_limit: timeLimit ? Number(timeLimit) : null,
          password: testPassword || null,
          is_active: isActive,
          hide_scores_after_submission: hideScores,
          updated_at: new Date().toISOString()
        })
        .eq('id', testId);

      if (testError) throw testError;

      // Save questions
      const result = await saveQuestionsToDatabase(testId!);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Test updated successfully!"
        });
        setHasUnsavedChanges(false);
        navigate('/tests');
      }
    } catch (error) {
      console.error('Error updating test:', error);
      toast({
        title: "Error",
        description: "Failed to update test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalPoints = () => {
    return questions.reduce((total, question) => total + question.points, 0);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading test...</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-6 py-3"
                  onClick={handleBackClick}
                >
                  <ArrowLeft className="h-6 w-6 mr-2" />
                  Back to Tests
                </Button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Edit Test
              </h1>
            </div>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              onClick={confirmSaveTest}
              disabled={isSaving}
            >
              <Save className="h-6 w-6 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Test Settings */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-800">Test Settings</CardTitle>
                  <CardDescription className="text-lg">Configure your test parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">Test Title</label>
                    <Input 
                      type="text" 
                      className="w-full px-4 py-3 text-lg"
                      placeholder="Enter test title..."
                      value={testTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">Description</label>
                    <Textarea 
                      className="w-full px-4 py-3 text-lg h-32"
                      placeholder="Enter test description..."
                      value={testDescription}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">Time Limit (minutes)</label>
                    <Input 
                      type="number" 
                      className="w-full px-4 py-3 text-lg"
                      placeholder="60"
                      value={timeLimit}
                      onChange={(e) => handleTimeLimitChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">Test Password (optional)</label>
                    <Input 
                      type="text" 
                      className="w-full px-4 py-3 text-lg"
                      placeholder="Enter password..."
                      value={testPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={isActive}
                      onCheckedChange={handleActiveChange}
                      id="active-switch"
                    />
                    <label htmlFor="active-switch" className="text-lg font-medium text-gray-700">
                      Test Active
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="hideScores"
                      checked={hideScores}
                      onChange={(e) => handleHideScoresChange(e.target.checked)}
                      className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="hideScores" className="text-lg font-medium text-gray-700">
                      Hide scores after submission
                    </label>
                  </div>
                  
                  {/* Test Summary */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-lg font-medium text-gray-700 mb-3">Test Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Questions:</span>
                        <span className="font-semibold">{questions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Points:</span>
                        <span className="font-semibold">{getTotalPoints()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-semibold ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Questions */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-gray-800">Questions</CardTitle>
                      <CardDescription className="text-lg">Manage your test questions</CardDescription>
                    </div>
                    <Button className="text-lg px-6 py-3" onClick={handleAddQuestion}>
                      <Plus className="h-5 w-5 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <QuestionList
                    questions={questions}
                    onEdit={handleEditQuestion}
                    onDelete={handleDeleteQuestion}
                    onReorder={handleReorderQuestions}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Question Form Dialog */}
          <Dialog open={isQuestionFormOpen} onOpenChange={setIsQuestionFormOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </DialogTitle>
              </DialogHeader>
              <QuestionForm
                question={editingQuestion || undefined}
                onSave={handleSaveQuestion}
                onCancel={() => setIsQuestionFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Back Confirmation Dialog */}
          <AlertDialog open={showBackConfirmation} onOpenChange={setShowBackConfirmation}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved changes. Are you sure you want to leave? All unsaved changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay and Continue Editing</AlertDialogCancel>
                <AlertDialogAction onClick={confirmBackNavigation}>Leave Without Saving</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Save Confirmation Dialog */}
          <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Save Changes</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to save all changes to this test? This will update the test for all students.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSaveTest}>Save Changes</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EditTest;
