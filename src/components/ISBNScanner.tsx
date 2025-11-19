import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Barcode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ISBNScannerProps {
  onBookFetched: (bookData: {
    title: string;
    author: string;
    isbn: string;
    description: string;
    cover_url: string;
  }) => void;
}

export function ISBNScanner({ onBookFetched }: ISBNScannerProps) {
  const [isbn, setIsbn] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookByISBN = async () => {
    if (!isbn) {
      toast.error('Please enter an ISBN');
      return;
    }

    setIsLoading(true);
    try {
      // Try Google Books API first
      const googleResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );
      const googleData = await googleResponse.json();

      if (googleData.items && googleData.items.length > 0) {
        const book = googleData.items[0].volumeInfo;
        onBookFetched({
          title: book.title || '',
          author: book.authors?.join(', ') || '',
          isbn: isbn,
          description: book.description || '',
          cover_url: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || '',
        });
        toast.success('Book details fetched successfully!');
        setIsbn('');
        return;
      }

      // Try Open Library API as fallback
      const openLibResponse = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );
      const openLibData = await openLibResponse.json();
      const bookKey = `ISBN:${isbn}`;

      if (openLibData[bookKey]) {
        const book = openLibData[bookKey];
        onBookFetched({
          title: book.title || '',
          author: book.authors?.map((a: any) => a.name).join(', ') || '',
          isbn: isbn,
          description: book.notes || '',
          cover_url: book.cover?.medium || book.cover?.small || '',
        });
        toast.success('Book details fetched successfully!');
        setIsbn('');
        return;
      }

      toast.error('Book not found. Please enter details manually.');
    } catch (error) {
      console.error('Error fetching book:', error);
      toast.error('Failed to fetch book details. Please enter manually.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border-2 border-dashed border-primary/20">
      <div className="flex items-center gap-2 mb-2">
        <Barcode className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Quick Add with ISBN</h3>
      </div>
      <div className="space-y-2">
        <Label htmlFor="isbn-input">ISBN Number</Label>
        <div className="flex gap-2">
          <Input
            id="isbn-input"
            placeholder="Enter ISBN (e.g., 9780545010221)"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchBookByISBN()}
          />
          <Button
            type="button"
            onClick={fetchBookByISBN}
            disabled={isLoading || !isbn}
            className="shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Barcode className="w-4 h-4 mr-2" />
                Fetch
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the ISBN to automatically fetch book details
        </p>
      </div>
    </div>
  );
}