import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  category: string;
  cover_url: string | null;
  available_copies: number;
  reason: string;
  score: number;
}

export const useBookRecommendations = () => {
  return useQuery({
    queryKey: ['book-recommendations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's borrowing history
      const { data: borrowHistory, error: historyError } = await supabase
        .from('book_issues')
        .select('book_id, books(id, title, author, category)')
        .eq('student_id', user.id);

      if (historyError) throw historyError;

      // Extract categories and authors from history
      const borrowedCategories = new Set<string>();
      const borrowedAuthors = new Set<string>();
      const borrowedBookIds = new Set<string>();

      borrowHistory?.forEach((issue: any) => {
        if (issue.books) {
          borrowedCategories.add(issue.books.category);
          borrowedAuthors.add(issue.books.author);
          borrowedBookIds.add(issue.books.id);
        }
      });

      // Get all available books
      const { data: allBooks, error: booksError } = await supabase
        .from('books')
        .select('*')
        .gt('available_copies', 0);

      if (booksError) throw booksError;

      // Get popularity data (count of issues per book)
      const { data: popularityData, error: popError } = await supabase
        .from('book_issues')
        .select('book_id');

      if (popError) throw popError;

      // Calculate popularity scores
      const popularityMap = new Map<string, number>();
      popularityData?.forEach((issue: any) => {
        const count = popularityMap.get(issue.book_id) || 0;
        popularityMap.set(issue.book_id, count + 1);
      });

      // Score and filter books
      const recommendations: BookRecommendation[] = [];

      allBooks?.forEach((book: any) => {
        // Skip if already borrowed
        if (borrowedBookIds.has(book.id)) return;

        let score = 0;
        const reasons: string[] = [];

        // Check category match
        if (borrowedCategories.has(book.category)) {
          score += 3;
          reasons.push(`You've enjoyed ${book.category} books`);
        }

        // Check author match
        if (borrowedAuthors.has(book.author)) {
          score += 4;
          reasons.push(`You've read ${book.author} before`);
        }

        // Add popularity bonus
        const popularity = popularityMap.get(book.id) || 0;
        if (popularity > 0) {
          score += Math.min(popularity * 0.5, 3); // Cap popularity bonus at 3
          if (popularity >= 5) {
            reasons.push('Popular among students');
          }
        }

        // If no specific reason, add as popular or new
        if (reasons.length === 0) {
          if (popularity >= 3) {
            reasons.push('Trending in library');
            score += 1;
          } else {
            reasons.push('Discover something new');
            score += 0.5;
          }
        }

        // Only recommend books with score > 0
        if (score > 0) {
          recommendations.push({
            id: book.id,
            title: book.title,
            author: book.author,
            category: book.category,
            cover_url: book.cover_url,
            available_copies: book.available_copies,
            reason: reasons.join(' • '),
            score,
          });
        }
      });

      // Sort by score and return top recommendations
      recommendations.sort((a, b) => b.score - a.score);
      return recommendations.slice(0, 12);
    },
  });
};

export const usePopularBooks = () => {
  return useQuery({
    queryKey: ['popular-books'],
    queryFn: async () => {
      // Get all book issues to calculate popularity
      const { data: issues, error: issuesError } = await supabase
        .from('book_issues')
        .select('book_id, books(id, title, author, category, cover_url, available_copies)');

      if (issuesError) throw issuesError;

      // Count issues per book
      const bookCounts = new Map<string, { book: any; count: number }>();
      
      issues?.forEach((issue: any) => {
        if (issue.books) {
          const existing = bookCounts.get(issue.book_id);
          if (existing) {
            existing.count++;
          } else {
            bookCounts.set(issue.book_id, { book: issue.books, count: 1 });
          }
        }
      });

      // Convert to array and sort by count
      const popularBooks = Array.from(bookCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(({ book, count }) => ({
          ...book,
          borrow_count: count,
        }));

      return popularBooks;
    },
  });
};