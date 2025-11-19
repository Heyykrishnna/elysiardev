import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBooks, useAddBook, useDeleteBook } from '@/hooks/useBooks';
import { useBookIssues, useIssueBook, useReturnBook } from '@/hooks/useBookIssues';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Search, User, Calendar, AlertCircle } from 'lucide-react';
import { BackToDashboard } from '@/components/BackToDashboard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ISBNScanner } from '@/components/ISBNScanner';
import { useEffect } from 'react';

export default function Library() {
  const { profile } = useAuth();
  const { data: books, isLoading: booksLoading } = useBooks();
  const { data: issues, isLoading: issuesLoading } = useBookIssues();
  const addBook = useAddBook();
  const deleteBook = useDeleteBook();
  const issueBook = useIssueBook();
  const returnBook = useReturnBook();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssueBook, setShowIssueBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    total_copies: 1,
    available_copies: 1,
    description: '',
    cover_url: '',
  });

  const [issueForm, setIssueForm] = useState({
    student_id: '',
    due_date: '',
    notes: '',
  });

  const loadStudents = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student');
    
    if (error) {
      toast.error('Failed to load students');
      return;
    }
    setStudents(data || []);
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    await addBook.mutateAsync({ ...newBook, added_by: user.id });
    setShowAddBook(false);
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      category: '',
      total_copies: 1,
      available_copies: 1,
      description: '',
      cover_url: '',
    });
  };

  // Load students when the issue book dialog opens
  useEffect(() => {
    if (showIssueBook) {
      loadStudents();
    }
  }, [showIssueBook]);

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !issueForm.student_id) return;

    const student = students.find(s => s.id === issueForm.student_id);
    if (!student) {
      toast.error('Student not found');
      return;
    }

    await issueBook.mutateAsync({
      book_id: selectedBook.id,
      student_id: student.id,
      student_name: student.full_name || 'Unknown',
      student_email: student.email,
      due_date: issueForm.due_date,
      notes: issueForm.notes,
    });

    setShowIssueBook(false);
    setSelectedBook(null);
    setIssueForm({ student_id: '', due_date: '', notes: '' });
  };

  const handleISBNBookFetched = (bookData: any) => {
    setNewBook({
      ...newBook,
      ...bookData,
    });
    toast.info('Book details loaded! Please review and adjust as needed.');
  };

  const filteredBooks = books?.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profile?.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only educators can access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Digital Library Management
            </h1>
            <p className="text-muted-foreground mt-2">Manage books and track every single issues and updates</p>
          </div>
          <BackToDashboard />
        </div>

        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="books" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Books
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-2">
              <User className="w-4 h-4" />
              Issues
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={showAddBook} onOpenChange={setShowAddBook}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Plus className="w-4 h-4" />
                    Add Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Book</DialogTitle>
                    <DialogDescription>Enter book details to add to the library</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddBook} className="space-y-4">
                    <ISBNScanner onBookFetched={handleISBNBookFetched} />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          required
                          value={newBook.title}
                          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="author">Author *</Label>
                        <Input
                          id="author"
                          required
                          value={newBook.author}
                          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="isbn">ISBN</Label>
                        <Input
                          id="isbn"
                          value={newBook.isbn}
                          onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Input
                          id="category"
                          required
                          value={newBook.category}
                          onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                          placeholder="e.g., Science, Fiction"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="total_copies">Total Copies *</Label>
                        <Input
                          id="total_copies"
                          type="number"
                          min="1"
                          required
                          value={newBook.total_copies}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setNewBook({ ...newBook, total_copies: val, available_copies: val });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cover_url">Cover Image URL</Label>
                        <Input
                          id="cover_url"
                          value={newBook.cover_url}
                          onChange={(e) => setNewBook({ ...newBook, cover_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newBook.description}
                        onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowAddBook(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Book</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {booksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks?.map((book) => (
                  <Card key={book.id} className="overflow-hidden hover:shadow-xl transition-shadow border-2 hover:border-purple-300">
                    {book.cover_url && (
                      <div className="h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                          <CardDescription className="mt-1">{book.author}</CardDescription>
                        </div>
                        <Badge variant={book.available_copies > 0 ? 'default' : 'destructive'}>
                          {book.available_copies}/{book.total_copies}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-purple-50">{book.category}</Badge>
                        {book.isbn && <Badge variant="outline" className="bg-blue-50">{book.isbn}</Badge>}
                      </div>
                      {book.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={book.available_copies === 0}
                          onClick={() => {
                            setSelectedBook(book);
                            setShowIssueBook(true);
                            loadStudents();
                          }}
                        >
                          Issue Book
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this book?')) {
                              deleteBook.mutate(book.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            {issuesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-1/2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {issues?.map((issue: any) => (
                  <Card key={issue.id} className={`border-l-4 ${
                    issue.status === 'overdue' ? 'border-l-red-500' :
                    issue.status === 'returned' ? 'border-l-green-500' :
                    'border-l-blue-500'
                  }`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{issue.books?.title}</CardTitle>
                          <CardDescription>by {issue.books?.author}</CardDescription>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="gap-1">
                              <User className="w-3 h-3" />
                              {issue.student_name}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(issue.due_date).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge variant={
                            issue.status === 'overdue' ? 'destructive' :
                            issue.status === 'returned' ? 'default' :
                            'secondary'
                          }>
                            {issue.status}
                          </Badge>
                          {issue.status === 'issued' && (
                            <Button
                              size="sm"
                              onClick={() => returnBook.mutate(issue.id)}
                            >
                              Mark Returned
                            </Button>
                          )}
                        </div>
                      </div>
                      {issue.notes && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm">{issue.notes}</p>
                        </div>
                      )}
                    </CardHeader>
                  </Card>
                ))}
                {issues?.length === 0 && (
                  <Card>
                    <CardHeader className="text-center py-12">
                      <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <CardTitle>No book issues yet</CardTitle>
                      <CardDescription>Start issuing books to students to see them here</CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showIssueBook} onOpenChange={setShowIssueBook}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Book</DialogTitle>
              <DialogDescription>
                Issue "{selectedBook?.title}" to a student
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student *</Label>
                <Select
                  value={issueForm.student_id}
                  onValueChange={(value) => setIssueForm({ ...issueForm, student_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name || student.email} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  required
                  value={issueForm.due_date}
                  onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={issueForm.notes}
                  onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Optional notes about this issue..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowIssueBook(false)}>
                  Cancel
                </Button>
                <Button type="submit">Issue Book</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
