import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail, Lock, User, ArrowRight, Check, BookOpen, Chrome } from 'lucide-react';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { signIn, signUp, resendVerification } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error, needsEmailVerification } = await signUp(email, password, fullName);
    
    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      });
    } else if (needsEmailVerification) {
      setVerificationEmail(email);
      setShowEmailVerification(true);
      toast({
        title: "Check your email!",
        description: "We've sent you a verification link. Please check your inbox and click the link to verify your account."
      });
    } else {
      toast({
        title: "Account created!",
        description: "Your account has been created successfully."
      });
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      // Get the current domain to construct proper redirect URL
      const currentDomain = window.location.origin;
      const redirectUrl = `${currentDomain}/auth/callback`;
      
      console.log('OAuth redirect URL:', redirectUrl);
      console.log('Current domain:', currentDomain);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }
      
      // Don't set loading to false here as the user will be redirected
      console.log('OAuth initiated successfully:', data);
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = "Failed to sign in with Google";
      
      // Handle specific OAuth errors
      if (error.message?.includes('provider is not enabled')) {
        errorMessage = "Google sign-in is not configured in Supabase. Please contact support.";
      } else if (error.message?.includes('validation_failed')) {
        errorMessage = "Google authentication configuration is invalid.";
      } else if (error.message?.includes('unauthorized_client')) {
        errorMessage = "OAuth client configuration is incorrect.";
      } else if (error.message?.includes('redirect_uri_mismatch')) {
        errorMessage = "OAuth redirect URL mismatch. Please check Google Console configuration.";
      } else if (error.message?.includes('access_denied')) {
        errorMessage = "Access denied. Please try again and accept the permissions.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Google Sign-in Error",
        description: errorMessage,
        variant: "destructive",
        className: "animate-shake",
      });
      setIsLoading(false);
    }
  };


  const handleResendVerification = async () => {
    setIsLoading(true);
    
    const { error } = await resendVerification(verificationEmail);
    
    if (error) {
      toast({
        title: "Failed to resend",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Email sent!",
        description: "We've sent another verification email to your inbox."
      });
    }
    
    setIsLoading(false);
  };

  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-white">
              Check Your Email
            </CardTitle>
            <p className="text-sm text-zinc-400">
              We've sent a verification link to<br />
              <span className="text-white font-medium">{verificationEmail}</span>
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Button 
              onClick={handleResendVerification}
              variant="outline" 
              className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend verification email
            </Button>
            
            <Button 
              onClick={() => {
                setShowEmailVerification(false);
                setVerificationEmail('');
              }}
              variant="ghost" 
              className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Hero section */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          <div className="relative w-full aspect-[8/10] rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('https://i.pinimg.com/1200x/ad/b3/51/adb351a26cbc0ae5d736d244a8a51f8f.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(4px)"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-8 left-8 space-y-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                  <img src='logo-Elysiar.jpeg' className='rounded-lg'/>
                </div>
              <h2 className="text-3xl font-bold text-white">
                Enter Your Campus World
              </h2>
              <p className="text-white/90 text-sm max-w-sm">
                Experience your all-in-one campus dashboard that brings everything together for students, teachers, and institutions. From managing attendance and taking interactive tests to exploring a vast library of learning resources, events, and academic updates, everything you need for a smarter and more connected campus life is right here.
              </p>
            </div>
          </div>

          {/* Benefits list */}
          <div className="space-y-4">
            {[
              'Sign up with Google account',
              'Create your personalized campus account',
              'Access tests, attendance, and learning tools instantly',
              'Empower your learning with an intelligent dashboard'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-zinc-400 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
            <CardHeader className="space-y-6 pb-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <img src='logo-Elysiar.jpeg' className='rounded-lg'/>
                </div>
                <span className="text-white font-semibold text-lg gap-4">Elysiar</span>
              </div>
              
              <CardTitle className="text-2xl font-semibold text-white">
                Sign Up Account
              </CardTitle>
              <p className="text-sm text-zinc-400">
                Set up your campus account to explore resources
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-zinc-800 p-1">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-zinc-700 text-zinc-400 data-[state=active]:text-white"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-zinc-700 text-zinc-400 data-[state=active]:text-white"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs text-zinc-400 font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          required 
                          placeholder="mail@abc.com"
                          className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs text-zinc-400 font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input 
                          id="password" 
                          name="password" 
                          type="password" 
                          required 
                          placeholder="Min. 8 characters"
                          className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-white text-black hover:bg-zinc-200 font-medium" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="relative animate-slide-up" style={{ animationDelay: "0.5s" }}>
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    
                    {/* Social Auth Buttons */}
                    <div className="grid grid-cols-1 gap-3 animate-slide-up text-black" style={{ animationDelay: "0.6s" }}>
                      <Button 
                        type="button"
                        variant="outline" 
                        className="h-11"
                        disabled={isLoading}
                        onClick={handleGoogleSignIn}
                      >
                        <svg viewBox="0 0 32 32" className="w-4 h-4 mr-2" fill="#000000" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23.75,16A7.7446,7.7446,0,0,1,8.7177,18.6259L4.2849,22.1721A13.244,13.244,0,0,0,29.25,16" fill="#00ac47"></path>
                          <path d="M23.75,16a7.7387,7.7387,0,0,1-3.2516,6.2987l4.3824,3.5059A13.2042,13.2042,0,0,0,29.25,16" fill="#4285f4"></path>
                          <path d="M8.25,16a7.698,7.698,0,0,1,.4677-2.6259L4.2849,9.8279a13.177,13.177,0,0,0,0,12.3442l4.4328-3.5462A7.698,7.698,0,0,1,8.25,16Z" fill="#ffba00"></path>
                          <path d="M16,8.25a7.699,7.699,0,0,1,4.558,1.4958l4.06-3.7893A13.2152,13.2152,0,0,0,4.2849,9.8279l4.4328,3.5462A7.756,7.756,0,0,1,16,8.25Z" fill="#ea4435"></path>
                          <path d="M29.25,15v1L27,19.5H16.5V14H28.25A1,1,0,0,1,29.25,15Z" fill="#4285f4"></path>
                        </svg>
                        Google
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs text-zinc-400 font-medium">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input 
                          id="fullName" 
                          name="fullName" 
                          type="text" 
                          placeholder="Enter your full name"
                          className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-xs text-zinc-400 font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input 
                          id="signup-email" 
                          name="email" 
                          type="email" 
                          required 
                          placeholder="mail@abc.com"
                          className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-xs text-zinc-400 font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input 
                          id="signup-password" 
                          name="password" 
                          type="password" 
                          required 
                          placeholder="Min. 8 characters"
                          minLength={6}
                          className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-xs text-zinc-400 font-medium">
                        Re-enter Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input 
                          id="confirm-password" 
                          name="confirmPassword" 
                          type="password" 
                          placeholder="Min. 8 characters"
                          className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-white text-black hover:bg-zinc-200 font-medium" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Sign Up
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="relative animate-slide-up" style={{ animationDelay: "0.5s" }}>
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    
                    {/* Social Auth Buttons */}
                    <div className="grid grid-cols-1 gap-3 animate-slide-up text-black" style={{ animationDelay: "0.6s" }}>
                      <Button 
                        type="button"
                        variant="outline" 
                        className="h-11"
                        disabled={isLoading}
                        onClick={handleGoogleSignIn}
                      >
                        <svg viewBox="0 0 32 32" className="w-4 h-4 mr-2" fill="#000000" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23.75,16A7.7446,7.7446,0,0,1,8.7177,18.6259L4.2849,22.1721A13.244,13.244,0,0,0,29.25,16" fill="#00ac47"></path>
                          <path d="M23.75,16a7.7387,7.7387,0,0,1-3.2516,6.2987l4.3824,3.5059A13.2042,13.2042,0,0,0,29.25,16" fill="#4285f4"></path>
                          <path d="M8.25,16a7.698,7.698,0,0,1,.4677-2.6259L4.2849,9.8279a13.177,13.177,0,0,0,0,12.3442l4.4328-3.5462A7.698,7.698,0,0,1,8.25,16Z" fill="#ffba00"></path>
                          <path d="M16,8.25a7.699,7.699,0,0,1,4.558,1.4958l4.06-3.7893A13.2152,13.2152,0,0,0,4.2849,9.8279l4.4328,3.5462A7.756,7.756,0,0,1,16,8.25Z" fill="#ea4435"></path>
                          <path d="M29.25,15v1L27,19.5H16.5V14H28.25A1,1,0,0,1,29.25,15Z" fill="#4285f4"></path>
                        </svg>
                        Google
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
              
              <div className="text-center text-xs text-zinc-500">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="text-zinc-400 hover:text-white underline">
                  Terms
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-zinc-400 hover:text-white underline">
                  Privacy Policy
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;