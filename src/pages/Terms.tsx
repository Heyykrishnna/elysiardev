import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Users, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackToDashboard } from '@/components/BackToDashboard';
import { Layout } from '@/components/Layout';

const Terms = () => {
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
                <FileText className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              Terms and Conditions
            </h1>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Welcome to Elysiar ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our educational assessment platform and services. By accessing or using Elysiar, you agree to be bound by these Terms.
              </p>
              <p>
                Elysiar is an innovative educational technology platform designed to empower educators and students through intelligent assessment tools, collaborative learning environments, and performance analytics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                2. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                By creating an account, accessing, or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not use our services.
              </p>
              <p>
                These Terms apply to all users of the service, including educators, students, administrators, and any other individuals who access or use the platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                3. User Accounts and Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>3.1 Account Creation</h4>
              <p>
                To use our services, you must create an account by providing accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              
              <h4>3.2 User Types</h4>
              <ul>
                <li><strong>Educators/Owners:</strong> Can create tests, manage assessments, and access student performance data</li>
                <li><strong>Students:</strong> Can take assessments, view their results, and access study resources</li>
              </ul>

              <h4>3.3 Account Security</h4>
              <p>
                You are responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Acceptable Use Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>4.1 Permitted Uses</h4>
              <p>You may use Elysiar for legitimate educational purposes, including:</p>
              <ul>
                <li>Creating and administering educational assessments</li>
                <li>Participating in tests and quizzes</li>
                <li>Accessing and sharing educational resources</li>
                <li>Tracking learning progress and performance</li>
              </ul>

              <h4>4.2 Prohibited Activities</h4>
              <p>You agree not to:</p>
              <ul>
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Share, distribute, or publish inappropriate content</li>
                <li>Attempt to gain unauthorized access to other user accounts</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use automated scripts or bots to access the service</li>
                <li>Share test answers or facilitate academic dishonesty</li>
                <li>Upload malicious code, viruses, or harmful content</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>5.1 Platform Content</h4>
              <p>
                The Elysiar platform, including its design, functionality, and underlying technology, is owned by us and protected by intellectual property laws.
              </p>

              <h4>5.2 User Content</h4>
              <p>
                You retain ownership of the educational content you create (tests, questions, resources). By using our platform, you grant us a license to host, store, and display your content as necessary to provide our services.
              </p>

              <h4>5.3 Respect for Others' Rights</h4>
              <p>
                You must respect the intellectual property rights of others and not upload or share copyrighted material without proper authorization.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>6.1 Data Collection</h4>
              <p>
                We collect and process personal information as described in our Privacy Policy. This includes account information, usage data, and educational performance metrics.
              </p>

              <h4>6.2 Educational Records</h4>
              <p>
                We understand the sensitive nature of educational data and maintain strict security measures to protect student information in compliance with applicable privacy laws.
              </p>

              <h4>6.3 Data Retention</h4>
              <p>
                We retain user data for as long as necessary to provide our services and comply with legal obligations. Users may request data deletion subject to our retention policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Service Availability and Modifications</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>7.1 Service Availability</h4>
              <p>
                We strive to maintain high service availability but cannot guarantee uninterrupted access. Scheduled maintenance and updates may temporarily affect service availability.
              </p>

              <h4>7.2 Service Modifications</h4>
              <p>
                We reserve the right to modify, update, or discontinue features of our service with reasonable notice to users.
              </p>

              <h4>7.3 Technical Requirements</h4>
              <p>
                Users are responsible for ensuring their devices and internet connections meet the minimum requirements for using our platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                To the maximum extent permitted by law, Elysiar shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
              </p>
              <p>
                Our total liability for any claims arising from these Terms or your use of our services shall not exceed the amount paid by you for our services in the twelve months preceding the claim.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>9.1 Termination by You</h4>
              <p>
                You may terminate your account at any time by contacting our support team or using the account deletion feature in your profile settings.
              </p>

              <h4>9.2 Termination by Us</h4>
              <p>
                We may suspend or terminate your account if you violate these Terms, engage in prohibited activities, or for other legitimate reasons with appropriate notice.
              </p>

              <h4>9.3 Effect of Termination</h4>
              <p>
                Upon termination, your access to the service will cease, and we may delete your account data in accordance with our data retention policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms shall be resolved through binding arbitration or in courts of competent jurisdiction.
              </p>
              <p>
                We encourage users to contact our support team first to resolve any issues or concerns before pursuing formal dispute resolution procedures.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Changes to These Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                We may update these Terms from time to time to reflect changes in our services, legal requirements, or business practices. We will provide notice of material changes through our platform or via email.
              </p>
              <p>
                Your continued use of our services after any changes to these Terms constitutes acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Copyright, Trademarks, and other Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
              At Elysiar, we respect the intellectual property of others just as much ours and, hence, if you believe that your intellectual property rights have been used in a way that gives rise to concerns of infringement of your intellectual property (including your copyrights and trademarks), then kindly write to us at legal@elysiar.com with complete details as required under Takedown Policy. If Elysiar has knowledge of or has any reason to believe that any User-generated Content on the Platform violates the intellectual property rights of Elysiar or other Users, then we reserve the right to remove access to such content in accordance with takedown practices specified in Takedown Policy.
              </p>
              <p>
              If Elysiar has knowledge of or has any reason to believe that any User-generated Content on the Platform violates the intellectual property rights of Elysiar or other Users, then we reserve the right to remove access to such content in accordance with takedown practices specified in Takedown Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Claims Against User-generated Content</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
              Elysiar does not monitor or have any control over or does not warrant, and makes no claim or representation regarding the accuracy, completeness, or usefulness of any User-generated Content provided on the Platform by its Users and accepts no responsibility for reviewing changes or updates to, or the quality, content, policies, nature or reliability of, such User-generated Content. Elysiar disclaims all liability and responsibility arising from any reliance placed on such materials by you. All statements and/or opinions expressed in these materials, and all articles and responses to questions and other content, other than the Elysiar Content, are solely the responsibility of the User providing those materials.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                If you have any questions about these Terms and Conditions, please contact us through our support channel or email us at legal@quizoasis.com.
              </p>
              <p>
                For general support inquiries, please use the support section available in your dashboard or visit our help center.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            These Terms and Conditions are effective as of {lastUpdated} and apply to all users of Elysiar.
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

export default Terms;