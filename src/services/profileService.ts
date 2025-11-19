import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProfileUpdateData {
  full_name?: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

class ProfileService {
  // Update user profile
  async updateProfile(userId: string, data: ProfileUpdateData) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }
  }

  // Update user email (requires re-authentication)
  async updateEmail(newEmail: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating email:', error);
      return { success: false, error };
    }
  }

  // Update user password
  async updatePassword(data: PasswordUpdateData) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error };
    }
  }

  // Upload and update avatar
  async updateAvatar(userId: string, file: File) {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { success: true, error: null, avatarUrl: publicUrl };
    } catch (error) {
      console.error('Error updating avatar:', error);
      return { success: false, error, avatarUrl: null };
    }
  }

  // Delete user account
  async deleteAccount(userId: string) {
    try {
      // This would typically involve multiple steps:
      // 1. Delete related data (tests, attempts, etc.)
      // 2. Delete profile
      // 3. Delete auth user
      
      // For now, we'll just show a placeholder implementation
      // In a real app, this should be handled server-side
      
      toast.error('Account deletion is not available in demo mode');
      return { success: false, error: 'Feature not available in demo' };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, error };
    }
  }

  // Export user data (GDPR compliance)
  async exportUserData(userId: string) {
    try {
      const promises = [
        // Get profile data
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        
        // Get test attempts
        supabase
          .from('test_attempts')
          .select('*')
          .eq('student_id', userId),
        
        // Get attendance records
        supabase
          .from('attendances')
          .select('*')
          .eq('student_id', userId),
        
        // Get complaints
        supabase
          .from('complaints')
          .select('*')
          .eq('student_id', userId),
        
        // Get resource requests
        supabase
          .from('resource_requests')
          .select('*')
          .eq('student_id', userId),
      ];

      const [profileData, attemptsData, attendanceData, complaintsData, requestsData] = 
        await Promise.all(promises);

      const exportData = {
        profile: profileData.data,
        test_attempts: attemptsData.data || [],
        attendance: attendanceData.data || [],
        complaints: complaintsData.data || [],
        resource_requests: requestsData.data || [],
        exported_at: new Date().toISOString(),
        export_version: '1.0',
      };

      return { success: true, data: exportData, error: null };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return { success: false, data: null, error };
    }
  }

  // Clear user cache/temporary data
  async clearCache(userId: string) {
    try {
      // In a real app, this would clear various caches
      // For now, we'll just show a success message
      return { success: true, error: null };
    } catch (error) {
      console.error('Error clearing cache:', error);
      return { success: false, error };
    }
  }

  // Get user activity log
  async getActivityLog(userId: string, limit = 50) {
    try {
      // This would typically come from an audit log table
      // For now, we'll create mock data based on existing records
      
      const [attemptsData, attendanceData] = await Promise.all([
        supabase
          .from('test_attempts')
          .select('*, tests(title)')
          .eq('student_id', userId)
          .order('started_at', { ascending: false })
          .limit(limit),
        
        supabase
          .from('attendances')
          .select('*')
          .eq('student_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
      ]);

      const activities = [];

      // Add test attempts
      if (attemptsData.data) {
        activities.push(...attemptsData.data.map(attempt => ({
          id: attempt.id,
          type: 'test_attempt',
          title: `Completed test: ${attempt.tests?.title || 'Unknown Test'}`,
          description: `Score: ${attempt.score || 0}%`,
          timestamp: attempt.completed_at || attempt.started_at,
          metadata: {
            testId: attempt.test_id,
            score: attempt.score,
            isCompleted: attempt.is_completed,
          }
        })));
      }

      // Add attendance records
      if (attendanceData.data) {
        activities.push(...attendanceData.data.map(attendance => ({
          id: attendance.id,
          type: 'attendance',
          title: 'Marked attendance',
          description: `Distance: ${attendance.distance_meters}m from location`,
          timestamp: attendance.created_at,
          metadata: {
            sessionId: attendance.session_id,
            distance: attendance.distance_meters,
          }
        })));
      }

      // Sort by timestamp
      activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return { success: true, data: activities.slice(0, limit), error: null };
    } catch (error) {
      console.error('Error getting activity log:', error);
      return { success: false, data: [], error };
    }
  }
}

export const profileService = new ProfileService();