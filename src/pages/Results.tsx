
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Calendar, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTestAttempts } from '@/hooks/useTestAttempts';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BackToDashboard } from '@/components/BackToDashboard';
import { Layout } from '@/components/Layout';

const Results = () => {
  const { data: testAttempts = [], isLoading, error } = useTestAttempts();
  const navigate = useNavigate();

  // Calculate stats from real data
  const averageScore = testAttempts.length > 0 
    ? Math.round(testAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / testAttempts.length)
    : 0;
  
  const testsCompleted = testAttempts.length;
  const bestScore = testAttempts.length > 0 
    ? Math.max(...testAttempts.map(attempt => attempt.score || 0))
    : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: "default", text: "Excellent", color: "bg-green-100 text-green-800" };
    if (score >= 80) return { variant: "default", text: "Good", color: "bg-blue-100 text-blue-800" };
    if (score >= 70) return { variant: "default", text: "Fair", color: "bg-yellow-100 text-yellow-800" };
    return { variant: "default", text: "Needs Improvement", color: "bg-red-100 text-red-800" };
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout backgroundVariant="gradient-orange">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-lg text-muted-foreground mt-4">Loading your results...</p>
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
        <Layout backgroundVariant="gradient-orange">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-lg text-destructive">Error loading results. Please try again.</p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout backgroundVariant="gradient-orange">
        {/* Floating Achievement Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-20 animate-bounce animation-delay-0"></div>
        <div className="absolute top-40 right-20 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-30 animate-bounce animation-delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-full opacity-25 animate-bounce animation-delay-2000"></div>

        <div className="p-8">
          <div className="max-w-7xl mx-auto">

            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-6">
                <BackToDashboard />
                <div className="space-y-2">
                  <h1 className="text-5xl leading-snug font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent animate-fade-in">
                    My Results
                  </h1>
                  <p className="text-xl text-gray-600 font-medium animate-fade-in animation-delay-200">
                    Track your progress and achievements
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="group bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="text-2xl text-white flex items-center">
                    <Award className="h-8 w-8 mr-3 animate-pulse" />
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-6xl font-bold mb-2 animate-fade-in animation-delay-300">{averageScore}%</div>
                  <p className="text-green-100 text-lg font-medium">Across all tests</p>
                  <div className="mt-4 bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-1000 ease-out" 
                      style={{ width: `${averageScore}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in animation-delay-200">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="text-2xl text-white flex items-center">
                    <TrendingUp className="h-8 w-8 mr-3 animate-pulse" />
                    Tests Completed
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-6xl font-bold mb-2 animate-fade-in animation-delay-500">{testsCompleted}</div>
                  <p className="text-blue-100 text-lg font-medium">Total attempts</p>
                  <div className="mt-4 flex items-center space-x-1">
                    {[...Array(Math.min(testsCompleted, 5))].map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in animation-delay-400">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="text-2xl text-white flex items-center">
                    <Award className="h-8 w-8 mr-3 animate-pulse" />
                    Best Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-6xl font-bold mb-2 animate-fade-in animation-delay-700">{bestScore}%</div>
                  <p className="text-orange-100 text-lg font-medium">Personal record</p>
                  <div className="mt-4">
                    <div className="text-sm text-orange-100">🏆 Achievement unlocked!</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Results History */}
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">Test Results History</h2>
                <p className="text-xl text-gray-600">Your learning journey and achievements</p>
              </div>
              
              {testAttempts.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <CardContent className="text-center py-20">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-ping opacity-20"></div>
                      <Award className="h-20 w-20 text-gray-400 mx-auto mb-6 relative z-10 animate-bounce" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-600 mb-4">No test results yet</h3>
                    <p className="text-xl text-gray-500 mb-8">Complete your first test to see results here</p>
                    <Link to="/tests">
                      <Button className="text-lg py-4 px-8 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        View Available Tests
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                testAttempts.map((attempt, index) => {
                  const badge = getScoreBadge(attempt.score || 0);
                  return (
                    <Card 
                      key={attempt.id} 
                      className="group bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-102 hover:-translate-y-1 animate-fade-in"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      {/* Performance Indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-lg ${
                        (attempt.score || 0) >= 90 ? 'bg-gradient-to-b from-green-400 to-emerald-500' :
                        (attempt.score || 0) >= 80 ? 'bg-gradient-to-b from-blue-400 to-indigo-500' :
                        (attempt.score || 0) >= 70 ? 'bg-gradient-to-b from-yellow-400 to-orange-500' :
                        'bg-gradient-to-b from-red-400 to-pink-500'
                      }`}></div>
                      
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-3xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                              {attempt.tests?.title || 'Unknown Test'}
                            </CardTitle>
                            <CardDescription className="text-lg text-gray-600 flex items-center mt-3 font-medium">
                              <Calendar className="h-5 w-5 mr-2" />
                              Completed on {formatDate(attempt.completed_at || attempt.started_at)}
                            </CardDescription>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge className={`text-lg px-6 py-2 font-bold border-0 ${badge.color}`}>
                              {badge.text}
                            </Badge>
                            <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                              {attempt.score || 0}%
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex items-center justify-between text-lg p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Score:</span>
                            <span className="font-bold text-orange-600">{attempt.score || 0}%</span>
                          </div>
                          <div className="flex items-center justify-between text-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Total Points:</span>
                            <span className="font-bold text-blue-600">{attempt.total_points || 0} points</span>
                          </div>
                          <div className="flex items-center justify-between text-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Questions:</span>
                            <span className="font-bold text-purple-600">{attempt.tests?.total_questions || 0} questions</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Performance</span>
                            <span>{attempt.score || 0}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                                (attempt.score || 0) >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                (attempt.score || 0) >= 80 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                                (attempt.score || 0) >= 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                'bg-gradient-to-r from-red-400 to-pink-500'
                              }`}
                              style={{ width: `${attempt.score || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {attempt.tests?.description && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700 leading-relaxed">{attempt.tests.description}</p>
                          </div>
                        )}
                        <div className="pt-4 border-t border-gray-100">
                          <Button 
                            onClick={() => navigate(`/test-analysis/${attempt.id}`)}
                            variant="outline"
                            className="w-full flex items-center justify-center gap-3 text-lg py-4 bg-white border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300"
                          >
                            <BarChart3 className="h-5 w-5" />
                            Analyze Results
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Results;
