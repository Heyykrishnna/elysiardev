
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudyResources } from '@/hooks/useStudyResources';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, FileText, Download, Eye, Loader2, ExternalLink, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BackToDashboard } from '@/components/BackToDashboard';
import { Layout } from '@/components/Layout';
import AddResourceForm from '@/components/AddResourceForm';
import ResourceRequestsManager from '@/components/ResourceRequestsManager';
import { useQueryClient } from '@tanstack/react-query';

const StudyResources = () => {
  const { profile } = useAuth();
  const { data: resources, isLoading, error } = useStudyResources();
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();
  const isOwner = profile?.role === 'owner';

  const handleAddSuccess = () => {
    setShowAddForm(false);
    // Refetch the resources data
    queryClient.invalidateQueries({ queryKey: ['study_resources'] });
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-blue-100 text-blue-800';
      case 'link':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText className="h-4 w-4 mr-1" />;
      case 'document':
        return <Download className="h-4 w-4 mr-1" />;
      case 'link':
        return <ExternalLink className="h-4 w-4 mr-1" />;
      default:
        return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  const handleResourceAction = (resource: any) => {
    if (resource.resource_type === 'link' && resource.file_url) {
      window.open(resource.file_url, '_blank');
    } else if (resource.resource_type === 'document' && resource.file_url) {
      window.open(resource.file_url, '_blank');
    } else if (resource.resource_type === 'note') {
      // For notes, we could show the content in a modal or navigate to a details page
      console.log('Note content:', resource.content);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout backgroundVariant="gradient-purple">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout backgroundVariant="gradient-purple">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center text-destructive">
                Error loading study resources. Please try again later.
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (showAddForm) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-8">
          <div className="max-w-7xl mx-auto">
            <AddResourceForm 
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-[radial-gradient(circle_at_75%_25%,_theme(colors.purple.100)_0%,_transparent_50%)] animate-pulse"></div>
        </div>
        
        {/* Floating Decorative Elements */}
        <div className="absolute top-24 left-16 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-bounce animation-delay-0"></div>
        <div className="absolute top-32 right-24 w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-30 animate-bounce animation-delay-1500"></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-25 animate-bounce animation-delay-3000"></div>
        
        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-6">
                <BackToDashboard />
                <div className="space-y-2">
                  <h1 className="text-5xl leading-snug font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent animate-fade-in">
                    Study Resources
                  </h1>
                  <p className="text-xl text-gray-600 font-medium animate-fade-in animation-delay-200">
                    Explore and access your learning materials
                  </p>
                </div>
              </div>
              {isOwner && (
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="h-6 w-6 mr-3" />
                  Add Resource
                </Button>
              )}
            </div>

          {/* Want something else section for students */}
          {!isOwner && (
            <div className="mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2 flex items-center">
                        <MessageSquare className="h-6 w-6 mr-2" />
                        Want something else?
                      </h2>
                      <p className="text-blue-100 text-lg">
                        Can't find the book or resource you need? Request it from our collection and we'll try to add it for you!
                      </p>
                    </div>
                    <Link to="/request-resource">
                      <Button 
                        size="lg" 
                        variant="secondary"
                        className="text-lg px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 shadow-lg"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        Request Resource
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Resource Requests Manager for owners */}
          {isOwner && (
            <div className="mb-8">
              <ResourceRequestsManager />
            </div>
          )}

            {/* Enhanced Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources && resources.length > 0 ? (
                resources.map((resource, index) => (
                  <Card 
                    key={resource.id} 
                    className="group bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
                    
                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`text-sm px-4 py-1.5 border-0 font-medium ${
                          resource.resource_type === 'note' ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white' :
                          resource.resource_type === 'document' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                          'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        }`}>
                          {getResourceTypeIcon(resource.resource_type)}
                          {resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="text-sm px-3 py-1.5 bg-white/80 backdrop-blur-sm border-gray-200">
                          {resource.is_public ? '🌐 Public' : '🔒 Private'}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">{resource.title}</CardTitle>
                      <CardDescription className="text-lg text-gray-600 leading-relaxed">
                        {resource.description || 'No description available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-lg p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600 font-medium">Type:</span>
                          <span className="font-bold text-purple-600 capitalize">{resource.resource_type}</span>
                        </div>
                        <div className="flex items-center justify-between text-lg p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600 font-medium">Created:</span>
                          <span className="font-semibold text-gray-700">
                            {new Date(resource.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {resource.file_name && (
                          <div className="flex items-center justify-between text-lg p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600 font-medium">File:</span>
                            <span className="font-semibold text-sm truncate text-gray-700">{resource.file_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-3 pt-4">
                        <Button 
                          className="flex-1 text-lg py-3.5 bg-white border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300" 
                          variant="outline"
                          onClick={() => handleResourceAction(resource)}
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          {resource.resource_type === 'link' ? 'Open Link' : 'View'}
                        </Button>
                        {resource.file_url && resource.resource_type === 'document' && (
                          <Button 
                            className="flex-1 text-lg py-3.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => window.open(resource.file_url, '_blank')}
                          >
                            <Download className="h-5 w-5 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="bg-white/70 backdrop-blur-lg border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all duration-500 hover:shadow-xl">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-ping opacity-20"></div>
                        <BookOpen className="h-20 w-20 text-gray-400 relative z-10 animate-bounce" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-600 mt-6 mb-2">
                        {isOwner ? 'Add your first resource' : 'No resources available yet'}
                      </h3>
                      <p className="text-lg text-gray-500 text-center mb-8">
                        {isOwner ? 'Start building your resource collection' : 'Check back later for new learning materials'}
                      </p>
                      {isOwner && (
                        <Button 
                          size="lg" 
                          className="text-lg px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() => setShowAddForm(true)}
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Add Resource
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StudyResources;
