import React, { useState } from 'react';
import { Bell, Plus, X, Edit3, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
const NotificationManager = () => {
  const {
    profile
  } = useAuth();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingNotification, setEditingNotification] = useState<any>(null);

  // Fetch owner's notifications
  const {
    data: notifications,
    isLoading
  } = useQuery({
    queryKey: ['owner-created-notifications', profile?.id],
    queryFn: async () => {
      if (!profile || profile.role !== 'owner') return [];
      const {
        data,
        error
      } = await supabase.from('owner_notifications').select('*').eq('owner_id', profile.id).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile && profile.role === 'owner'
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async ({
      title,
      description
    }: {
      title: string;
      description: string;
    }) => {
      const {
        data,
        error
      } = await supabase.from('owner_notifications').insert({
        owner_id: profile!.id,
        title,
        description,
        is_active: true
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['owner-created-notifications']
      });
      setTitle('');
      setDescription('');
      setIsCreateOpen(false);
      toast({
        title: "Notification sent!",
        description: "Your notification has been sent to all students."
      });
    },
    onError: error => {
      console.error('Error creating notification:', error);
      toast({
        title: "Error",
        description: "Failed to create notification. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update notification mutation
  const updateNotificationMutation = useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      is_active
    }: {
      id: string;
      title: string;
      description: string;
      is_active: boolean;
    }) => {
      const {
        data,
        error
      } = await supabase.from('owner_notifications').update({
        title,
        description,
        is_active
      }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['owner-created-notifications']
      });
      setEditingNotification(null);
      toast({
        title: "Notification updated!",
        description: "Your notification has been updated successfully."
      });
    },
    onError: error => {
      console.error('Error updating notification:', error);
      toast({
        title: "Error",
        description: "Failed to update notification. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const {
        error
      } = await supabase.from('owner_notifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['owner-created-notifications']
      });
      toast({
        title: "Notification deleted!",
        description: "Your notification has been deleted successfully."
      });
    },
    onError: error => {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive"
      });
    }
  });
  const handleCreateNotification = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a notification title.",
        variant: "destructive"
      });
      return;
    }
    createNotificationMutation.mutate({
      title,
      description
    });
  };
  const handleUpdateNotification = () => {
    if (!editingNotification || !editingNotification.title.trim()) return;
    updateNotificationMutation.mutate({
      id: editingNotification.id,
      title: editingNotification.title,
      description: editingNotification.description,
      is_active: editingNotification.is_active
    });
  };
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  if (profile?.role !== 'owner') return null;
  return <div className="min-h-screen bg-gradient-dynamic relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full absolute top-20 left-10 animate-float-slow"></div>
        <div className="floating-orb w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full absolute top-40 right-20 animate-float-delayed"></div>
        <div className="floating-orb w-20 h-20 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full absolute bottom-40 left-1/4 animate-float"></div>
        <div className="floating-orb w-16 h-16 bg-gradient-to-br from-pink-400/10 to-red-400/10 rounded-full absolute bottom-20 right-1/3 animate-float-slow"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <Card className="glass-card shadow-float-heavy border border-white/20 rounded-3xl overflow-hidden backdrop-blur-xl max-w-6xl mx-auto">
          <CardHeader className="pb-6 bg-gradient-soft border-b border-white/20 backdrop-blur-sm relative overflow-hidden">
            {/* Header background pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="floating-orb w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full absolute -top-4 -right-4 animate-float-slow"></div>
              <div className="floating-orb w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full absolute top-6 left-6 animate-float-delayed"></div>
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-2">
                <CardTitle className="flex items-center text-gray-800 text-4xl font-bold">
                  <div className="w-14 h-14 bg-gradient-elegant rounded-2xl flex items-center justify-center mr-4 shadow-lg bg-slate-800">
                    <Bell className="h-8 w-8 text-white animate-pulse" />
                  </div>
                  <span className="text-gradient bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Notification Manager
                  </span>
                </CardTitle>
                <CardDescription className="text-xl text-gray-600 font-medium ml-18">
                  Send beautiful notifications to all students instantly
                </CardDescription>
              </div>
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-elegant hover:shadow-glow px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-500 hover:scale-105 shadow-lg text-slate-900 bg-slate-50">
                    <Plus className="h-5 w-5 mr-3" />
                    Create Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border border-white/20 rounded-3xl max-w-2xl backdrop-blur-xl">
                  <DialogHeader className="space-y-4 pb-6">
                    <DialogTitle className="text-3xl font-bold text-gradient bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center">
                      <div className="w-10 h-10 bg-gradient-elegant rounded-xl flex items-center justify-center mr-3">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      Create New Notification
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-lg font-semibold text-gray-700 block">
                        📝 Title
                      </label>
                      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter an engaging notification title..." className="w-full text-lg p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-lg font-semibold text-gray-700 block">
                        💬 Description (Optional)
                      </label>
                      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a detailed description to provide more context..." className="w-full min-h-[120px] text-base p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 resize-none" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="px-6 py-3 text-base font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300">
                        Cancel
                      </Button>
                      <Button onClick={handleCreateNotification} disabled={createNotificationMutation.isPending} className="bg-gradient-elegant hover:shadow-glow text-white px-8 py-3 text-base font-semibold rounded-xl transition-all duration-500 hover:scale-105 shadow-lg disabled:opacity-70">
                        <Send className="h-5 w-5 mr-3" />
                        {createNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
      
          <CardContent className="glass-content p-8">
            {isLoading ? <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-elegant rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600 text-xl font-semibold">Loading notifications...</p>
              </div> : notifications && notifications.length > 0 ? <div className="space-y-6">
                {notifications.map((notification, index) => <div key={notification.id} className="glass-card border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group animate-fade-in" style={{
              animationDelay: `${index * 100}ms`
            }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-3 h-3 bg-gradient-elegant rounded-full animate-pulse"></div>
                          <h3 className="font-bold text-gray-800 text-2xl group-hover:text-blue-700 transition-colors duration-300">
                            {notification.title}
                          </h3>
                          <Badge variant={notification.is_active ? "default" : "secondary"} className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${notification.is_active ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-300" : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border border-gray-300"}`}>
                            {notification.is_active ? "🟢 Active" : "⚫ Inactive"}
                          </Badge>
                        </div>
                        {notification.description && <p className="text-gray-600 text-lg leading-relaxed font-medium pl-7">
                            {notification.description}
                          </p>}
                        <div className="flex items-center space-x-3 pl-7">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <p className="text-base text-gray-500 font-semibold">
                            Created: {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 ml-6">
                        <Button variant="outline" size="lg" onClick={() => setEditingNotification(notification)} className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-105">
                          <Edit3 className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => deleteNotificationMutation.mutate(notification.id)} disabled={deleteNotificationMutation.isPending} className="p-3 rounded-xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-300 hover:scale-105">
                          <Trash2 className="h-5 w-5 text-gray-600 hover:text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>)}
              </div> : <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-elegant rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg bg-slate-800">
                  <Bell className="h-12 w-12 text-white" />
                </div>
                <div className="space-y-4">
                  <p className="text-gray-700 font-bold text-2xl">No notifications created yet</p>
                  <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
                    Create your first notification to instantly communicate with all students
                  </p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-10 right-10 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse opacity-70"></div>
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingNotification} onOpenChange={() => setEditingNotification(null)}>
        <DialogContent className="glass-card border border-white/20 rounded-3xl max-w-2xl backdrop-blur-xl">
          <DialogHeader className="space-y-4 pb-6">
            <DialogTitle className="text-3xl font-bold text-gradient bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center">
              <div className="w-10 h-10 bg-gradient-elegant rounded-xl flex items-center justify-center mr-3">
                <Edit3 className="h-5 w-5 text-white" />
              </div>
              Edit Notification
            </DialogTitle>
          </DialogHeader>
          {editingNotification && <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-lg font-semibold text-gray-700 block">
                  📝 Title
                </label>
                <Input value={editingNotification.title} onChange={e => setEditingNotification({
              ...editingNotification,
              title: e.target.value
            })} placeholder="Enter notification title..." className="w-full text-lg p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300" />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-semibold text-gray-700 block">
                  💬 Description (Optional)
                </label>
                <Textarea value={editingNotification.description || ''} onChange={e => setEditingNotification({
              ...editingNotification,
              description: e.target.value
            })} placeholder="Enter notification description..." className="w-full min-h-[120px] text-base p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 resize-none" />
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <input type="checkbox" id="is_active" checked={editingNotification.is_active} onChange={e => setEditingNotification({
              ...editingNotification,
              is_active: e.target.checked
            })} className="w-5 h-5 rounded-md border-2 border-gray-300 focus:border-blue-500 transition-all duration-300" />
                <label htmlFor="is_active" className="text-lg font-semibold text-gray-700 cursor-pointer">
                  🟢 Active (visible to students)
                </label>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={() => setEditingNotification(null)} className="px-6 py-3 text-base font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300">
                  Cancel
                </Button>
                <Button onClick={handleUpdateNotification} disabled={updateNotificationMutation.isPending} className="bg-gradient-elegant hover:shadow-glow text-white px-8 py-3 text-base font-semibold rounded-xl transition-all duration-500 hover:scale-105 shadow-lg disabled:opacity-70">
                  {updateNotificationMutation.isPending ? 'Updating...' : 'Update Notification'}
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
};
export default NotificationManager;