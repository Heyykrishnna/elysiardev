import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BookIssue {
  id: string;
  book_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  issued_at: string;
  due_date: string;
  returned_at: string | null;
  status: 'issued' | 'returned' | 'overdue';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useBookIssues = () => {
  return useQuery({
    queryKey: ['book-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_issues')
        .select('*, books(title, author)')
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useMyBookIssues = () => {
  return useQuery({
    queryKey: ['my-book-issues'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('book_issues')
        .select('*, books(title, author, cover_url)')
        .eq('student_id', user.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useIssueBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueData: {
      book_id: string;
      student_id: string;
      student_name: string;
      student_email: string;
      due_date: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('book_issues')
        .insert([issueData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-issues'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-book-issues'] });
      toast.success('Book issued successfully');
    },
    onError: (error) => {
      toast.error(`Failed to issue book: ${error.message}`);
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueId: string) => {
      const { data, error } = await supabase
        .from('book_issues')
        .update({ 
          status: 'returned',
          returned_at: new Date().toISOString()
        })
        .eq('id', issueId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-issues'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-book-issues'] });
      toast.success('Book returned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to return book: ${error.message}`);
    },
  });
};
