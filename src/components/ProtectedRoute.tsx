
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/auth/AuthPage';
import EnhancedLoadingScreen from '@/components/EnhancedLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [mandatoryLoadingComplete, setMandatoryLoadingComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMandatoryLoadingComplete(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading || !mandatoryLoadingComplete) {
    return <EnhancedLoadingScreen />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
