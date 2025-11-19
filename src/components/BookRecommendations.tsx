import { BookOpen, Sparkles, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBookRecommendations, usePopularBooks } from '@/hooks/useBookRecommendations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BookRecommendations() {
  const { data: recommendations, isLoading: recsLoading } = useBookRecommendations();
  const { data: popularBooks, isLoading: popularLoading } = usePopularBooks();

  if (recsLoading && popularLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Book Recommendations
        </CardTitle>
        <CardDescription>
          Discover your next great read
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="foryou" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="foryou" className="gap-2">
              <Star className="w-4 h-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="popular" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Popular
            </TabsTrigger>
          </TabsList>

          <TabsContent value="foryou" className="mt-4">
            {recommendations && recommendations.length > 0 ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {recommendations.map((book) => (
                    <Card
                      key={book.id}
                      className="overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-purple-500"
                    >
                      <div className="flex gap-4 p-4">
                        {book.cover_url ? (
                          <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100">
                            <img
                              src={book.cover_url}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-28 flex-shrink-0 rounded bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-purple-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                            {book.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {book.author}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {book.category}
                            </Badge>
                            {book.available_copies > 0 ? (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                {book.available_copies} available
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                Not available
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-purple-600 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {book.reason}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">
                  Borrow some books to get personalized recommendations!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="mt-4">
            {popularBooks && popularBooks.length > 0 ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {popularBooks.map((book, index) => (
                    <Card
                      key={book.id}
                      className="overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-orange-500"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        {book.cover_url ? (
                          <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                            <img
                              src={book.cover_url}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-28 flex-shrink-0 rounded bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-orange-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                            {book.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {book.author}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {book.category}
                            </Badge>
                            {book.available_copies > 0 ? (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                {book.available_copies} available
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                Not available
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-orange-600 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Borrowed {book.borrow_count} times
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No popular books yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}