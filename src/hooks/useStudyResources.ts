
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useStudyResources = () => {
  const { profile } = useAuth();
  const isOwner = profile?.role === 'owner';

  return useQuery({
    queryKey: ['study_resources', profile?.id, isOwner],
    queryFn: async () => {
      if (!profile) return [];

      let query = supabase.from('study_resources').select('*');
      
      if (isOwner) {
        // Owners see their own resources and public ones
        query = query.or(`owner_id.eq.${profile.id},is_public.eq.true`);
      } else {
        // Students see only public resources
        query = query.eq('is_public', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching study resources:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!profile,
  });
};

export const useCreateStudyResource = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (resourceData: {
      title: string;
      description?: string;
      content?: string;
      resource_type: string;
      file_url?: string;
      file_name?: string;
      is_public: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('study_resources')
        .insert({
          ...resourceData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_resources'] });
      toast({
        title: "Success",
        description: "Study resource created successfully!",
      });
    },
    onError: (error) => {
      console.error('Error creating study resource:', error);
      toast({
        title: "Error",
        description: "Failed to create study resource. Please try again.",
        variant: "destructive",
      });
    },
  });
};
