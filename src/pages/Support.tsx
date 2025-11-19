import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Mail, MessageCircle, Book, Phone } from 'lucide-react';
import { BackToDashboard } from '@/components/BackToDashboard';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Support = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setShowContactForm(false);
    }, 1000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "quizoasis.feedback@gmail.com",
      available: "24/7",
      action: () => setShowContactForm(!showContactForm)
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      contact: "Available in dashboard",
      available: "Mon-Fri, 9AM-6PM IST",
      action: () => window.open("https://www.chatbase.co/chatbot-iframe/yDJzkof7WYNoBCst-Qb-S", "_blank", "noopener,noreferrer")
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: "+91 7987398516",
      available: "Mon-Fri 10AM-6PM",
      action: () => toast({ title: "Call us!", description: "+91 7987398516" })
    }
  ];

  const faqs = [
    {
      question: "How do I create my first test?",
      answer: "Navigate to the 'Tests' section from your dashboard and click 'Create New Test'. Fill in the test details, add questions, and set your preferences. Your test will be ready to share with students."
    },
    {
      question: "Can students retake tests?",
      answer: "Test retake settings are controlled by the test creator. When creating or editing a test, you can specify whether students can retake it and how many attempts are allowed."
    },
    {
      question: "How do I track student performance?",
      answer: "Visit the 'Results' section to view detailed analytics for each test. You can see individual student scores, class averages, question-level analysis, and performance trends."
    },
    {
      question: "Is my data secure on Elysiar?",
      answer: "Yes, we implement industry-standard security measures including data encryption, secure authentication, and regular security audits. Read our Privacy Policy for more details."
    },
    {
      question: "How do I share study resources?",
      answer: "Go to the 'Study Resources' section, click 'Add Resource', and upload your materials. You can choose to make resources public or private to your students."
    }
  ];

  return (
    <Layout backgroundVariant="default">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <BackToDashboard />
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <HelpCircle className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              Support Center
            </h1>
            <p className="text-muted-foreground text-lg">
              We're here to help you make the most of Elysiar
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={method.action}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <method.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{method.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-3">{method.description}</p>
                <p className="font-medium text-primary mb-2">{method.contact}</p>
                <Badge variant="secondary" className="text-xs">
                  {method.available}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        {showContactForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name *</label>
                    <Input
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email *</label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Brief subject"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message *</label>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Your message..."
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <Button type="submit">Send Message</Button>
                  <Button type="button" variant="outline" onClick={() => setShowContactForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Frequently Asked Questions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-border/30 pb-6 last:border-b-0">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>For Educators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold mt-0.5">1</div>
                  <div>
                    <p className="font-medium">Set up your profile</p>
                    <p className="text-sm text-muted-foreground">Complete your educator profile with your teaching details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold mt-0.5">2</div>
                  <div>
                    <p className="font-medium">Create your first test</p>
                    <p className="text-sm text-muted-foreground">Use our intuitive test builder to create engaging assessments</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold mt-0.5">3</div>
                  <div>
                    <p className="font-medium">Share with students</p>
                    <p className="text-sm text-muted-foreground">Distribute test links and track student progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm font-bold mt-0.5">1</div>
                  <div>
                    <p className="font-medium">Join the platform</p>
                    <p className="text-sm text-muted-foreground">Create your student account to access tests and resources</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm font-bold mt-0.5">2</div>
                  <div>
                    <p className="font-medium">Take assessments</p>
                    <p className="text-sm text-muted-foreground">Access tests shared by your educators and submit responses</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm font-bold mt-0.5">3</div>
                  <div>
                    <p className="font-medium">Track your progress</p>
                    <p className="text-sm text-muted-foreground">View your results and access study materials</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium">Platform</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium">File Storage</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium">Authentication</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card>
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Our support team is dedicated to helping you succeed with Elysiar. 
              Don't hesitate to reach out with any questions, feedback, or suggestions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </Button>
              <a href="https://www.chatbase.co/chatbot-iframe/yDJzkof7WYNoBCst-Qb-S" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </Button>
              </a>

            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link to="/">
            <Button>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Support;
