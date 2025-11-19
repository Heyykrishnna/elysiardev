
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTests = () => {
  const { profile } = useAuth();
  const isOwner = profile?.role === 'owner';

  return useQuery({
    queryKey: ['tests', profile?.id, isOwner],
    queryFn: async () => {
      if (!profile) return [];

      let query = supabase.from('tests').select('*');
      
      if (isOwner) {
        // Owners see their own tests
        query = query.eq('owner_id', profile.id);
      } else {
        // Students see active tests
        query = query.eq('is_active', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tests:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!profile,
  });
};

export const useCreateTest = () => {
  return async (testData: {
    title: string;
    description?: string;
    time_limit?: number;
    password?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tests')
      .insert({
        ...testData,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };
};
