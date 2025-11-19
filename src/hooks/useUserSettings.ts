import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserSettings {
  // Notifications
  email_notifications: boolean;
  push_notifications: boolean;
  test_reminders: boolean;
  result_alerts: boolean;
  weekly_digest: boolean;
  
  // Privacy & Security
  profile_visibility: 'public' | 'private';
  share_progress: boolean;
  analytics_opt_in: boolean;
  data_collection: boolean;
  
  // Appearance
  theme: 'light' | 'dark' | 'system';
  reduced_motion: boolean;
  high_contrast: boolean;
  font_size: 'small' | 'medium' | 'large';
  
  // Language & Region
  language: string;
  date_format: string;
  time_format: '12h' | '24h';
  timezone: string;
}

const defaultSettings: UserSettings = {
  // Notifications
  email_notifications: true,
  push_notifications: true,
  test_reminders: true,
  result_alerts: false,
  weekly_digest: true,
  
  // Privacy & Security
  profile_visibility: 'public',
  share_progress: true,
  analytics_opt_in: false,
  data_collection: true,
  
  // Appearance
  theme: 'system',
  reduced_motion: false,
  high_contrast: false,
  font_size: 'medium',
  
  // Language & Region
  language: 'en',
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const STORAGE_KEY = 'quiz_oasis_user_settings';

export const useUserSettings = () => {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update a specific setting
  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!user) {
      toast.error('You must be signed in to update settings');
      return;
    }

    setUpdating(true);
    
    try {
      const newSettings = { ...settings, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      toast.success('Setting saved successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to save setting');
    } finally {
      setUpdating(false);
    }
  };

  // Update multiple settings at once
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    if (!user) {
      toast.error('You must be signed in to update settings');
      return;
    }

    setUpdating(true);
    
    try {
      const mergedSettings = { ...settings, ...newSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSettings));
      setSettings(mergedSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setUpdating(false);
    }
  };

  // Reset to default settings
  const resetSettings = () => {
    if (!user) {
      toast.error('You must be signed in to reset settings');
      return;
    }

    setUpdating(true);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
      setSettings(defaultSettings);
      toast.success('Settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Failed to reset settings');
    } finally {
      setUpdating(false);
    }
  };

  // Export settings
  const exportSettings = () => {
    try {
      const exportData = {
        user_id: user?.id,
        profile: {
          email: profile?.email,
          full_name: profile?.full_name,
          role: profile?.role,
        },
        settings,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz-oasis-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Settings exported successfully');
    } catch (error) {
      console.error('Error exporting settings:', error);
      toast.error('Failed to export settings');
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  return {
    settings,
    loading,
    updating,
    updateSetting,
    updateSettings,
    resetSettings,
    exportSettings,
    reloadSettings: loadSettings,
  };
};
