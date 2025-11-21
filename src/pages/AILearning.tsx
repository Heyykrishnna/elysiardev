import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Layout } from '@/components/Layout';
import { Sparkles, BookOpen, Video, FileText, Brain, Loader2, CheckCircle2, XCircle, Lightbulb, Target, Award, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BackToDashboard } from '@/components/BackToDashboard';
import { BeautifulFooter } from "@/components/BeautifulFooter";
import StudentLoader from "@/components/studentportalload";
import { FlashcardViewer } from "@/components/FlashcardViewer";
import { useSpacedRepetition, SpacedRepetitionCard } from "@/hooks/useSpacedRepetition";
import { motion } from 'framer-motion';

interface Question {
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  type: 'multiple_choice' | 'short_answer';
}

interface Resources {
  notes: string;
  videoSearchQueries: string[];
  subtopics: string[];
  tips: string[];
  keyPoints: string[];
}

const AILearning = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [testSize, setTestSize] = useState('10');
  const [difficulty, setDifficulty] = useState('medium');
  const [generatedTest, setGeneratedTest] = useState<Question[]>([]);
  const [resources, setResources] = useState<Resources | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [flashcards, setFlashcards] = useState<SpacedRepetitionCard[]>([]);
  const { calculateNextReview, getDueCards, getUpcomingReviews, initializeCard } = useSpacedRepetition();

  // Password protection states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingAction, setPendingAction] = useState<'test' | 'resources' | 'flashcards' | null>(null);
  const ADMIN_PASSWORD = 'Khandelwal@39';

  // Check daily generation limit
  const checkGenerationLimit = (): boolean => {
    const today = new Date().toDateString();
    const storageKey = 'ai_generations';
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return true; // First time, allow
    }

    try {
      const data = JSON.parse(stored);
      if (data.date !== today) {
        // New day, reset
        localStorage.setItem(storageKey, JSON.stringify({ date: today, count: 0 }));
        return true;
      }
      return data.count < 1;
    } catch {
      return true;
    }
  };

  const incrementGenerationCount = () => {
    const today = new Date().toDateString();
    const storageKey = 'ai_generations';
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      localStorage.setItem(storageKey, JSON.stringify({ date: today, count: 1 }));
      return;
    }

    try {
      const data = JSON.parse(stored);
      if (data.date === today) {
        data.count += 1;
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    } catch {
      localStorage.setItem(storageKey, JSON.stringify({ date: today, count: 1 }));
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setShowPasswordDialog(false);
      setPasswordInput('');

      // Proceed with pending action
      if (pendingAction === 'test') {
        executeGenerateTest();
      } else if (pendingAction === 'resources') {
        executeGetResources();
      } else if (pendingAction === 'flashcards') {
        executeGenerateFlashcards();
      }
      setPendingAction(null);
    } else {
      toast({
        title: "Incorrect Password",
        description: "Please enter the correct password",
        variant: "destructive"
      });
    }
  };

  const generateTest = async () => {
    if (!topic || !subject || !grade) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Check generation limit
    if (!checkGenerationLimit()) {
      setPendingAction('test');
      setShowPasswordDialog(true);
      return;
    }

    await executeGenerateTest();
  };

  const executeGenerateTest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-learning', {
        body: {
          action: 'generate_test',
          topic,
          subject,
          grade,
          testSize: parseInt(testSize),
          difficulty
        }
      });

      if (error) throw error;

      setGeneratedTest(data);
      setShowResults(false);
      setUserAnswers({});
      incrementGenerationCount();
      toast({
        title: "Test Generated!",
        description: `${data.length} questions created successfully`,
      });
    } catch (error) {
      console.error('Error generating test:', error);
      toast({
        title: "Error",
        description: "Failed to generate test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getResources = async () => {
    if (!topic || !subject || !grade) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Check generation limit
    if (!checkGenerationLimit()) {
      setPendingAction('resources');
      setShowPasswordDialog(true);
      return;
    }

    await executeGetResources();
  };

  const executeGetResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-learning', {
        body: {
          action: 'get_resources',
          topic,
          subject,
          grade
        }
      });

      if (error) throw error;

      setResources(data);
      incrementGenerationCount();
      toast({
        title: "Resources Ready!",
        description: "Study materials loaded successfully",
      });
    } catch (error) {
      console.error('Error getting resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitTest = () => {
    setShowResults(true);
    const correct = generatedTest.filter((q, idx) =>
      userAnswers[idx]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
    ).length;

    toast({
      title: "Test Completed!",
      description: `You scored ${correct}/${generatedTest.length}`,
    });
  };

  const getYouTubeSearchUrl = (query: string) => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  };

  const generateFlashcards = async () => {
    if (!topic || !subject || !grade) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Check generation limit
    if (!checkGenerationLimit()) {
      setPendingAction('flashcards');
      setShowPasswordDialog(true);
      return;
    }

    await executeGenerateFlashcards();
  };

  const executeGenerateFlashcards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-learning', {
        body: {
          action: 'generate_flashcards',
          topic,
          subject,
          grade
        }
      });

      if (error) throw error;

      const newFlashcards = data.map((card: { front: string; back: string }) =>
        initializeCard(crypto.randomUUID(), card.front, card.back)
      );

      setFlashcards(newFlashcards);
      incrementGenerationCount();
      toast({
        title: "Flashcards Generated!",
        description: `${data.length} flashcards created successfully`,
      });
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFlashcardRate = (cardId: string, rating: 'easy' | 'medium' | 'hard') => {
    setFlashcards(cards =>
      cards.map(card =>
        card.id === cardId ? calculateNextReview(rating, card) : card
      )
    );
    toast({
      title: "Progress Saved",
      description: `Card marked as ${rating}`,
    });
  };

  const handleDeleteFlashcard = (cardId: string) => {
    setFlashcards(cards => cards.filter(card => card.id !== cardId));
    toast({
      title: "Card Deleted",
      description: "Flashcard removed successfully",
    });
  };

  const dueCards = getDueCards(flashcards);
  const upcomingReviews = getUpcomingReviews(flashcards);

  const calculateScore = () => {
    const correct = generatedTest.filter((q, idx) =>
      userAnswers[idx]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
    ).length;
    return { correct, total: generatedTest.length, percentage: Math.round((correct / generatedTest.length) * 100) };
  };

  if (loading || showLoader) {
    return (
      <div className="bg-black min-h-screen">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <StudentLoader />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className='bg-[#090607] min-h-screen' style={{ fontFamily: 'Epilogue, sans-serif' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-9xl mx-auto space-y-8">
            <div className="mb-4">
              <BackToDashboard />
            </div>

            {/* Enhanced Header with Gradient */}
            <div className="text-center space-y-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ac1ed6]/10 via-[#c26e73]/10 to-[#ac1ed6]/10 rounded-3xl blur-3xl -z-10" />
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#ac1ed6] via-[#c26e73] to-[#ac1ed6] bg-clip-text text-transparent">
                  Create, explore, be inspired
                </h1>
              </div>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Personalized AI-powered learning at your fingertips
              </p>
            </div>

            {/* Enhanced Configuration Card */}
            <Card className="border border-white/10 bg-[#221f20] shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-[#ac1ed6]/5 to-[#c26e73]/5">
                <CardTitle className="flex items-center gap-2 text-2xl text-white">
                  <Target className="w-6 h-6 text-[#ac1ed6]" />
                  Shape Your Knowledge Path
                </CardTitle>
                <CardDescription className="text-base text-white/60">
                  Tell us what you want to learn, and we'll create personalized content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-base font-semibold text-white">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Photosynthesis, Quadratic Equations"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="h-11 border border-white/20 bg-[#090607] text-white placeholder:text-white/40 focus:border-[#ac1ed6] transition-colors rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-base font-semibold text-white">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Biology, Mathematics"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="h-11 border border-white/20 bg-[#090607] text-white placeholder:text-white/40 focus:border-[#ac1ed6] transition-colors rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-base font-semibold text-white">Grade/Level</Label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger className="h-11 border border-white/20 bg-[#090607] text-white rounded-xl">
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#221f20] border-white/20 text-white">
                        <SelectItem value="elementary">Elementary (Grades 1-5)</SelectItem>
                        <SelectItem value="middle">Middle School (Grades 6-8)</SelectItem>
                        <SelectItem value="high">High School (Grades 9-12)</SelectItem>
                        <SelectItem value="college">College/University</SelectItem>
                        <SelectItem value="advanced">Graduate/Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testSize" className="text-base font-semibold text-white">Test Size</Label>
                    <Select value={testSize} onValueChange={setTestSize}>
                      <SelectTrigger className="h-11 border border-white/20 bg-[#090607] text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#221f20] border-white/20 text-white">
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="15">15 Questions</SelectItem>
                        <SelectItem value="20">20 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="difficulty" className="text-base font-semibold text-white">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="h-11 border border-white/20 bg-[#090607] text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#221f20] border-white/20 text-white">
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <Button
                    onClick={generateTest}
                    disabled={loading}
                    className="h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-[#ac1ed6] to-[#c26e73] hover:from-[#c26e73] hover:to-[#ac1ed6] text-white rounded-xl"
                  >
                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileText className="w-5 h-5 mr-2" />}
                    Generate Test
                  </Button>
                  <Button
                    onClick={getResources}
                    disabled={loading}
                    className="h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-[#ac1ed6] to-[#c26e73] hover:from-[#c26e73] hover:to-[#ac1ed6] text-white rounded-xl"
                  >
                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <BookOpen className="w-5 h-5 mr-2" />}
                    Get Resources
                  </Button>
                  <Button
                    onClick={generateFlashcards}
                    disabled={loading}
                    className="h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-[#ac1ed6] to-[#c26e73] hover:from-[#c26e73] hover:to-[#ac1ed6] text-white rounded-xl"
                  >
                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Brain className="w-5 h-5 mr-2" />}
                    Create Flashcards
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Tabs */}
            <Tabs defaultValue="test" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-14 p-1 bg-[#221f20] border border-white/10 rounded-xl">
                <TabsTrigger value="test" className="text-white/60 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ac1ed6] data-[state=active]:to-[#c26e73] data-[state=active]:text-white rounded-lg">
                  <FileText className="w-4 h-4 mr-2" />
                  Test
                </TabsTrigger>
                <TabsTrigger value="resources" className="text-white/60 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ac1ed6] data-[state=active]:to-[#c26e73] data-[state=active]:text-white rounded-lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="text-white/60 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ac1ed6] data-[state=active]:to-[#c26e73] data-[state=active]:text-white rounded-lg">
                  <Brain className="w-4 h-4 mr-2" />
                  Flashcards
                </TabsTrigger>
              </TabsList>

              <TabsContent value="test" className="space-y-4 mt-6">
                {generatedTest.length > 0 ? (
                  <>
                    {showResults && (
                      <Card className="border border-[#ac1ed6] bg-[#221f20] shadow-lg rounded-2xl">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Award className="w-10 h-10 text-[#ac1ed6]" />
                              <div>
                                <h3 className="text-2xl font-bold text-white">Your Score</h3>
                                <p className="text-white/60">Test Results</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-4xl font-bold text-[#ac1ed6]">
                                {calculateScore().correct}/{calculateScore().total}
                              </div>
                              <div className="text-xl text-white/60">
                                {calculateScore().percentage}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {generatedTest.map((q, idx) => (
                      <Card key={idx} className="border border-white/10 bg-[#221f20] hover:border-[#ac1ed6]/50 transition-colors duration-300 shadow-md hover:shadow-lg rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-[#ac1ed6]/5 to-transparent">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg font-bold text-white">
                              Question {idx + 1}
                            </CardTitle>
                            <div className="flex items-center gap-2 bg-[#ac1ed6]/10 px-3 py-1 rounded-full">
                              <Award className="w-4 h-4 text-[#ac1ed6]" />
                              <span className="text-sm font-semibold text-[#ac1ed6]">{q.points} points</span>
                            </div>
                          </div>
                          <CardDescription className="text-base mt-2 text-white/70">{q.question}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                          {q.type === 'multiple_choice' && q.options ? (
                            <div className="space-y-3">
                              {q.options.map((option, optIdx) => (
                                <Button
                                  key={optIdx}
                                  variant={userAnswers[idx] === option ? "default" : "outline"}
                                  className="w-full justify-start h-auto py-3 px-4 text-left hover:scale-[1.02] transition-transform"
                                  onClick={() => setUserAnswers({ ...userAnswers, [idx]: option })}
                                  disabled={showResults}
                                >
                                  <span className="font-medium mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                                  {option}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <Input
                              placeholder="Type your answer..."
                              value={userAnswers[idx] || ''}
                              onChange={(e) => setUserAnswers({ ...userAnswers, [idx]: e.target.value })}
                              disabled={showResults}
                              className="h-12 border border-white/20 bg-[#090607] text-white placeholder:text-white/40 rounded-xl"
                            />
                          )}

                          {showResults && (
                            <div className={`p-4 rounded-xl border-2 ${userAnswers[idx]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
                              ? 'bg-green-50 border-green-300 dark:bg-green-950/30'
                              : 'bg-red-50 border-red-300 dark:bg-red-950/30'
                              }`}>
                              <div className="flex items-center gap-2 mb-3">
                                {userAnswers[idx]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim() ? (
                                  <>
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <p className="font-bold text-green-700 dark:text-green-400">Correct!</p>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-5 h-5 text-red-600" />
                                    <p className="font-bold text-red-700 dark:text-red-400">Incorrect</p>
                                  </>
                                )}
                              </div>
                              <p className="mb-2"><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                              <div className="flex items-start gap-2 mt-3 pt-3 border-t">
                                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{q.explanation}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {!showResults && (
                      <Button onClick={submitTest} className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all" size="lg">
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Submit Test
                      </Button>
                    )}
                  </>
                ) : (
                  <Card className="border border-dashed border-white/20 bg-[#221f20] rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <FileText className="w-20 h-20 text-white/30 mb-4" />
                      <p className="text-lg text-white/60 text-center mb-4">
                        You haven't generated any tests yet.
                        <br />Customize your preferences and hit 'Generate Test' to get started.                    </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resources" className="space-y-6 mt-6">
                {resources ? (
                  <>
                    <Card className="border border-white/10 bg-[#221f20] shadow-lg rounded-2xl">
                      <CardHeader className="bg-gradient-to-r from-[#ac1ed6]/5 to-transparent">
                        <CardTitle className="flex items-center gap-2 text-xl text-white">
                          <BookOpen className="w-6 h-6 text-[#ac1ed6]" />
                          Study Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <p className="whitespace-pre-wrap text-base leading-relaxed text-white/80">{resources.notes}</p>
                      </CardContent>
                    </Card>

                    <Card className="border border-white/10 bg-[#221f20] shadow-lg rounded-2xl">
                      <CardHeader className="bg-gradient-to-r from-[#c26e73]/5 to-transparent">
                        <CardTitle className="flex items-center gap-2 text-xl text-white">
                          <Video className="w-6 h-6 text-[#c26e73]" />
                          Video Resources
                        </CardTitle>
                        <CardDescription className="text-white/60">Click to search on YouTube</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-4">
                        {resources.videoSearchQueries.map((query, idx) => (
                          <a
                            key={idx}
                            href={getYouTubeSearchUrl(query)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center w-full justify-start px-4 py-3 border border-white/20 bg-[#090607] hover:bg-[#c26e73]/10 hover:border-[#c26e73] rounded-lg transition-all hover:scale-[1.02] shadow-sm hover:shadow-md"
                          >
                            <Video className="w-5 h-5 mr-3 flex-shrink-0 text-[#c26e73]" />
                            <span className="text-base font-medium text-white">{query}</span>
                          </a>
                        ))}
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="border border-white/10 bg-[#221f20] shadow-lg rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-[#ac1ed6]/5 to-transparent">
                          <CardTitle className="flex items-center gap-2 text-white">
                            <Target className="w-5 h-5 text-[#ac1ed6]" />
                            Key Subtopics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <ul className="space-y-3">
                            {resources.subtopics.map((subtopic, idx) => (
                              <li key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <span className="text-[#ac1ed6] text-xl font-bold">•</span>
                                <span className="text-base text-white/80">{subtopic}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border border-white/10 bg-[#221f20] shadow-lg rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-[#c26e73]/5 to-transparent">
                          <CardTitle className="flex items-center gap-2 text-white">
                            <Lightbulb className="w-5 h-5 text-[#c26e73]" />
                            Study Tips
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <ul className="space-y-3">
                            {resources.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <span className="text-[#c26e73] text-xl font-bold">•</span>
                                <span className="text-base text-white/80">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border border-white/10 bg-[#221f20] shadow-lg rounded-2xl">
                      <CardHeader className="bg-gradient-to-r from-[#ac1ed6]/5 to-transparent">
                        <CardTitle className="flex items-center gap-2 text-xl text-white">
                          <Brain className="w-6 h-6 text-[#ac1ed6]" />
                          Key Points to Remember
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-4">
                          {resources.keyPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                              <span className="text-white font-bold text-lg bg-[#ac1ed6]/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-base pt-1 text-white/80">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="border border-dashed border-white/20 bg-[#221f20] rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <BookOpen className="w-20 h-20 text-white/30 mb-4" />
                      <p className="text-lg text-white/60 text-center mb-4">
                        No study materials have been loaded yet.
                        <br />Set your preferences and click 'Get Study Materials' to begin
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="flashcards" className="space-y-6 mt-6">
                {flashcards.length === 0 ? (
                  <Card className="border border-dashed border-white/20 bg-[#221f20] rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Brain className="w-20 h-20 text-white/30 mb-4" />
                      <p className="text-lg text-white/60 text-center mb-4">
                        No flashcards available yet.
                        <br />Set your preferences and click "Generate Flashcards" to get started!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Card className="border-2 border-white/10 bg-gradient-to-br from-[#ac1ed6]/10 to-transparent shadow-lg rounded-2xl">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-white/60 font-medium">Due Today</p>
                                <p className="text-3xl font-bold text-[#ac1ed6]">{upcomingReviews.today}</p>
                              </div>
                              <Target className="w-10 h-10 text-[#ac1ed6] opacity-50" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Card className="border-2 border-white/10 bg-gradient-to-br from-[#c26e73]/10 to-transparent shadow-lg rounded-2xl">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-white/60 font-medium">Total Cards</p>
                                <p className="text-3xl font-bold text-[#c26e73]">{flashcards.length}</p>
                              </div>
                              <Brain className="w-10 h-10 text-[#c26e73] opacity-50" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Card className="border-2 border-white/10 bg-gradient-to-br from-[#ac1ed6]/10 to-transparent shadow-lg rounded-2xl">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-white/60 font-medium">This Week</p>
                                <p className="text-3xl font-bold text-[#ac1ed6]">{upcomingReviews.thisWeek}</p>
                              </div>
                              <Lightbulb className="w-10 h-10 text-[#ac1ed6] opacity-50" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Flashcard Viewer */}
                    <Card className="border-2 border-white/10 bg-[#221f20] shadow-lg rounded-2xl">
                      <CardHeader className="bg-gradient-to-r from-[#ac1ed6]/5 to-[#c26e73]/5">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-2xl text-white">
                            <Brain className="w-6 h-6 text-[#ac1ed6]" />
                            Study Session
                          </CardTitle>
                          <Button
                            onClick={generateFlashcards}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Generate New
                          </Button>
                        </div>
                        <CardDescription className="text-white/60">
                          Review {dueCards.length > 0 ? dueCards.length : flashcards.length} cards using spaced repetition for better retention
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <FlashcardViewer
                          cards={dueCards.length > 0 ? dueCards : flashcards}
                          onRate={handleFlashcardRate}
                          onDelete={handleDeleteFlashcard}
                        />
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Daily Limit Reached
            </DialogTitle>
            <DialogDescription>
              You've used your free daily generation. Enter the password to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordInput('');
                  setPendingAction(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handlePasswordSubmit}>
                Unlock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BeautifulFooter />
    </Layout>
  );
};

export default AILearning;
