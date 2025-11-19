import React from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  backgroundVariant?: 'default' | 'gradient-blue' | 'gradient-purple' | 'gradient-orange' | 'gradient-green' | 'minimal';
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  className = "",
  backgroundVariant = 'default'
}) => {
  const getBackgroundClasses = () => {
    switch (backgroundVariant) {
      case 'gradient-blue':
        return 'min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
      case 'gradient-purple':
        return 'min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50';
      case 'gradient-orange':
        return 'min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50';
      case 'gradient-green':
        return 'min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50';
      case 'minimal':
        return 'min-h-screen bg-background text-foreground';
      default:
        return 'min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10';
    }
  };

  return (
    <div className={`${getBackgroundClasses()} ${className} relative transition-colors duration-300`}>
      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/3 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>
    </div>
  );
};