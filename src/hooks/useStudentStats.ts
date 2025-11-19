
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useStudentStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['student-stats', profile?.id],
    queryFn: async () => {
      if (!profile || profile.role === 'owner') return null;

      // Fetch test attempts by student
      const { data: attempts, error: attemptsError } = await supabase
        .from('test_attempts')
        .select('score')
        .eq('student_id', profile.id)
        .eq('is_completed', true);

      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
        throw attemptsError;
      }

      // Fetch available study resources
      const { data: resources, error: resourcesError } = await supabase
        .from('study_resources')
        .select('id')
        .or('is_public.eq.true,owner_id.eq.' + profile.id);

      if (resourcesError) {
        console.error('Error fetching resources:', resourcesError);
        throw resourcesError;
      }

      const validScores = attempts?.filter(attempt => attempt.score !== null) || [];
      const averageScore = validScores.length 
        ? Math.round(validScores.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / validScores.length)
        : 0;

      return {
        testsTaken: attempts?.length || 0,
        averageScore,
        studyResources: resources?.length || 0
      };
    },
    enabled: !!profile && profile.role !== 'owner',
  });
};
