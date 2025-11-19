import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

export interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  points: number;
  order_number: number;
}

interface QuestionFormProps {
  question?: Question;
  onSave: (question: Omit<Question, 'id' | 'order_number'>) => void;
  onCancel: () => void;
}

const QuestionForm = ({ question, onSave, onCancel }: QuestionFormProps) => {
  const [questionText, setQuestionText] = useState(question?.question_text || '');
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'true_false' | 'short_answer'>(
    question?.question_type || 'multiple_choice'
  );
  const [options, setOptions] = useState<string[]>(
    question?.options || ['', '', '', '']
  );
  const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer || '');
  const [points, setPoints] = useState(question?.points || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText.trim()) return;
    
    let finalOptions: string[] | undefined = undefined;
    let finalCorrectAnswer = correctAnswer;

    if (questionType === 'multiple_choice') {
      finalOptions = options.filter(opt => opt.trim() !== '');
      if (finalOptions.length < 2) return;
    } else if (questionType === 'true_false') {
      finalOptions = ['True', 'False'];
      if (!['True', 'False'].includes(correctAnswer)) {
        finalCorrectAnswer = 'True';
      }
    }

    onSave({
      question_text: questionText,
      question_type: questionType,
      options: finalOptions,
      correct_answer: finalCorrectAnswer,
      points
    });
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{question ? 'Edit Question' : 'Add New Question'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Question Text</label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Question Type</label>
            <Select value={questionType} onValueChange={(value: any) => setQuestionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {questionType === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium mb-2">Options</label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Correct Answer</label>
            {questionType === 'multiple_choice' ? (
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {options.filter(opt => opt.trim()).map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : questionType === 'true_false' ? (
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="True">True</SelectItem>
                  <SelectItem value="False">False</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Enter correct answer"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Points</label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
              min="1"
              className="w-32"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit">
              {question ? 'Update Question' : 'Add Question'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuestionForm;
