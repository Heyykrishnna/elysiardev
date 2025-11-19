
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, TrendingUp, Clock, Award, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const TestResults = () => {
  const { testId } = useParams<{ testId: string }>();
  const { profile } = useAuth();

  // Fetch test details
  const { data: test, isLoading: testLoading } = useQuery({
    queryKey: ['test', testId],
    queryFn: async () => {
      if (!testId) throw new Error('Test ID is required');
      
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!testId,
  });

  // Fetch test attempts/results
  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ['test-attempts', testId],
    queryFn: async () => {
      if (!testId) throw new Error('Test ID is required');
      
      const { data, error } = await supabase
        .from('test_attempts')
        .select(`
          *,
          profiles!test_attempts_student_id_fkey(full_name, email)
        `)
        .eq('test_id', testId)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!testId,
  });

  const isLoading = testLoading || attemptsLoading;

  // Calculate statistics
  const totalAttempts = attempts?.length || 0;
  const validScores = attempts?.filter(attempt => attempt.score !== null && attempt.score !== undefined) || [];
  const averageScore = validScores.length 
    ? Math.round((validScores.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / validScores.length))
    : 0;
  const highestScore = validScores.length 
    ? Math.max(...validScores.map(attempt => attempt.score || 0))
    : 0;
  const lowestScore = validScores.length 
    ? Math.min(...validScores.map(attempt => attempt.score || 0))
    : 0;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!test) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center text-red-600">
              Test not found.
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-[radial-gradient(circle_at_30%_70%,_theme(colors.indigo.100)_0%,_transparent_50%)] animate-pulse"></div>
        </div>
        
        {/* Floating Analytics Elements */}
        <div className="absolute top-16 left-12 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 animate-bounce animation-delay-0"></div>
        <div className="absolute top-32 right-16 w-24 h-24 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full opacity-30 animate-bounce animation-delay-1500"></div>
        <div className="absolute bottom-32 left-24 w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-25 animate-bounce animation-delay-3000"></div>
        
        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-6">
                <Link to="/tests">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <ArrowLeft className="h-6 w-6 mr-3" />
                    Back to Tests
                  </Button>
                </Link>
                <div className="space-y-2">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
                    Test Analytics
                  </h1>
                  <p className="text-2xl text-gray-700 font-semibold animate-fade-in animation-delay-200">{test.title}</p>
                  <p className="text-lg text-gray-600 animate-fade-in animation-delay-300">Comprehensive performance insights</p>
                </div>
              </div>
            </div>

            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
              <Card className="group bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="flex items-center text-blue-600 text-lg font-bold">
                    <Users className="h-6 w-6 mr-2 animate-pulse" />
                    Total Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-bold text-gray-800 animate-fade-in animation-delay-300">{totalAttempts}</div>
                  <div className="text-sm text-blue-600 mt-2">Student participation</div>
                </CardContent>
              </Card>

              <Card className="group bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in animation-delay-100">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="flex items-center text-green-600 text-lg font-bold">
                    <TrendingUp className="h-6 w-6 mr-2 animate-pulse" />
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-bold text-gray-800 animate-fade-in animation-delay-400">{averageScore}%</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full h-2 transition-all duration-1000 ease-out" 
                      style={{ width: `${averageScore}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in animation-delay-200">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="flex items-center text-yellow-600 text-lg font-bold">
                    <Award className="h-6 w-6 mr-2 animate-pulse" />
                    Highest Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-bold text-gray-800 animate-fade-in animation-delay-500">{highestScore}%</div>
                  <div className="text-sm text-yellow-600 mt-2">🏆 Best performance</div>
                </CardContent>
              </Card>

              <Card className="group bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in animation-delay-300">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="flex items-center text-red-600 text-lg font-bold">
                    <TrendingUp className="h-6 w-6 mr-2 rotate-180 animate-pulse" />
                    Lowest Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-bold text-gray-800 animate-fade-in animation-delay-600">{validScores.length > 0 ? lowestScore : 0}%</div>
                  <div className="text-sm text-red-600 mt-2">Room for improvement</div>
                </CardContent>
              </Card>

              <Card className="group bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in animation-delay-400">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="flex items-center text-purple-600 text-lg font-bold">
                    <Clock className="h-6 w-6 mr-2 animate-pulse" />
                    Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-bold text-gray-800 animate-fade-in animation-delay-700">{test.total_questions}</div>
                  <div className="text-sm text-purple-600 mt-2">Total items</div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Results Table */}
            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Student Performance
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 font-medium">
                  Detailed breakdown of individual test attempts and achievements
                </CardDescription>
              </CardHeader>
            <CardContent>
              {attempts && attempts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base font-semibold">Student</TableHead>
                      <TableHead className="text-base font-semibold">Score</TableHead>
                      <TableHead className="text-base font-semibold">Points Earned</TableHead>
                      <TableHead className="text-base font-semibold">Total Points</TableHead>
                      <TableHead className="text-base font-semibold">Completed</TableHead>
                      <TableHead className="text-base font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="text-base">
                          <div>
                            <div className="font-medium">{attempt.profiles?.full_name || 'Anonymous'}</div>
                            <div className="text-sm text-gray-500">{attempt.profiles?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-base">
                          {attempt.score !== null ? (
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(attempt.score)}`}>
                              {attempt.score}%
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-sm">
                              Calculating...
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-base font-medium">
                          {attempt.score && attempt.total_points ? 
                            Math.round((attempt.score / 100) * attempt.total_points) : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell className="text-base font-medium">
                          {attempt.total_points || 'N/A'}
                        </TableCell>
                        <TableCell className="text-base">
                          {attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-base">
                          <Badge variant="outline" className="text-sm">
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">No test attempts yet</p>
                  <p className="text-base text-gray-400 mt-2">Students haven't taken this test yet</p>
                </div>
              )}
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TestResults;
