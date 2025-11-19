
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { Question } from './QuestionForm';

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

const QuestionList = ({ questions, onEdit, onDelete, onReorder }: QuestionListProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'short_answer':
        return 'Short Answer';
      default:
        return type;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'bg-blue-100 text-blue-800';
      case 'true_false':
        return 'bg-green-100 text-green-800';
      case 'short_answer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (questions.length === 0) {
    return (
      <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 text-lg">No questions added yet</p>
          <p className="text-gray-400 text-sm mt-2">Click "Add Question" to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <Card 
          key={question.id} 
          className={`bg-white border border-gray-200 transition-all duration-200 cursor-move ${
            draggedIndex === index ? 'opacity-50 transform rotate-2' : ''
          } ${
            dragOverIndex === index && draggedIndex !== index ? 'border-blue-400 shadow-lg' : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                <Badge className={getQuestionTypeColor(question.question_type)}>
                  {getQuestionTypeLabel(question.question_type)}
                </Badge>
                <Badge variant="outline">{question.points} point{question.points !== 1 ? 's' : ''}</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(question)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(question.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium text-gray-900">{question.question_text}</p>
            </div>
            
            {question.question_type === 'multiple_choice' && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Options:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-2 rounded border text-sm ${
                        option === question.correct_answer
                          ? 'bg-green-50 border-green-200 text-green-800 font-medium'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                      {option === question.correct_answer && (
                        <span className="ml-2 text-green-600">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {question.question_type === 'true_false' && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Correct Answer: <span className="text-green-600 font-semibold">{question.correct_answer}</span>
                </p>
              </div>
            )}
            
            {question.question_type === 'short_answer' && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Expected Answer: <span className="text-blue-600 font-mono">{question.correct_answer}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuestionList;
