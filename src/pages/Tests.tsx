import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTests } from '@/hooks/useTests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, Users, Settings, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BackToDashboard } from '@/components/BackToDashboard';
import { Layout } from '@/components/Layout';

const Tests = () => {
  const { profile } = useAuth();
  const { data: tests, isLoading, error } = useTests();
  const navigate = useNavigate();
  const isOwner = profile?.role === 'owner';

  const handleTakeTest = (testId: string) => {
    navigate(`/take-test/${testId}`);
  };

  const handleEditTest = (testId: string) => {
    navigate(`/edit-test/${testId}`);
  };

  const handleViewResults = (testId: string) => {
    navigate(`/test-results/${testId}`);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout backgroundVariant="gradient-blue">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout backgroundVariant="gradient-blue">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center text-destructive">
                Error loading tests. Please try again later.
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout backgroundVariant="gradient-blue">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-bounce animation-delay-0"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-30 animate-bounce animation-delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full opacity-25 animate-bounce animation-delay-2000"></div>
        
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section with Enhanced Styling */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-6">
                <BackToDashboard />
                <div className="space-y-2">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in pb-1">
                    {isOwner ? 'My Tests' : 'Available Tests'}
                  </h1>
                  <p className="text-xl text-gray-600 font-medium animate-fade-in animation-delay-200">
                    {isOwner ? 'Manage and monitor your test collection' : 'Discover and take exciting tests'}
                  </p>
                </div>
              </div>
              {isOwner && (
                <Link to="/create-test">
                  <Button size="lg" className="text-lg px-10 py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                    <Plus className="h-6 w-6 mr-3" />
                    Create New Test
                  </Button>
                </Link>
              )}
            </div>

            {/* Enhanced Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tests && tests.length > 0 ? (
                tests.map((test, index) => (
                  <Card 
                    key={test.id} 
                    className="group bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
                    
                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="text-sm px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                          <FileText className="h-4 w-4 mr-1" />
                          Test
                        </Badge>
                        <div className="flex space-x-2">
                          {test.time_limit && (
                            <Badge variant="outline" className="text-sm px-3 py-1.5 bg-white/80 backdrop-blur-sm border-gray-200">
                              <Clock className="h-4 w-4 mr-1" />
                              {test.time_limit} min
                            </Badge>
                          )}
                          {!test.is_active && (
                            <Badge variant="destructive" className="text-sm px-3 py-1.5 bg-red-500 text-white border-0">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{test.title}</CardTitle>
                      <CardDescription className="text-lg text-gray-600 leading-relaxed">
                        {test.description || 'No description available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-lg p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600 font-medium">Questions:</span>
                          <span className="font-bold text-blue-600">{test.total_questions}</span>
                        </div>
                        <div className="flex items-center justify-between text-lg p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600 font-medium">Created:</span>
                          <span className="font-semibold text-gray-700">
                            {new Date(test.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {isOwner ? (
                        <div className="flex space-x-3 pt-4">
                          <Button 
                            className="flex-1 text-lg py-3.5 bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300" 
                            variant="outline"
                            onClick={() => handleEditTest(test.id)}
                          >
                            <Settings className="h-5 w-5 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            className="flex-1 text-lg py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => handleViewResults(test.id)}
                          >
                            <Users className="h-5 w-5 mr-2" />
                            Results
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="w-full text-lg py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          disabled={!test.is_active}
                          onClick={() => handleTakeTest(test.id)}
                        >
                          <FileText className="h-5 w-5 mr-2" />
                          {test.is_active ? 'Take Test' : 'Test Inactive'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="bg-white/70 backdrop-blur-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-500 hover:shadow-xl">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
                        <FileText className="h-20 w-20 text-gray-400 relative z-10 animate-bounce" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-600 mt-6 mb-2">
                        {isOwner ? 'Create your first test' : 'No tests available yet'}
                      </h3>
                      <p className="text-lg text-gray-500 text-center mb-8">
                        {isOwner ? 'Start building amazing tests for your students' : 'Check back later for exciting new tests'}
                      </p>
                      {isOwner && (
                        <Link to="/create-test">
                          <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <Plus className="h-5 w-5 mr-2" />
                            Create Test
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Tests;
