import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, HelpCircle, ChevronDown, ChevronRight, Headphones, BookOpen, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const SupportSection = () => {
  const { toast } = useToast();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page. You'll receive an email with instructions to create a new password."
    },
    {
      question: "How do I take a test?",
      answer: "Navigate to the 'Available Tests' section from your dashboard. Click on any active test to start. Make sure you have a stable internet connection and enough time to complete the test."
    },
    {
      question: "Can I retake a test?",
      answer: "Test retakes depend on the settings configured by your instructor. Some tests allow multiple attempts while others are one-time only. Check with your instructor for specific policies."
    },
    {
      question: "Where can I view my results?",
      answer: "All your test results are available in the 'My Results' section of your dashboard. You can view detailed scores, feedback, and performance analytics there."
    },
    {
      question: "How do I access study resources?",
      answer: "Click on 'Study Resources' from your dashboard to access all available materials including notes, documents, and supplementary content provided by your instructors."
    }
  ];

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

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setIsContactOpen(false);
    }, 1000);
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Support Center
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Need help? We're here to assist you 24/7 with any questions or issues you might have.
          </p>
        </div>

        {/* Support Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Live Chat */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg text-gray-800">Live Chat</CardTitle>
              <CardDescription>Get instant help from our support team</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge className="mb-3 bg-green-100 text-green-700 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Online
              </Badge>
              <a 
                href="https://www.chatbase.co/chatbot-iframe/yDJzkof7WYNoBCst-Qb-S" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center w-full border border-green-500 text-green-700 hover:bg-green-50 px-4 py-2 rounded-md transition-colors duration-200"
              >
                Start Chat
              </a>
            </CardContent>
          </Card>

          {/* Email Support */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg text-gray-800">Email Support</CardTitle>
              <CardDescription>Kindly send a detailed message outlining your concern</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge className="mb-3 bg-blue-100 text-blue-700 border border-blue-200">
                <Clock className="w-4 h-4 mr-1" />
                24h response
              </Badge>
              <Button 
                variant="outline" 
                className="w-full border-blue-500 text-blue-700 hover:bg-blue-50"
                onClick={() => setIsContactOpen(!isContactOpen)}
              >
                Contact Us
              </Button>
            </CardContent>
          </Card>

          {/* Phone Support */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg text-gray-800">Phone Support</CardTitle>
              <CardDescription>Speak directly with our team, we’re here to help</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge className="mb-3 bg-purple-100 text-purple-700 border border-purple-200">
                Mon-Fri 10AM-6PM
              </Badge>
              <a href="tel:+917987398516" className="block">
                <Button 
                  variant="outline" 
                  className="w-full border-purple-500 text-purple-700 hover:bg-purple-50"
                  onClick={() => toast({ title: "Call us!", description: "+91 7987398516" })}
                >
                  Call Now
                </Button>
              </a>
            </CardContent>
          </Card>


          {/* FAQ */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg text-gray-800">FAQ</CardTitle>
              <CardDescription>Find answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge className="mb-3 bg-orange-100 text-orange-700 border border-orange-200">
                <BookOpen className="w-4 h-4 mr-1" />
                Self-help
              </Badge>
              <Button 
                variant="outline" 
                className="w-full border-orange-500 text-orange-700 hover:bg-orange-50"
                onClick={() => setIsFAQOpen(!isFAQOpen)}
              >
                Browse FAQ
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        {isContactOpen && (
          <div className="mb-12 animate-fade-in">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 flex items-center">
                  <Mail className="h-6 w-6 mr-3 text-blue-600" />
                  Contact Us
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Name *
                      </label>
                      <Input
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="your.email@example.com"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Subject
                    </label>
                    <Input
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Message *
                    </label>
                    <Textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Please describe your issue or question in detail..."
                      className="w-full min-h-[120px]"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsContactOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ Section */}
        {isFAQOpen && (
          <div className="mb-12 animate-fade-in">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 flex items-center">
                  <HelpCircle className="h-6 w-6 mr-3 text-orange-600" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Quick answers to common questions about EduTest Pro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-800">{faq.question}</span>
                        {expandedFAQ === index ? (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-600" />
                        )}
                      </button>
                      {expandedFAQ === index && (
                        <div className="p-4 bg-white border-t border-gray-200 animate-fade-in">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Support Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-gray-600">Support Available</p>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">&lt; 2hr</div>
            <p className="text-gray-600">Average Response Time</p>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <p className="text-gray-600">Customer Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
