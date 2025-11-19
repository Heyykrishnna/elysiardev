import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BookOpen, Send } from 'lucide-react';
import { useResourceRequests } from '@/hooks/useResourceRequests';
import { useAuth } from '@/contexts/AuthContext';

const RequestResource = () => {
  const navigate = useNavigate();
  const { createRequest } = useResourceRequests();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const requestData = {
      book_name: formData.get('book_name') as string,
      subject: formData.get('subject') as string,
      edition: formData.get('edition') as string || undefined,
      reason: formData.get('reason') as string || undefined,
    };

    const { error } = await createRequest(requestData);
    
    if (!error) {
      navigate('/study-resources');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/study-resources')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Study Resources
          </Button>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Request a Resource
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Can't find what you're looking for? Request a specific book or resource
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="book_name" className="text-sm font-medium text-gray-700">
                    Resource Name *
                  </Label>
                  <Input
                    id="book_name"
                    name="book_name"
                    required
                    placeholder="Enter the Resource title"
                    className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    placeholder="e.g., Mathematics, Physics"
                    className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edition" className="text-sm font-medium text-gray-700">
                  Edition
                </Label>
                <Input
                  id="edition"
                  name="edition"
                  placeholder="e.g., 5th Edition, Latest Edition"
                  className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                  Why do you need this resource? (Optional)
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Tell us more about how this resource will help you..."
                  className="min-h-[100px] bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting Request...
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestResource;
