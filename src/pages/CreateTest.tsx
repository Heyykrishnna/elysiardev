
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Save, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateTest } from '@/hooks/useTests';
import { useTestQuestions } from '@/hooks/useTestQuestions';
import { useToast } from '@/components/ui/use-toast';
import QuestionForm, { Question } from '@/components/QuestionForm';
import QuestionList from '@/components/QuestionList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const CreateTest = () => {
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState<number | ''>('');
  const [testPassword, setTestPassword] = useState('');
  const [hideScores, setHideScores] = useState(false);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const createTest = useCreateTest();
  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    saveQuestionsToDatabase
  } = useTestQuestions();

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

  const handleSaveTest = async () => {
    if (!testTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test title.",
        variant: "destructive"
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question to the test.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Create the test
      const testData = {
        title: testTitle,
        description: testDescription || undefined,
        time_limit: timeLimit ? Number(timeLimit) : undefined,
        password: testPassword || undefined,
        hide_scores_after_submission: hideScores
      };

      const newTest = await createTest(testData);
      
      // Save questions to the test
      const result = await saveQuestionsToDatabase(newTest.id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Test created successfully!"
        });
        setHasUnsavedChanges(false);
        navigate('/tests');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      toast({
        title: "Error",
        description: "Failed to create test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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

  const handleHideScoresChange = (value: boolean) => {
    setHideScores(value);
    setHasUnsavedChanges(true);
  };

  const getTotalPoints = () => {
    return questions.reduce((total, question) => total + question.points, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="lg" className="text-lg px-6 py-3" onClick={handleBackClick}>
              <ArrowLeft className="h-6 w-6 mr-2" />
              Back to Tests
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Create New Test
            </h1>
          </div>
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-6 py-3"
              onClick={() => setIsPreviewMode(true)}
              disabled={questions.length === 0}
            >
              <Eye className="h-6 w-6 mr-2" />
              Preview
            </Button>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              onClick={handleSaveTest}
              disabled={isSaving}
            >
              <Save className="h-6 w-6 mr-2" />
              {isSaving ? 'Saving...' : 'Save Test'}
            </Button>
          </div>
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
                    <CardDescription className="text-lg">Add questions to your test</CardDescription>
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

        {/* Preview Dialog */}
        <Dialog open={isPreviewMode} onOpenChange={setIsPreviewMode}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Test Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{testTitle}</h2>
                {testDescription && (
                  <p className="text-gray-600 mt-2">{testDescription}</p>
                )}
                <div className="flex gap-4 mt-4 text-sm text-gray-500">
                  <span>Questions: {questions.length}</span>
                  <span>Total Points: {getTotalPoints()}</span>
                  {timeLimit && <span>Time Limit: {timeLimit} minutes</span>}
                </div>
              </div>
              <div className="border-t pt-6">
                <QuestionList
                  questions={questions}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onReorder={() => {}}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Back Confirmation Dialog */}
        <AlertDialog open={showBackConfirmation} onOpenChange={setShowBackConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved questions. Are you sure you want to leave? All unsaved questions will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay and Continue Creating</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBackNavigation}>Leave Without Saving</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CreateTest;
