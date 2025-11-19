import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface ResourceRequest {
  id: string;
  student_id: string;
  book_name: string;
  subject: string;
  edition?: string;
  reason?: string;
  status: 'pending' | 'solved' | 'rejected';
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const useResourceRequests = () => {
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchRequests = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('resource_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // If user is a student, only fetch their own requests
      if (profile?.role !== 'owner') {
        query = query.eq('student_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data as ResourceRequest[] || []);
    } catch (error) {
      console.error('Error fetching resource requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch resource requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: {
    book_name: string;
    subject: string;
    edition?: string;
    reason?: string;
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('resource_requests')
        .insert({
          student_id: user.id,
          ...requestData
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your resource request has been submitted."
      });

      fetchRequests(); // Refresh the list
      return { error: null };
    } catch (error) {
      console.error('Error creating resource request:', error);
      return { error };
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'pending' | 'solved' | 'rejected') => {
    if (profile?.role !== 'owner') {
      return { error: 'Unauthorized' };
    }

    try {
      const { error } = await supabase
        .from('resource_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Request status updated to ${status}.`
      });

      fetchRequests(); // Refresh the list
      return { error: null };
    } catch (error) {
      console.error('Error updating request status:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user, profile]);

  return {
    requests,
    loading,
    createRequest,
    updateRequestStatus,
    refetch: fetchRequests
  };
};