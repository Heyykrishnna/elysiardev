
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTestAttempts = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['test-attempts', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from('test_attempts')
        .select(`
          *,
          tests (
            title,
            description,
            total_questions
          )
        `)
        .eq('student_id', profile.id)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching test attempts:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile,
  });
};
