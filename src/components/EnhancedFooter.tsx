import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, BookOpen, Users, Award, TrendingUp } from 'lucide-react';

const EnhancedFooter = () => {
  const currentYear = new Date().getFullYear();
  
  const features = [
    { icon: BookOpen, text: "Smart Learning" },
    { icon: Users, text: "Collaborative" },
    { icon: Award, text: "Achievement Focused" },
    { icon: TrendingUp, text: "Performance Insights" }
  ];

  return (
    <footer className="relative from-background via-accent/5 to-secondary/10 border-t border-border/50 overflow-hidden bg-black">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-0 right-1/3 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-secondary/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-white">
        {/* Main footer content */}
        <div className="py-12">
          {/* Top section with features */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-white">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-2 text-muted-foreground transition-colors duration-300 group text-white"
                >
                  <feature.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Brand section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="ml-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-white">
                  Elysiar
                </h3>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed text-white">
              Transforming education through intelligent assessment technology. 
              <br className="hidden sm:block" />
              Where learning meets innovation in {currentYear}.
            </p>
            
          </div>

          {/* Stats or achievements section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">--</div>
              <div className="text-sm text-muted-foreground text-white">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">--</div>
              <div className="text-sm text-muted-foreground text-white">Tests Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">--%</div>
              <div className="text-sm text-muted-foreground text-white">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">--★</div>
              <div className="text-sm text-muted-foreground text-white">User Rating</div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/30 mb-6"></div>

          {/* Bottom section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-muted-foreground text-white">
                © {currentYear} Elysiar. Empowering minds, one question at a time.
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <Link to="/privacy" className="hover:text-foreground cursor-pointer transition-colors text-white">
                  Privacy
                </Link>
                <Link to="/terms" className="hover:text-foreground cursor-pointer transition-colors text-white">
                  Terms
                </Link>
                <Link to="/support" className="hover:text-foreground cursor-pointer transition-colors text-white">
                  Support
                </Link>
                <Link to="https://forms.gle/2RKCzkY6U1gfzefb9" className="hover:text-foreground cursor-pointer transition-colors text-white">
                  Feedback
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground text-white">
              <span>Version 3.1.5</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse text-white"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-1/4 left-8 w-1 h-1 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-3/4 right-12 w-1 h-1 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '2.5s' }}></div>
    </footer>
  );
};

export default EnhancedFooter;
