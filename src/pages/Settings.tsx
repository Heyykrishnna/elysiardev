import React, { useState, useRef, useEffect } from 'react';
import '../styles/settings-animations.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  LogOut,
  ChevronRight,
  Check,
  X,
  Camera,
  Edit3,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  TrendingUp,
  Zap,
  Info,
  BookOpen,
  FileText,
  Clock,
  Loader2,
  AlertTriangle,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useUserStats } from '@/hooks/useUserStats';
import { useAttendanceAnalytics } from '@/hooks/useAttendanceAnalytics';
import { profileService } from '@/services/profileService';
import { TwoFactorSetup } from '@/components/TwoFactorSetup';
import { twoFactorService } from '@/services/twoFactorService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

type SettingsSection = 
  | 'overview' 
  | 'account' 
  | 'attendance'
  | 'notifications' 
  | 'privacy' 
  | 'appearance' 
  | 'language' 
  | 'data' 
  | 'about';

const Settings = () => {
  const navigate = useNavigate();
  const { profile, signOut, user } = useAuth();
  
  const { settings, loading: settingsLoading, updating, updateSetting, exportSettings } = useUserSettings();
  const { stats, loading: statsLoading } = useUserStats();
  const { analytics: attendanceAnalytics, isLoading: attendanceLoading } = useAttendanceAnalytics();
  
  // 2FA Status
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Load 2FA status on mount
  useEffect(() => {
    if (user) {
      const status = twoFactorService.getTwoFactorStatus(user.id);
      setTwoFactorEnabled(status.is_enabled);
    }
  }, [user]);

  const menuItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: User, 
      description: 'Profile and account summary'
    },
    { 
      id: 'account', 
      label: 'Account Details', 
      icon: Edit3, 
      description: 'Personal information and credentials'
    },
    { 
      id: 'attendance', 
      label: 'Attendance Analytics', 
      icon: BarChart3, 
      description: 'View your attendance performance'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      description: 'Manage your alerts and reminders'
    },
    { 
      id: 'privacy', 
      label: 'Privacy & Security', 
      icon: Shield, 
      description: 'Control your data and security'
    },
    { 
      id: 'appearance', 
      label: 'Appearance', 
      icon: Palette, 
      description: 'Customize your interface'
    },
    { 
      id: 'language', 
      label: 'Language & Region', 
      icon: Globe, 
      description: 'Language and localization'
    },
    { 
      id: 'data', 
      label: 'Data & Storage', 
      icon: Database, 
      description: 'Manage your data and exports'
    },
    { 
      id: 'about', 
      label: 'About', 
      icon: Info, 
      description: 'App information and support'
    }
  ];

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setAvatarUploading(true);
    try {
      const result = await profileService.updateAvatar(user.id, file);
      if (result.success) {
        toast.success('Avatar updated successfully');
        // Refresh the page or update local state
        window.location.reload();
      } else {
        toast.error('Failed to update avatar');
      }
    } catch (error) {
      toast.error('Failed to update avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const result = await profileService.updateProfile(user.id, {
        full_name: profileData.fullName,
      });

      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        // Optionally refresh profile data
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Handle password update
  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const result = await profileService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (result.success) {
        toast.success('Password updated successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordModal(false);
      } else {
        toast.error('Failed to update password');
      }
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  // Handle data export
  const handleDataExport = async () => {
    if (!user) return;

    try {
      const result = await profileService.exportUserData(user.id);
      if (result.success && result.data) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json',
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz-oasis-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Data exported successfully');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  // Handle cache clearing
  const handleClearCache = async () => {
    if (!user) return;

    try {
      await profileService.clearCache(user.id);
      toast.success('Cache cleared successfully');
      // Clear localStorage as well
      localStorage.clear();
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.'
    );

    if (!confirmed) return;

    try {
      // For now, we'll just show a toast - in a real app you'd call the backend
      toast.error('Account deletion is not available yet - contact support to delete your account');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  // Alias for the export function to match button handler
  const handleExportData = handleDataExport;

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Profile Card */}
      <Card className="p-8 border-0 bg-white/60 backdrop-blur-xl settings-card">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={'https://i.pinimg.com/1200x/b8/bf/1e/b8bf1eb5f3df07cc88a1248f47031194.jpg' + (profile?.email || 'default')} />
              <AvatarFallback className="text-2xl font-medium bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            <Button 
              size="sm" 
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white border shadow-lg hover:shadow-xl"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
            >
              {avatarUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                {profile?.full_name || 'User Name'}
              </h2>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {profile?.role === 'owner' ? 'Educator' : 'Student'}
              </Badge>
            </div>
            <p className="text-gray-600 mb-4">{profile?.email}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {stats.joinDate 
                    ? new Date(stats.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'Recently'
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Clock className="h-4 w-4" />
                <span>
                  {stats.lastActivity 
                    ? `Last active ${new Date(stats.lastActivity).toLocaleDateString()}`
                    : 'Active user'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setActiveSection('account')}
            className="bg-white/80"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Classes Enrolled</p>
              <p className="text-3xl font-bold text-blue-600">{attendanceAnalytics?.totalClasses || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-0 bg-gradient-to-br from-emerald-50 to-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-3xl font-bold text-emerald-600">{attendanceAnalytics?.attendancePercentage || 0}%</p>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Classes Attended</p>
              <p className="text-3xl font-bold text-purple-600">{attendanceAnalytics?.attendedClasses || 0}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-0 bg-gradient-to-br from-amber-50 to-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-3xl font-bold text-amber-600">{attendanceAnalytics?.statusBreakdown.pending || 0}</p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );

  const renderAccountDetails = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-8 border-0 bg-white/60 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <Button 
            variant={isEditing ? "default" : "outline"}
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            className="bg-white/80"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profileData.fullName}
              onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
              disabled={!isEditing}
              className="bg-white/80"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                className="bg-white/80 pr-10"
              />
              <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                disabled={!isEditing}
                className="bg-white/80 pr-10"
              />
              <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <div className="relative">
              <Input
                id="role"
                value={profile?.role === 'owner' ? 'Educator' : 'Student'}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium text-gray-900">Security</h4>
              <p className="text-sm text-gray-500">Manage your account security settings</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
              className="bg-white/80"
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-8 border-0 bg-white/60 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
        
        <div className="space-y-6">
          {[
            { key: 'email_notifications', label: 'Email Notifications', description: 'Receive important updates via email' },
            { key: 'push_notifications', label: 'Push Notifications', description: 'Get instant notifications in your browser' },
            { key: 'test_reminders', label: 'Test Reminders', description: 'Reminders about upcoming tests and deadlines' },
            { key: 'result_alerts', label: 'Result Alerts', description: 'Notifications when test results are available' },
            { key: 'weekly_digest', label: 'Weekly Digest', description: 'Weekly summary of your learning progress' }
          ].map(({ key, label, description }) => {
            const value = settings[key as keyof typeof settings] as boolean;
            
            return (
              <div key={key} className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Label htmlFor={key} className="font-medium">
                      {label}
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    {description}
                  </p>
                </div>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    updateSetting(key as keyof typeof settings, checked)
                  }
                />
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );

  const renderPrivacy = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Two-Factor Authentication */}
      {user && (
        <TwoFactorSetup
          userId={user.id}
          isEnabled={twoFactorEnabled}
          onStatusChange={() => {
            const status = twoFactorService.getTwoFactorStatus(user.id);
            setTwoFactorEnabled(status.is_enabled);
          }}
        />
      )}
      
      <Card className="p-8 border-0 bg-white/60 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy & Security Settings</h3>
        
        <div className="space-y-6">
          {[
            { key: 'profile_visibility', label: 'Profile Visibility', description: 'Control who can see your profile information', type: 'visibility' },
            { key: 'share_progress', label: 'Share Progress', description: 'Allow sharing your learning progress with educators', type: 'boolean' },
            { key: 'analytics_opt_in', label: 'Analytics Opt-in', description: 'Help improve the platform with anonymous usage data', type: 'boolean' },
            { key: 'data_collection', label: 'Data Collection', description: 'Allow collection of learning analytics for insights', type: 'boolean' }
          ].map(({ key, label, description, type }) => {
            const value = settings[key as keyof typeof settings];
            const checked = type === 'visibility' ? value === 'public' : value as boolean;
            
            return (
              <div key={key} className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Label htmlFor={key} className="font-medium">
                      {label}
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    {description}
                  </p>
                </div>
                <Switch
                  id={key}
                  checked={checked}
                  onCheckedChange={(checked) => {
                    const newValue = type === 'visibility' ? (checked ? 'public' : 'private') : checked;
                    updateSetting(key as keyof typeof settings, newValue);
                  }}
                />
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );

  const renderAppearance = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-8 border-0 bg-white/60 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Appearance Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Label htmlFor="theme" className="font-medium">
                  Theme
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                Choose your preferred color scheme
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={settings.theme === 'light' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => updateSetting('theme', 'light')}
              >
                Light
              </Button>
              <Button 
                variant={settings.theme === 'dark' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => toast.info('Dark theme coming soon!')}
                className="relative"
              >
                Dark
                <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs px-1 py-0 bg-orange-100 text-orange-600 border-orange-200">
                  Soon
                </Badge>
              </Button>
              <Button 
                variant={settings.theme === 'system' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => toast.info('System theme detection coming soon!')}
                className="relative"
              >
                System
                <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs px-1 py-0 bg-orange-100 text-orange-600 border-orange-200">
                  Soon
                </Badge>
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <Label htmlFor="reducedMotion" className="font-medium">
                Reduced Motion
              </Label>
              <p className="text-sm text-gray-500">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reducedMotion"
              checked={settings.reduced_motion}
              onCheckedChange={(checked) => 
                updateSetting('reduced_motion', checked)
              }
            />
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <Label htmlFor="highContrast" className="font-medium">
                High Contrast
              </Label>
              <p className="text-sm text-gray-500">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              id="highContrast"
              checked={settings.high_contrast}
              onCheckedChange={(checked) => 
                updateSetting('high_contrast', checked)
              }
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderLanguage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-8 border-0 bg-white/60 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Language & Region</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="language">Interface Language</Label>
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-orange-100 text-orange-600 border-orange-200">
                Coming Soon
              </Badge>
            </div>
            <select 
              id="language"
              className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.language}
              onChange={(e) => {
                if (e.target.value !== 'en') {
                  toast.info('Additional language support coming soon!');
                  return;
                }
                updateSetting('language', e.target.value);
              }}
            >
              <option value="en">English</option>
              <option value="es">Español (Coming Soon)</option>
              <option value="fr">Français (Coming Soon)</option>
              <option value="de">Deutsch (Coming Soon)</option>
              <option value="it">Italiano (Coming Soon)</option>
              <option value="pt">Português (Coming Soon)</option>
              <option value="zh">中文 (Coming Soon)</option>
              <option value="ja">日本語 (Coming Soon)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <select 
              id="dateFormat"
              className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.date_format}
              onChange={(e) => updateSetting('date_format', e.target.value)}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD MMM YYYY">DD MMM YYYY</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeFormat">Time Format</Label>
            <select 
              id="timeFormat"
              className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.time_format}
              onChange={(e) => updateSetting('time_format', e.target.value as '12h' | '24h')}
            >
              <option value="12h">12 Hour (AM/PM)</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  // Chart colors for attendance analytics
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const renderAttendanceAnalytics = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-8 border-0 bg-white/60 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Performance</h3>
        
        {!attendanceLoading && attendanceAnalytics && attendanceAnalytics.totalClasses > 0 ? (
          <>
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{attendanceAnalytics.statusBreakdown.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">{attendanceAnalytics.statusBreakdown.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{attendanceAnalytics.statusBreakdown.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/80 p-6 rounded-xl border">
                <h4 className="font-medium text-gray-900 mb-4">Weekly Attendance Trend</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={attendanceAnalytics.weeklyAttendance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="percentage" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white/80 p-6 rounded-xl border">
                <h4 className="font-medium text-gray-900 mb-4">Class Performance</h4>
                <div className="space-y-4">
                  {attendanceAnalytics.classwiseAttendance.slice(0, 4).map((classStats, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate mr-2">
                          {classStats.className.length > 20 ? 
                            classStats.className.substring(0, 20) + '...' : 
                            classStats.className
                          }
                        </span>
                        <span className="text-muted-foreground">{classStats.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={classStats.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 p-6 rounded-xl border">
              <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {attendanceAnalytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'approved' ? 'bg-green-500' :
                        activity.status === 'pending' ? 'bg-yellow-500' :
                        activity.status === 'missed' ? 'bg-gray-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-sm">{activity.className}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                    <Badge variant={
                      activity.status === 'approved' ? 'default' :
                      activity.status === 'pending' ? 'secondary' :
                      activity.status === 'missed' ? 'outline' : 'destructive'
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : attendanceLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your attendance data...</p>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No attendance data available</p>
            <p className="text-sm">Start attending classes to see your analytics here</p>
          </div>
        )}
      </Card>
    </motion.div>
  );

  const renderAbout = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-8 border-0 bg-white/60 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">About Elysiar</h3>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <img src="logo-Elysiar.jpeg" className="rounded-xl"/>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Elysiar</h4>
            <p className="text-gray-600 mb-4">Version 3.2.3</p>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Where Knowledge Flows - An innovative learning platform designed to transform 
              education through technology, collaboration, and personalized experiences.
            </p>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Release Date</h5>
              <p className="text-sm text-gray-600">October 2024</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Build</h5>
              <p className="text-sm text-gray-600">2024.10.09</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Platform</h5>
              <p className="text-sm text-gray-600">Web Application</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Support & Resources</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="justify-start bg-white/80"
                onClick={() => window.open('/teams', '_blank')}
              >
                <User className="h-4 w-4 mr-2" />
                Our Team
              </Button>
              <Button 
                variant="outline" 
                className="justify-start bg-white/80"
                onClick={() => window.open('/support', '_blank')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                className="justify-start bg-white/80"
                onClick={() => window.open('/privacy', '_blank')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
              <Button 
                variant="outline" 
                className="justify-start bg-white/80"
                onClick={() => window.open('/terms', '_blank')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Terms of Service
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderDataManagement = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-8 border-0 bg-white/60 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Data & Storage Management</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Export Your Data</h4>
              <p className="text-sm text-gray-500">Download a copy of all your data</p>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/80"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Clear Cache</h4>
              <p className="text-sm text-gray-500">Clear temporary files and cache</p>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/80"
              onClick={handleClearCache}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-600">Delete Account</h4>
              <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
            </div>
            <Button 
              variant="destructive" 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  // Password Change Modal Component
  const PasswordChangeModal = () => (
    <AnimatePresence>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-gray-200/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswordModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="bg-white/80 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-white/80"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-white/80"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePassword}
                className="flex-1"
              >
                Update Password
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-blue-600/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-9 w-9 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
            
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="bg-white/80"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-2 border-0 bg-white/60 backdrop-blur-xl sticky top-24">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as SettingsSection)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg settings-menu-item ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.description}
                        </p>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4 text-blue-600" />}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'account' && renderAccountDetails()}
            {activeSection === 'attendance' && renderAttendanceAnalytics()}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'privacy' && renderPrivacy()}
            {activeSection === 'appearance' && renderAppearance()}
            {activeSection === 'language' && renderLanguage()}
            {activeSection === 'data' && renderDataManagement()}
            {activeSection === 'about' && renderAbout()}
          </div>
        </div>
      </div>
      
      {/* Password Change Modal */}
      <PasswordChangeModal />
    </div>
  );
};

export default Settings;
