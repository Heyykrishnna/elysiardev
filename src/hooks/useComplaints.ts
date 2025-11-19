import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Complaint {
  id: string;
  student_id: string;
  title: string;
  description: string;  
  category: string;
  status: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export const useComplaints = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const complaintsQuery = useQuery({
    queryKey: ['complaints', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      let query = supabase.from('complaints').select('*');
      
      if (profile.role === 'owner') {
        // Owners can see all complaints
        query = query.order('created_at', { ascending: false });
      } else {
        // Students can only see their own complaints
        query = query.eq('student_id', profile.id).order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching complaints:', error);
        throw error;
      }

      return data as Complaint[];
    },
    enabled: !!profile,
  });

  const createComplaintMutation = useMutation({
    mutationFn: async (complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at' | 'student_id' | 'status'>) => {
      if (!profile) throw new Error('No profile found');

      const { data, error } = await supabase
        .from('complaints')
        .insert({
          ...complaint,
          student_id: profile.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating complaint:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint submitted successfully');
    },
    onError: (error) => {
      console.error('Error creating complaint:', error);
      toast.error('Failed to submit complaint');
    },
  });

  const updateComplaintStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('complaints')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating complaint status:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint status updated');
    },
    onError: (error) => {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    },
  });

  return {
    complaints: complaintsQuery.data || [],
    isLoading: complaintsQuery.isLoading,
    createComplaint: createComplaintMutation.mutate,
    updateComplaintStatus: updateComplaintStatusMutation.mutate,
    isCreating: createComplaintMutation.isPending,
    isUpdating: updateComplaintStatusMutation.isPending,
  };
};