import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Plus, BookOpen, FileText, Users, Award, TrendingUp, Clock, Star, Target, Zap, Sparkles, Brain, Coffee, Lightbulb, Rocket, Heart, Globe, Calendar, CheckCircle, BarChart3, Library, MessageCircle, Atom, Settings, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOwnerStats } from '@/hooks/useOwnerStats';
import { useStudentStats } from '@/hooks/useStudentStats';
import FloatingDockDemo from '@/components/FloatingDockDemo';
import { motion } from 'framer-motion';
import { Cover } from '@/components/ui/cover';
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import ExpandableCards from '../smoothui/ui/ExpandableCards';
import { FaqsGrid } from '../smoothui/ui/faqsgrid';
import { TestimonialsSimple } from '../smoothui/ui/simpletestimonials';
import { BeautifulFooter } from "@/components/BeautifulFooter";
import { AppleCardsCarouselDemo } from '@/components/applecards';
import NotificationManager from '../NotificationManager';
import { ContainerTextFlipDemo } from '../dashtext';
import NotificationBell from '../NotificationBell';


const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const { data: ownerStats, isLoading: ownerStatsLoading } = useOwnerStats();
  const { data: studentStats, isLoading: studentStatsLoading } = useStudentStats();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const words = `The future of education is about breaking traditional boundaries and creating a next-generation ecosystem where learning is continuous, personalized, and globally connected. With AI at its core, education evolves into an adaptive journey that understands individual strengths, offers real-time feedback, and prepares learners with skills for the industries of tomorrow. From immersive virtual classrooms and gamified learning to blockchain-powered credentials and collaborative platforms that connect students worldwide, the integration of cutting-edge technology ensures that education is no longer limited to what we know today, but is reimagined to prepare every learner for a future that is still unfolding.`;
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const isOwner = profile?.role === 'owner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative overflow-x-hidden">
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative overflow-x-hidden">
          {/* Interactive background elements */}
          <div 
            className="fixed inset-0 pointer-events-none z-0" 
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.03), transparent 40%)`
            }} 
          />
          
          {/* Animated background orbs */}
          <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-float" />
          <div className="fixed top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="fixed top-1/2 left-3/4 w-64 h-64 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-full blur-3xl animate-bounce-subtle" />
          
          <header className="fixed top-0 left-0 w-full bg-background/40 backdrop-blur-[6px] border-b border-border z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <div
                    className="flex items-center space-x-3 group cursor-pointer"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <div className="relative">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center duration-300">
                        <img src="logo-Elysiar.jpeg" className="rounded-lg"/>
                        </div>
                      <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 blur-md"></div>
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-xl font-bold text-foreground tracking-tight transition-all duration-300 group-hover:text-primary group-hover:scale-105 origin-left">
                        Elysiar
                      </h1>
                      <p className="text-xs text-muted-foreground font-medium transition-all duration-300 group-hover:text-primary/70">
                        Where Knowledge Flows
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm text-foreground font-semibold">
                        Welcome back
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.full_name || profile?.email}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold">
                      {isOwner ? "Educator" : "Student"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Notification Bell - rightmost position for students */}
                    {!isOwner && (
                      <NotificationBell size="sm" />
                    )}
                    <Button
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSignOut} 
                      className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center">

            <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium mb-8 text-foreground leading-tight">
                  <span className='uppercase text-4xl font-light'>  
                    Transform Your
                  </span>
                  <br />
                  <Cover className="font-bold from-primary via-accent to-primary text-black">
                    Learning Experience
                  </Cover>
                </h1>
              </motion.div>

              <motion.p 
                className="text-sm sm:text-xl md:text-xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Experience a next-generation learning ecosystem where knowledge seamlessly integrates with technology. 
                Our platform equips educators and students with advanced tools, 
                <br/>smart personalized assessments, and dynamic collaborative spaces 
                to elevate teaching <br/> and learning to a whole new level.
              </motion.p>

              {/* Stats section */}
              <motion.div 
                className="border-t border-border pt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <p className="text-sm text-muted-foreground mb-8 font-light tracking-wide uppercase">
                  Trusted by thousands of learners worldwide
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
                  <div className="text-center">
                    <div className="text-3xl font-light text-foreground mb-2">50K+</div>
                    <div className="text-sm text-muted-foreground">Active Learners</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-light text-foreground mb-2">4.9★</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-light text-foreground mb-2">98%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <main className="relative z-10">
            {/* Enhanced Learning Dashboard Section */}
            <section className="min-h-screen relative overflow-hidden py-15">
              {/* Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl" />
              </div>

              <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
                {/* Section Header */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                  className="text-center mb-20"
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="inline-block mb-6"
                  >
                  </motion.div>
                  
                  <div className="flex justify-center">
                    <ContainerTextFlipDemo />
                  </div>

                  <br/>
                  <br/>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light"
                  >
                    Experience the future of education with our intelligently designed tools that adapt to your learning style and accelerate your growth.
                  </motion.p>
                </motion.div>

                {/* Enhanced Dashboard Grid */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20"
                >
              {isOwner ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/create-test" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
                        {/* Subtle gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/30" />
                        
                        {/* Floating icon */}
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-emerald-500/15">
                            <Plus className="w-7 h-7 text-emerald-600" />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100/60 rounded-full mb-4">
                              EDUCATOR TOOLS
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                              Create Assessment
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Design comprehensive tests and quizzes with advanced analytics and AI-powered insights.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-emerald-600 text-sm font-medium mt-4">
                            <span>Get started</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/tests" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-500/15">
                            <FileText className="w-7 h-7 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100/60 rounded-full mb-4">
                              TEST MANAGEMENT
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                              Test Library
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Manage your comprehensive test collection with detailed analytics and performance insights.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-blue-600 text-sm font-medium mt-4">
                            <span>View library</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/study-resources" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-rose-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-purple-500/15">
                            <Library className="w-7 h-7 text-purple-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100/60 rounded-full mb-4">
                              CONTENT CURATION
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                              Learning Resources
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Curate comprehensive learning materials and educational content for your students.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-purple-600 text-sm font-medium mt-4">
                            <span>Manage content</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.3, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/library" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-amber-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-amber-500/15">
                            <Book className="w-7 h-7 text-amber-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100/60 rounded-full mb-4">
                              LIBRARY MANAGEMENT
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                              Library System
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Manage books, track issues, and monitor student borrowing with comprehensive library tools.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-amber-600 text-sm font-medium mt-4">
                            <span>Manage library</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/attendance-management" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-green-500/15">
                            <Users className="w-7 h-7 text-green-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100/60 rounded-full mb-4">
                              ATTENDANCE TRACKING
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                              Track Attendance
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Monitor student presence with advanced tracking and automated reporting systems.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-green-600 text-sm font-medium mt-4">
                            <span>View attendance</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.6, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/modern-calendar" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-indigo-500/15">
                            <Calendar className="w-7 h-7 text-indigo-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100/60 rounded-full mb-4">
                              EVENT MANAGEMENT
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                              Calendar & Events
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Organize and manage educational events, schedules, and important academic dates.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-indigo-600 text-sm font-medium mt-4">
                            <span>Open calendar</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.6, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/complaints" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-red-100 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-blue-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-red-500/15">
                            <Heart className="w-7 h-7 text-red-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-red-700 bg-red-100/60 rounded-full mb-4">
                              COMPLAINTS
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                              Resolution Hub
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                            Efficiently review, track, and resolve student concerns, Maintain trust with a transparent and responsive system.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-red-600 text-sm font-medium mt-4">
                            <span>Manage Complaints</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </>
              ) : (
                // Student cards would go here with similar minimalist design
                <>

<motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/student-portal" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/60 to-cyan-200/40" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-cyan-600/20">
                            <BookOpen className="w-7 h-7 text-cyan-700" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block uppercase px-3 py-1 text-xs font-medium text-cyan-800 bg-cyan-200/60 rounded-full mb-4">
                              Portal
                            </div>
                            <h3 className="text-2xl font-light text-cyan-900 mb-2 tracking-tight">
                            Student Portal
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                            Effortlessly manage your classes, monitor attendance in real time, and stay on top of your academic progress with clear, organized insights.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-cyan-700 text-sm font-medium mt-4">
                            <span>View Progress</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="ai-learning" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 to-pink-200/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-pink-500/15">
                            <Atom className="w-7 h-7 text-pink-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block uppercase px-3 py-1 text-xs font-medium text-pink-700 bg-pink-100/60 rounded-full mb-4">
                              AI Learning Hub
                            </div>
                            <h3 className="text-2xl font-light text-pink-900 mb-2 tracking-tight">
                              IntelliLearn Hub
                            </h3>
                            <p className="text-sm text-black leading-relaxed">
                              Instantly access all your AI tests, study materials, and notes, your intelligent hub for effortless learning.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-pink-600 text-sm font-medium mt-4">
                            <span>Explore AI</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/attendance" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-green-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-green-500/15">
                            <Brain className="w-7 h-7 text-green-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100/60 rounded-full mb-4">
                              MARK ATTENDANCE
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                              Mark Attendance
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                            Mark your attendance effortlessly and stay on track. The fastest and most seamless way to record your presence
                            </p>
                          </div>
                          
                          <div className="flex items-center text-green-600 text-sm font-medium mt-4">
                            <span>Mark</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/tests" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-500/15">
                            <FileText className="w-7 h-7 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100/60 rounded-full mb-4">
                              INTERACTIVE LEARNING
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                              Take Tests
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Engage with dynamic assessments designed to challenge and enhance your knowledge.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-blue-600 text-sm font-medium mt-4">
                            <span>Start learning</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/results" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-pink-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-orange-500/15">
                            <TrendingUp className="w-7 h-7 text-orange-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100/60 rounded-full mb-4">
                              PROGRESS TRACKING
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                              View Progress
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Track your learning journey with detailed analytics and performance insights.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-orange-600 text-sm font-medium mt-4">
                            <span>View analytics</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/study-resources" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-rose-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-rose-500/15">
                            <Library className="w-7 h-7 text-rose-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-rose-700 bg-rose-100/60 rounded-full mb-4">
                              STUDY MATERIALS
                            </div>
                            <h3 className="text-2xl font-light text-rose-900 mb-2 tracking-tight">
                              Study Resources
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Access curated educational content and materials tailored to your learning needs.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-rose-600 text-sm font-medium mt-4">
                            <span>Browse resources</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.3, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/my-library" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-teal-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-teal-500/15">
                            <Book className="w-7 h-7 text-teal-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-teal-700 bg-teal-100/60 rounded-full mb-4">
                              MY LIBRARY
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                              My Borrowed Books
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Track your borrowed books, due dates, and reading history in one convenient place.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-teal-600 text-sm font-medium mt-4">
                            <span>View my books</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/modern-calendar" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-yellow-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-yellow-500/15">
                            <Lightbulb className="w-7 h-7 text-yellow-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100/60 rounded-full mb-4">
                              CALENDAR
                            </div>
                            <h3 className="text-2xl font-light text-yellow-900 mb-2 tracking-tight">
                              Calendar and Events
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                            Track every class, meet, and milestone with ease, Your smart planner for all academic events.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-yellow-600 text-sm font-medium mt-4">
                            <span>Explore Settings</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/complaints" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-red-50/30" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-red-500/15">
                            <MessageCircle className="w-7 h-7 text-red-600" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block px-3 py-1 text-xs font-medium text-red-700 bg-red-100/60 rounded-full mb-4">
                              MARK COMPLAINT
                            </div>
                            <h3 className="text-2xl font-light text-red-900 mb-2 tracking-tight">
                              Submit Complaint
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                            Raise your concerns safely and instantly, Your voice matters — we’re here to listen and act.
                            </p>
                          </div>
                          
                          <div className="flex items-center text-red-600 text-sm font-medium mt-4">
                            <span>Submit Complaint</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to="/settings" className="block group">
                      <div className="relative h-[280px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden transition-all duration-700 hover:bg-white/90 hover:border-black/10 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/60 to-violet-200/40" />
                        
                        <div className="absolute top-8 right-8">
                          <div className="w-14 h-14 rounded-2xl bg-violet-600/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-violet-600/20">
                            <Settings className="w-7 h-7 text-violet-700" />
                          </div>
                        </div>
                        
                        <div className="relative p-8 h-full flex flex-col justify-between">
                          <div>
                            <div className="inline-block uppercase px-3 py-1 text-xs font-medium text-violet-800 bg-violet-200/60 rounded-full mb-4">
                              Configuration
                            </div>
                            <h3 className="text-2xl font-light text-violet-900 mb-2 tracking-tight">
                            App Configuration
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                            Adjust every feature, preference, and option effortlessly, your smart control center for all settings
                            </p>
                          </div>
                          
                          <div className="flex items-center text-violet-700 text-sm font-medium mt-4">
                            <span>Submit Complaint</span>
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                </>
              )}
                </motion.div>
              </div>
            </section>
          </main>

          {isOwner && <NotificationManager />}

          {!isOwner && (
            <> 
              <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 relative z-10 text-center mb-8">
                  <AppleCardsCarouselDemo />
                  <div className="text-center mb-16">
                      <h5 className="text-3xl md:text-4xl font-light text-foreground mb-4">
                        Our Web Network
                      </h5>
                    </div>
                  <ExpandableCards />
                </section>


                <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 mb-8">
                  <TextGenerateEffect words={words} />
                </div>

                <TestimonialsSimple />

                </>
              
              )
              }
                
                <FaqsGrid />

                <BeautifulFooter />


          {/* Floating Dock Navigation */}
          {!isOwner && <FloatingDockDemo />}
        </div>
      </div>
  );
};
export default Dashboard;
