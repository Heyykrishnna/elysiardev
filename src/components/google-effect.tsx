import { useScroll, useTransform } from "motion/react";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Users, TrendingUp, Brain, Library, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOwnerStats } from '@/hooks/useOwnerStats';
import { useStudentStats } from '@/hooks/useStudentStats';
import { motion } from 'framer-motion';
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";
import EnhancedFooter from "./EnhancedFooter";
import CalendarPage from "@/pages/CalendarPage";
import NotificationBell from "./NotificationBell";
import NotificationManager from "./NotificationManager";

export function GoogleGeminiEffectDemo() {
    const { profile, signOut } = useAuth();
    const { data: ownerStats, isLoading: ownerStatsLoading } = useOwnerStats();
    const { data: studentStats, isLoading: studentStatsLoading } = useStudentStats();

    const isOwner = profile?.role === 'owner';

  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

  return (
    <>
      <div
        className="h-[400vh] bg-black w-full [0.1] rounded-md relative pt-40 overflow-clip mx-w-full mx-auto"
        ref={ref}
      >
        <GoogleGeminiEffect
          pathLengths={[
            pathLengthFirst,
            pathLengthSecond,
            pathLengthThird,
            pathLengthFourth,
            pathLengthFifth,
          ]}
        />
      </div>
  
      <div>
        <main className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10 bg-black">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-4 text-white">
                  Your Learning Dashboard
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Access all your educational tools and track your progress in one beautifully designed interface.
                </p>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 max-w-7xl mx-auto">
              {isOwner ? (
                <>
                  <Link to="/create-test" className="block group">
                    <Card className="relative cursor-pointer border-0 bg-card/50 backdrop-blur-sm overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/80 to-green-600/80 opacity-90"></div>
                      <div className="absolute top-4 right-4 opacity-20">
                        <Plus className="h-20 w-20 text-white animate-float" />
                      </div>
                      <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="flex items-center text-white text-xl">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                            <Plus className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-semibold">Create Assessment</span>
                        </CardTitle>
                        <CardDescription className="text-emerald-100 mt-2">
                          Design comprehensive tests and quizzes with advanced analytics.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link to="/tests" className="block group">
                    <Card className="relative cursor-pointer border-0 bg-card/50 backdrop-blur-sm overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 to-indigo-600/80 opacity-90"></div>
                      <div className="absolute top-4 right-4 opacity-20">
                        <FileText className="h-20 w-20 text-white animate-bounce-subtle" />
                      </div>
                      <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="flex items-center text-white text-xl">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-semibold">Test Library</span>
                        </CardTitle>
                        <CardDescription className="text-blue-100 mt-2">
                          Manage your comprehensive test collection with analytics.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link to="/study-resources" className="block group">
                    <Card className="relative cursor-pointer border-0 bg-card/50 backdrop-blur-sm overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/80 to-pink-500/80 opacity-90"></div>
                      <div className="absolute top-4 right-4 opacity-20">
                        <Library className="h-20 w-20 text-white animate-float" />
                      </div>
                      <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="flex items-center text-white text-xl">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                            <Library className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-semibold">Learning Resources</span>
                        </CardTitle>
                        <CardDescription className="text-purple-100 mt-2">
                          Curate comprehensive learning materials and content.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/tests" className="block group">
                    <Card className="relative cursor-pointer border-0 bg-card/50 backdrop-blur-sm overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 to-cyan-400/80 opacity-90"></div>
                      <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="flex items-center text-white text-xl">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-semibold">Interactive Tests</span>
                        </CardTitle>
                        <CardDescription className="text-blue-100 mt-2">
                          Engage with dynamic assessments across multiple subjects.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link to="/study-resources" className="block group">
                    <Card className="relative cursor-pointer border-0 bg-card/50 backdrop-blur-sm overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/80 to-purple-500/80 opacity-90"></div>
                      <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="flex items-center text-white text-xl">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                            <Library className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-semibold">Study Materials</span>
                        </CardTitle>
                        <CardDescription className="text-indigo-100 mt-2">
                          Explore curated content tailored to your learning.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link to="/results" className="block group">
                    <Card className="relative cursor-pointer border-0 bg-card/50 backdrop-blur-sm overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/80 to-pink-500/80 opacity-90"></div>
                      <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="flex items-center text-white text-xl">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                            <TrendingUp className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-semibold">Progress Analytics</span>
                        </CardTitle>
                        <CardDescription className="text-orange-100 mt-2">
                          Monitor your learning journey with detailed insights.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link to="/attendance" className="block group">
                    <Card className="relative cursor-pointer border-0 bg-card/50 backdrop-blur-sm overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/80 to-green-500/80 opacity-90"></div>
                      <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="flex items-center text-white text-xl">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-semibold">Track Attendance</span>
                        </CardTitle>
                        <CardDescription className="text-white mt-2">
                          Monitor presence effortlessly and accurately
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link to="/complaints" className="block group">
                    <Card className="relative cursor-pointer border-0 bg-card/50 backdrop-blur-sm overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-400/80 to-red-500/80 opacity-90"></div>
                      <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="flex items-center text-white text-xl">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                            <Brain className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-semibold">Mark Complaint</span>
                        </CardTitle>
                        <CardDescription className="text-white mt-2">
                          Report issues instantly, safely, and confidently.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link to="/Timeline" className="block group">
                    <Card className="relative cursor-pointer border-0 bg-card/50 backdrop-blur-sm overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-400/80 to-gray-500/80 opacity-90"></div>
                      <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="flex items-center text-white text-xl">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                            <MessageCircle className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-semibold">Our Journey</span>
                        </CardTitle>
                        <CardDescription className="text-white mt-2">
                          Our Journey how we have transformed in past years.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </>
              )}
            </div>

            <div className="fixed bottom-5 right-5 z-50">
                <NotificationBell />
            </div>

            </main>

        <CalendarPage />

        <EnhancedFooter />
    </div>
  </>
);
}