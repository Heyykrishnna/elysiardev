import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, Database, FileText, Lock } from 'lucide-react';
import { BackToDashboard } from '@/components/BackToDashboard';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Privacy = () => {
  const lastUpdated = "January 2025";

  return (
    <Layout backgroundVariant="default">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <BackToDashboard />
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-primary" />
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                At Elysiar, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our educational assessment platform.
              </p>
              <p>
                We understand the importance of privacy in educational environments and comply with applicable privacy laws and regulations to protect student and educator data.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-primary" />
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>2.1 Account Information</h4>
              <ul>
                <li>Name and email address</li>
                <li>User role (educator or student)</li>
                <li>Profile information you choose to provide</li>
              </ul>

              <h4>2.2 Educational Data</h4>
              <ul>
                <li>Test and quiz responses</li>
                <li>Performance scores and analytics</li>
                <li>Study resources and materials you upload</li>
                <li>Learning progress and completion data</li>
              </ul>

              <h4>2.3 Usage Information</h4>
              <ul>
                <li>Platform usage patterns and preferences</li>
                <li>Device and browser information</li>
                <li>IP address and location data (general)</li>
                <li>Session data and login information</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>3.1 Educational Services</h4>
              <ul>
                <li>Provide access to tests, quizzes, and study materials</li>
                <li>Generate performance analytics and progress reports</li>
                <li>Enable collaborative learning features</li>
                <li>Personalize your learning experience</li>
              </ul>

              <h4>3.2 Platform Improvement</h4>
              <ul>
                <li>Analyze usage patterns to improve our services</li>
                <li>Develop new features and functionality</li>
                <li>Ensure platform security and prevent abuse</li>
                <li>Provide customer support and technical assistance</li>
              </ul>

              <h4>3.3 Communication</h4>
              <ul>
                <li>Send important service updates and notifications</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Share educational tips and best practices (with consent)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>4. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>4.1 We Do Not Sell Your Data</h4>
              <p>
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>

              <h4>4.2 Limited Sharing</h4>
              <p>We may share your information only in these circumstances:</p>
              <ul>
                <li>With your explicit consent</li>
                <li>With educational institutions you're affiliated with (if applicable)</li>
                <li>With service providers who help us operate our platform (under strict confidentiality agreements)</li>
                <li>When required by law or to protect our rights and safety</li>
              </ul>

              <h4>4.3 Educational Institution Access</h4>
              <p>
                If you're using Elysiar through an educational institution, that institution may have access to your educational performance data in accordance with their policies and applicable privacy laws.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2 text-primary" />
                5. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>5.1 Security Measures</h4>
              <p>We implement industry-standard security measures including:</p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and monitoring</li>
                <li>Employee training on data protection practices</li>
              </ul>

              <h4>5.2 Data Breach Response</h4>
              <p>
                In the unlikely event of a data breach, we will promptly notify affected users and relevant authorities as required by law, and take immediate steps to secure the platform and prevent further unauthorized access.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>6. Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>6.1 Access and Control</h4>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Update or correct your data</li>
                <li>Delete your account and associated data</li>
                <li>Export your educational data</li>
                <li>Opt out of non-essential communications</li>
              </ul>

              <h4>6.2 Student Privacy</h4>
              <p>
                We are committed to protecting student privacy and comply with applicable educational privacy laws. Students under 18 should have parental consent before using our platform.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>7. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Educational data may be retained for academic record-keeping purposes as required by educational institutions.
              </p>
              <p>
                When you delete your account, we will delete your personal information within 30 days, except where retention is required by law or for legitimate business purposes.
              </p>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>8. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze platform usage. You can control cookie settings through your browser preferences.
              </p>
              <p>
                Essential cookies are necessary for the platform to function properly, while optional cookies help us improve our services and may be disabled without affecting core functionality.
              </p>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>9. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Your information may be processed and stored in countries other than your own. We ensure appropriate safeguards are in place to protect your data when it is transferred internationally.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle>10. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes through our platform or via email.
              </p>
              <p>
                We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul>
                <li>Email: privacy@quizoasis.com</li>
                <li>Through the support section in your dashboard</li>
                <li>Via our help center</li>
              </ul>
              <p>
                We are committed to addressing your privacy concerns promptly and transparently.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            This Privacy Policy is effective as of {lastUpdated} and applies to all users of Elysiar.
          </p>
          <div className="mt-4">
            <Link to="/">
              <Button>
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;