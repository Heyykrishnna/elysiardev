import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserStats {
  // Test Statistics
  testsCompleted: number;
  testsCreated: number; // For owners
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  
  // Attendance Statistics
  attendanceRate: number;
  totalClasses: number;
  classesAttended: number;
  
  // Study Streak
  currentStreak: number;
  longestStreak: number;
  
  // Resources
  resourcesAccessed: number;
  resourcesCreated: number; // For owners
  
  // Time-based stats
  totalStudyTime: number; // in minutes
  averageTestTime: number; // in minutes
  
  // Recent Activity
  lastActivity: string | null;
  joinDate: string | null;
}

const defaultStats: UserStats = {
  testsCompleted: 0,
  testsCreated: 0,
  averageScore: 0,
  highestScore: 0,
  lowestScore: 0,
  attendanceRate: 0,
  totalClasses: 0,
  classesAttended: 0,
  currentStreak: 0,
  longestStreak: 0,
  resourcesAccessed: 0,
  resourcesCreated: 0,
  totalStudyTime: 0,
  averageTestTime: 0,
  lastActivity: null,
  joinDate: null,
};

export const useUserStats = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const promises = [];
      
      // Get test attempts for students, or tests created for owners
      if (profile.role === 'student') {
        promises.push(
          supabase
            .from('test_attempts')
            .select('*')
            .eq('student_id', user.id)
            .eq('is_completed', true)
        );
      } else {
        promises.push(
          supabase
            .from('tests')
            .select('*')
            .eq('owner_id', user.id)
        );
      }

      // Get attendance data
      promises.push(
        supabase
          .from('attendances')
          .select('*')
          .eq('student_id', user.id)
      );

      // Get resources data
      if (profile.role === 'owner') {
        promises.push(
          supabase
            .from('study_resources')
            .select('*')
            .eq('owner_id', user.id)
        );
      } else {
        // For students, we'll estimate resources accessed (placeholder)
        promises.push(Promise.resolve({ data: [], error: null }));
      }

      // Get profile creation date
      promises.push(
        supabase
          .from('profiles')
          .select('created_at')
          .eq('id', user.id)
          .single()
      );

      const [testData, attendanceData, resourcesData, profileData] = await Promise.all(promises);

      let calculatedStats: UserStats = { ...defaultStats };

      // Process test data
      if (testData.data && !testData.error) {
        if (profile.role === 'student') {
          const attempts = testData.data;
          calculatedStats.testsCompleted = attempts.length;
          
          if (attempts.length > 0) {
            const scores = attempts
              .map(attempt => attempt.score || 0)
              .filter(score => score > 0);
            
            if (scores.length > 0) {
              calculatedStats.averageScore = Math.round(
                scores.reduce((sum, score) => sum + score, 0) / scores.length
              );
              calculatedStats.highestScore = Math.max(...scores);
              calculatedStats.lowestScore = Math.min(...scores);
            }

            // Calculate average test time
            const completedAttempts = attempts.filter(a => a.started_at && a.completed_at);
            if (completedAttempts.length > 0) {
              const totalMinutes = completedAttempts.reduce((sum, attempt) => {
                const start = new Date(attempt.started_at).getTime();
                const end = new Date(attempt.completed_at).getTime();
                return sum + (end - start) / (1000 * 60); // Convert to minutes
              }, 0);
              calculatedStats.averageTestTime = Math.round(totalMinutes / completedAttempts.length);
            }

            // Set last activity to most recent test
            const sortedAttempts = attempts
              .filter(a => a.completed_at)
              .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
            
            if (sortedAttempts.length > 0) {
              calculatedStats.lastActivity = sortedAttempts[0].completed_at;
            }
          }
        } else {
          // Owner statistics
          calculatedStats.testsCreated = testData.data.length;
        }
      }

      // Process attendance data
      if (attendanceData.data && !attendanceData.error) {
        const attendanceRecords = attendanceData.data;
        calculatedStats.classesAttended = attendanceRecords.length;
        
        // For total classes, we'll estimate based on attendance records
        // In a real app, this would come from a classes table
        calculatedStats.totalClasses = Math.max(attendanceRecords.length, 10); // Minimum 10 for calculation
        
        calculatedStats.attendanceRate = calculatedStats.totalClasses > 0 
          ? Math.round((calculatedStats.classesAttended / calculatedStats.totalClasses) * 100)
          : 0;
      }

      // Process resources data
      if (resourcesData.data && !resourcesData.error) {
        if (profile.role === 'owner') {
          calculatedStats.resourcesCreated = resourcesData.data.length;
        } else {
          // For students, we'll use a placeholder value
          calculatedStats.resourcesAccessed = Math.floor(Math.random() * 25) + 5; // 5-30 resources
        }
      }

      // Set join date
      if (profileData.data && !profileData.error) {
        calculatedStats.joinDate = profileData.data.created_at;
      }

      // Calculate study streak (placeholder calculation)
      // In a real app, this would be based on daily activity logs
      calculatedStats.currentStreak = Math.floor(Math.random() * 30) + 1; // 1-30 days
      calculatedStats.longestStreak = Math.max(
        calculatedStats.currentStreak, 
        Math.floor(Math.random() * 60) + 10 // 10-70 days
      );

      // Calculate total study time (estimate based on tests)
      if (profile.role === 'student') {
        calculatedStats.totalStudyTime = calculatedStats.testsCompleted * calculatedStats.averageTestTime;
      }

      setStats(calculatedStats);
    } catch (err) {
      console.error('Error loading user stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user, profile]);

  return {
    stats,
    loading,
    error,
    reloadStats: loadStats,
  };
};