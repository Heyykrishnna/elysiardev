import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquareWarning, ArrowLeft, Send, Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Complaints = () => {
  const { profile } = useAuth();
  const { complaints, isLoading, createComplaint, updateComplaintStatus, isCreating } = useComplaints();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [revealPassword, setRevealPassword] = useState('');
  const [showStudentDetails, setShowStudentDetails] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    createComplaint({
      title,
      description,
      category,
      is_anonymous: isAnonymous,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('general');
    setIsAnonymous(false);
  };

  const handleRevealDetails = (complaintId: string) => {
    const correctPassword = 'admin123'; // In a real app, this should be more secure
    if (revealPassword === correctPassword) {
      setShowStudentDetails(complaintId);
      setRevealPassword('');
      toast.success('Student details revealed');
    } else {
      toast.error('Incorrect password');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
      case 'resolved': return 'bg-green-500/20 text-green-700 border-green-300';
      case 'investigating': return 'bg-blue-500/20 text-blue-700 border-blue-300';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-purple-500/20 text-purple-700 border-purple-300';
      case 'harassment': return 'bg-red-500/20 text-red-700 border-red-300';
      case 'facility': return 'bg-orange-500/20 text-orange-700 border-orange-300';
      case 'teacher': return 'bg-indigo-500/20 text-indigo-700 border-indigo-300';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-purple-600 hover:text-purple-700 transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl">
                  <MessageSquareWarning className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Complaint System
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {profile?.role === 'owner' ? 'Manage student complaints' : 'Submit your concerns safely'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Complaint Form (Students Only) */}
          {profile?.role !== 'owner' && (
            <div className="lg:col-span-1">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl shadow-purple-500/10">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Submit Complaint
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Report issues or incidents that need attention <br />
                    Your voice matters. Report any concerns safely.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Title *
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Brief description of the issue"
                        className="border-purple-200 focus:border-purple-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Category *
                      </label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="border-purple-200 focus:border-purple-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="academic">Academic Issue</SelectItem>
                          <SelectItem value="harassment">Harassment</SelectItem>
                          <SelectItem value="facility">Facility Problem</SelectItem>
                          <SelectItem value="teacher">Teacher Related</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Description *
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide detailed information about your complaint..."
                        className="border-purple-200 focus:border-purple-400 min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymous"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                      />
                      <label htmlFor="anonymous" className="text-sm text-gray-700 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Submit anonymously
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      {isCreating ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                  </form>
                </CardContent>
                </Card>
            </div>
          )}

          {/* Complaints List */}
          <div className={profile?.role === 'owner' ? 'lg:col-span-3' : 'lg:col-span-2'}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  {profile?.role === 'owner' ? 'All Complaints' : 'Your Complaints'}
                </h2>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {complaints.length} total
                </Badge>
              </div>

              {complaints.length === 0 ? (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-12 text-center">
                    <MessageSquareWarning className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">No complaints yet</h3>
                    <p className="text-gray-400">
                      {profile?.role === 'owner' 
                        ? 'No complaints have been submitted by students.' 
                        : 'You haven\'t submitted any complaints yet.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <Card key={complaint.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-gray-800 mb-2">
                              {complaint.title}
                            </CardTitle>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge className={getCategoryColor(complaint.category)}>
                                {complaint.category}
                              </Badge>
                              <Badge className={getStatusColor(complaint.status)}>
                                {complaint.status}
                              </Badge>
                              {complaint.is_anonymous && (
                                <Badge variant="outline" className="bg-gray-50 text-gray-600">
                                  Anonymous
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Submitted on {new Date(complaint.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          {profile?.role === 'owner' && (
                            <div className="flex gap-2">
                              <Select
                                value={complaint.status}
                                onValueChange={(status) => updateComplaintStatus({ id: complaint.id, status })}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="investigating">Investigating</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {!complaint.is_anonymous && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      {showStudentDetails === complaint.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Reveal Student Details
                                      </DialogTitle>
                                      <DialogDescription>
                                        Enter the admin password to reveal student information for this complaint.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <Input
                                        type="password"
                                        placeholder="Enter admin password"
                                        value={revealPassword}
                                        onChange={(e) => setRevealPassword(e.target.value)}
                                      />
                                      <Button
                                        onClick={() => handleRevealDetails(complaint.id)}
                                        className="w-full"
                                      >
                                        Reveal Details
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {complaint.description}
                        </p>
                        
                        {profile?.role === 'owner' && showStudentDetails === complaint.id && !complaint.is_anonymous && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                            <h4 className="font-medium text-yellow-800 mb-2">Student Information:</h4>
                            <p className="text-sm text-yellow-700">Student ID: {complaint.student_id}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;
