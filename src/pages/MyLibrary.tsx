import { useAuth } from '@/contexts/AuthContext';
import { useMyBookIssues } from '@/hooks/useBookIssues';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, AlertCircle, Clock } from 'lucide-react';
import { BackToDashboard } from '@/components/BackToDashboard';
import { differenceInDays, format } from 'date-fns';
import { StudentNotifications } from '@/components/StudentNotifications';
import { BookRecommendations } from '@/components/BookRecommendations';

export default function MyLibrary() {
  const { profile } = useAuth();
  const { data: myIssues, isLoading } = useMyBookIssues();

  const activeIssues = myIssues?.filter(issue => issue.status === 'issued' || issue.status === 'overdue');
  const returnedIssues = myIssues?.filter(issue => issue.status === 'returned');

  const getDaysRemaining = (dueDate: string) => {
    return differenceInDays(new Date(dueDate), new Date());
  };

  if (profile?.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only students can access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Library
            </h1>
            <p className="text-muted-foreground mt-2">Track your borrowed books and due dates</p>
          </div>
          <BackToDashboard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5" />
                Currently Borrowed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{activeIssues?.length || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertCircle className="w-5 h-5" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {activeIssues?.filter(issue => issue.status === 'overdue').length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5" />
                Total Returned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{returnedIssues?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Currently Borrowed Books</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : activeIssues && activeIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeIssues.map((issue: any) => {
                  const daysRemaining = getDaysRemaining(issue.due_date);
                  const isOverdue = daysRemaining < 0;
                  const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0;

                  return (
                    <Card key={issue.id} className={`overflow-hidden hover:shadow-xl transition-shadow border-2 ${
                      isOverdue ? 'border-red-300' : isDueSoon ? 'border-yellow-300' : 'border-blue-300'
                    }`}>
                      {issue.books?.cover_url && (
                        <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                          <img src={issue.books.cover_url} alt={issue.books.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg line-clamp-2">{issue.books?.title}</CardTitle>
                            <CardDescription className="mt-1">{issue.books?.author}</CardDescription>
                          </div>
                          <Badge variant={isOverdue ? 'destructive' : isDueSoon ? 'default' : 'secondary'}>
                            {issue.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Issued: {format(new Date(issue.issued_at), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Due: {format(new Date(issue.due_date), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg ${
                          isOverdue ? 'bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-300' :
                          isDueSoon ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-300' :
                          'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300'
                        }`}>
                          <p className="text-sm font-medium">
                            {isOverdue ? (
                              <>Overdue by {Math.abs(daysRemaining)} days!</>
                            ) : isDueSoon ? (
                              <>Due in {daysRemaining} days</>
                            ) : (
                              <>{daysRemaining} days remaining</>
                            )}
                          </p>
                        </div>
                        {issue.notes && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">{issue.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardHeader className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle>No borrowed books</CardTitle>
                  <CardDescription>You don't have any books issued currently</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Reading History</h2>
            {returnedIssues && returnedIssues.length > 0 ? (
              <div className="space-y-3">
                {returnedIssues.map((issue: any) => (
                  <Card key={issue.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{issue.books?.title}</CardTitle>
                          <CardDescription>{issue.books?.author}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-green-50">Returned</Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Issued: {format(new Date(issue.issued_at), 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span>Returned: {issue.returned_at ? format(new Date(issue.returned_at), 'MMM dd, yyyy') : 'N/A'}</span>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader className="text-center py-8">
                  <CardDescription>No reading history yet</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <StudentNotifications />
          <BookRecommendations />
        </div>
      </div>
      </div>
    </div>
  );
}
