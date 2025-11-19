
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Upload, FileText, Link, Loader2 } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  resource_type: z.enum(['note', 'document', 'link']),
  content: z.string().optional(),
  link_url: z.string().url().optional(),
  is_public: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface AddResourceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddResourceForm = ({ onSuccess, onCancel }: AddResourceFormProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      resource_type: 'note',
      content: '',
      link_url: '',
      is_public: false,
    },
  });

  const resourceType = form.watch('resource_type');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type (only PDFs for now)
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file.",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Auto-fill title from filename if empty
      if (!form.getValues('title')) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        form.setValue('title', fileName);
      }
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!profile) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('study-resources')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('study-resources')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const onSubmit = async (data: FormData) => {
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to create resources.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl = '';
      let fileName = '';

      // Handle file upload for document type
      if (data.resource_type === 'document' && selectedFile) {
        fileUrl = await uploadFile(selectedFile);
        fileName = selectedFile.name;
      }

      // Handle link URL for link type
      if (data.resource_type === 'link' && data.link_url) {
        fileUrl = data.link_url;
      }

      const { error } = await supabase
        .from('study_resources')
        .insert({
          title: data.title,
          description: data.description || null,
          resource_type: data.resource_type,
          content: data.content || null,
          file_url: fileUrl || null,
          file_name: fileName || null,
          is_public: data.is_public,
          owner_id: profile.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Study resource created successfully!",
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating resource:', error);
      toast({
        title: "Error",
        description: "Failed to create study resource. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Add Study Resource</CardTitle>
        <CardDescription>
          Create a new study resource to share with your students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter resource title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter resource description" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resource_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="note">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Note
                        </div>
                      </SelectItem>
                      <SelectItem value="document">
                        <div className="flex items-center">
                          <Upload className="h-4 w-4 mr-2" />
                          Document
                        </div>
                      </SelectItem>
                      <SelectItem value="link">
                        <div className="flex items-center">
                          <Link className="h-4 w-4 mr-2" />
                          Link
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {resourceType === 'note' && (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your note content" 
                        rows={6}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {resourceType === 'document' && (
              <div className="space-y-4">
                <Label>Upload Document (PDF)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {selectedFile && (
                    <div className="text-sm text-gray-600">
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </div>
                  )}
                </div>
              </div>
            )}

            {resourceType === 'link' && (
              <FormField
                control={form.control}
                name="link_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com" 
                        type="url"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_public"
                checked={form.watch('is_public')}
                onChange={(e) => form.setValue('is_public', e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="is_public" className="text-sm">
                Make this resource public (visible to all students)
              </Label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Resource
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddResourceForm;
