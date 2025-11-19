
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOwnerStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['owner-stats', profile?.id],
    queryFn: async () => {
      if (!profile || profile.role !== 'owner') return null;

      // Fetch tests created by owner
      const { data: tests, error: testsError } = await supabase
        .from('tests')
        .select('id')
        .eq('owner_id', profile.id);

      if (testsError) {
        console.error('Error fetching tests:', testsError);
        throw testsError;
      }

      // Fetch total students (unique students who took tests)
      const { data: students, error: studentsError } = await supabase
        .from('test_attempts')
        .select('student_id')
        .in('test_id', tests?.map(test => test.id) || []);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

      // Fetch study resources created by owner
      const { data: resources, error: resourcesError } = await supabase
        .from('study_resources')
        .select('id')
        .eq('owner_id', profile.id);

      if (resourcesError) {
        console.error('Error fetching resources:', resourcesError);
        throw resourcesError;
      }

      const uniqueStudents = new Set(students?.map(s => s.student_id) || []).size;

      return {
        testsCreated: tests?.length || 0,
        totalStudents: uniqueStudents,
        studyResources: resources?.length || 0
      };
    },
    enabled: !!profile && profile.role === 'owner',
  });
};
