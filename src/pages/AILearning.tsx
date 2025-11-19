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
      <div className='bg-black'>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-9xl mx-auto space-y-8">
          <div className="mb-4">
            <BackToDashboard />
          </div>
          
          {/* Enhanced Header with Gradient */}
          <div className="text-center space-y-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 rounded-3xl blur-3xl -z-10" />
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-5xl md:text-6xl uppercase font-bold bg-gradient-to-r from-purple-200 via-purple-600 to-purple-400 bg-clip-text text-transparent">
                IntelliLearn Hub
              </h1>
            </div>
            <p className="text-lg text-white/75 max-w-2xl mx-auto uppercase">
              Create personalized tests and access complete AI-powered study materials
            </p>
          </div>

          {/* Enhanced Configuration Card */}
          <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="w-6 h-6 text-primary" />
                Shape Your Knowledge Path
              </CardTitle>
              <CardDescription className="text-base">
                Tell us what you want to learn, and we'll create personalized content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-base font-semibold">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Photosynthesis, Quadratic Equations"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-base font-semibold">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Biology, Mathematics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-base font-semibold">Grade/Level</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="h-11 border-2">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elementary">Elementary (Grades 1-5)</SelectItem>
                      <SelectItem value="middle">Middle School (Grades 6-8)</SelectItem>
                      <SelectItem value="high">High School (Grades 9-12)</SelectItem>
                      <SelectItem value="college">College/University</SelectItem>
                      <SelectItem value="advanced">Graduate/Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testSize" className="text-base font-semibold">Test Size</Label>
                  <Select value={testSize} onValueChange={setTestSize}>
                    <SelectTrigger className="h-11 border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="difficulty" className="text-base font-semibold">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="h-11 border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  className="h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileText className="w-5 h-5 mr-2" />}
                  Generate Test
                </Button>
                <Button 
                  onClick={getResources} 
                  disabled={loading}
                  className="h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <BookOpen className="w-5 h-5 mr-2" />}
                  Get Resources
                </Button>
                <Button 
                  onClick={generateFlashcards} 
                  disabled={loading}
                  className="h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Brain className="w-5 h-5 mr-2" />}
                  Create Flashcards
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Tabs */}
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 p-1 bg-muted/40">
              <TabsTrigger value="test" className="text-white/80 font-semibold data-[state=active]:shadow-md">
                <FileText className="w-4 h-4 mr-2" />
                Test
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-white/80 font-semibold data-[state=active]:shadow-md">
                <BookOpen className="w-4 h-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="text-white/80 font-semibold data-[state=active]:shadow-md">
                <Brain className="w-4 h-4 mr-2" />
                Flashcards
              </TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-4 mt-6">
              {generatedTest.length > 0 ? (
                <>
                  {showResults && (
                    <Card className="border-2 border-primary shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Award className="w-10 h-10 text-primary" />
                            <div>
                              <h3 className="text-2xl font-bold">Your Score</h3>
                              <p className="text-muted-foreground">Test Results</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-bold text-primary">
                              {calculateScore().correct}/{calculateScore().total}
                            </div>
                            <div className="text-xl text-muted-foreground">
                              {calculateScore().percentage}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {generatedTest.map((q, idx) => (
                    <Card key={idx} className="border-2 hover:border-primary/50 transition-colors duration-300 shadow-md hover:shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-bold">
                            Question {idx + 1}
                          </CardTitle>
                          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">{q.points} points</span>
                          </div>
                        </div>
                        <CardDescription className="text-base mt-2">{q.question}</CardDescription>
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
                            className="h-12 border-2"
                          />
                        )}

                        {showResults && (
                          <div className={`p-4 rounded-xl border-2 ${
                            userAnswers[idx]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
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
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <FileText className="w-20 h-20 text-muted-foreground/50 mb-4" />
                    <p className="text-lg text-muted-foreground text-center mb-4">
                    You haven’t generated any tests yet. 
                    <br/>Customize your preferences and hit 'Generate Test' to get started.                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="resources" className="space-y-6 mt-6">
              {resources ? (
                <>
                  <Card className="border-2 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        Study Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="whitespace-pre-wrap text-base leading-relaxed">{resources.notes}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-red-500/5 to-transparent">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Video className="w-6 h-6 text-red-600" />
                        Video Resources
                      </CardTitle>
                      <CardDescription>Click to search on YouTube</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {resources.videoSearchQueries.map((query, idx) => (
                        <a
                          key={idx}
                          href={getYouTubeSearchUrl(query)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center w-full justify-start px-4 py-3 border-2 bg-background hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 rounded-lg transition-all hover:scale-[1.02] shadow-sm hover:shadow-md"
                        >
                          <Video className="w-5 h-5 mr-3 flex-shrink-0 text-red-600" />
                          <span className="text-base font-medium">{query}</span>
                        </a>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-2 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          Key Subtopics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-3">
                          {resources.subtopics.map((subtopic, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <span className="text-primary text-xl font-bold">•</span>
                              <span className="text-base">{subtopic}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-2 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-amber-500/5 to-transparent">
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-amber-600" />
                          Study Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-3">
                          {resources.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <span className="text-primary text-xl font-bold">•</span>
                              <span className="text-base">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-2 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Brain className="w-6 h-6 text-green-600" />
                        Key Points to Remember
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-4">
                        {resources.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <span className="text-primary font-bold text-lg bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-base pt-1">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <BookOpen className="w-20 h-20 text-muted-foreground/50 mb-4" />
                    <p className="text-lg text-muted-foreground text-center mb-4">
                      No study materials have been loaded yet. 
                      <br/>Set your preferences and click 'Get Study Materials' to begin
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="flashcards" className="space-y-6 mt-6">
              {flashcards.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Brain className="w-20 h-20 text-muted-foreground/50 mb-4" />
                    <p className="text-lg text-muted-foreground text-center mb-4">
                    No flashcards available yet.
                    <br/>Set your preferences and click “Generate Flashcards” to get started!
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
                      <Card className="border-2 shadow-lg bg-gradient-to-br from-blue-500/10 to-transparent">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground font-medium">Due Today</p>
                              <p className="text-3xl font-bold text-blue-600">{upcomingReviews.today}</p>
                            </div>
                            <Target className="w-10 h-10 text-blue-600 opacity-50" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="border-2 shadow-lg bg-gradient-to-br from-green-500/10 to-transparent">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground font-medium">Total Cards</p>
                              <p className="text-3xl font-bold text-green-600">{flashcards.length}</p>
                            </div>
                            <Brain className="w-10 h-10 text-green-600 opacity-50" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="border-2 shadow-lg bg-gradient-to-br from-purple-500/10 to-transparent">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground font-medium">This Week</p>
                              <p className="text-3xl font-bold text-purple-600">{upcomingReviews.thisWeek}</p>
                            </div>
                            <Lightbulb className="w-10 h-10 text-purple-600 opacity-50" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Flashcard Viewer */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Brain className="w-6 h-6 text-primary" />
                          Study Session
                        </CardTitle>
                        <Button 
                          onClick={generateFlashcards} 
                          disabled={loading}
                          variant="outline"
                          size="sm"
                        >
                          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                          Generate New
                        </Button>
                      </div>
                      <CardDescription>
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