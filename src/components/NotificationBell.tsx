import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const NotificationBell = ({ size = 'lg' }: { size?: 'sm' | 'lg' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useAuth();
  const {
    newTestsCount,
    notifications,
    clearNotifications,
    markAsRead
  } = useNotifications();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('NotificationBell - Profile:', profile);
    console.log('NotificationBell - Notifications:', notifications);
    console.log('NotificationBell - New tests count:', newTestsCount);
  }, [profile, notifications, newTestsCount]);
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.type === 'new_test') {
      navigate('/tests');
    }
    setIsOpen(false);
  };
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };
  const handleBellClick = () => {
    console.log('Bell clicked! Current isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  const buttonSizes = {
    sm: "w-10 h-10",
    lg: "w-20 h-20"
  };
  
  const iconSizes = {
    sm: "h-4 w-4",
    lg: "h-8 w-8"
  };
  
  const badgeSizes = {
    sm: "h-5 w-5 text-xs -top-2 -right-2",
    lg: "h-8 w-8 text-xs -top-4 -right-4"
  };

  return <div className="relative">
      <Button 
        variant="ghost" 
        size={size === 'sm' ? 'sm' : 'lg'}
        onClick={handleBellClick}
        className={`relative ${buttonSizes[size]} rounded-full bg-transparent hover:bg-muted/10 transform hover:scale-110 transition-all duration-300 border-0 group`}
      >
        <div className="relative">
          <Bell className={`${iconSizes[size]} text-foreground hover:text-primary transition-colors duration-300`} />
        </div>
        {newTestsCount > 0 && <Badge variant="destructive" className={`absolute ${badgeSizes[size]} rounded-full p-0 flex items-center justify-center font-bold bg-destructive text-destructive-foreground border-2 border-background shadow-lg`}>
            {newTestsCount > 9 ? '9+' : newTestsCount}
          </Badge>}
      </Button>

      {isOpen && <div className="fixed top-16 right-48 w-[420px] z-[9999] animate-scale-in" style={{ transform: 'none' }}>
          <Card className="shadow-float-heavy border border-border rounded-3xl overflow-hidden backdrop-blur-xl bg-card">
            <CardHeader className="pb-4 bg-gradient-soft border-b border-border backdrop-blur-sm relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-30">
              </div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-elegant rounded-2xl flex items-center justify-center shadow-lg">
                    <Bell className="h-6 w-6 text-primary-foreground animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Notifications
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">Stay updated with latest news</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && <Button variant="ghost" size="sm" onClick={clearNotifications} className="text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 hover:scale-105">
                      Clear all
                    </Button>}
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300 hover:scale-105">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="max-h-[450px] overflow-y-auto p-0 relative bg-card">
              {notifications.length === 0 ? <div className="text-center py-16 px-8 relative">
                  <div className="w-20 h-20 bg-gradient-elegant rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Bell className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-foreground font-bold text-xl mb-2">All caught up!</p>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      No new notifications to show.<br />
                      <span className="text-sm font-medium">Check back later for updates</span>
                    </p>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-6 right-8 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
                  <div className="absolute bottom-8 left-8 w-2 h-2 bg-gradient-to-r from-accent to-destructive rounded-full animate-pulse opacity-70"></div>
                </div> : <div className="divide-y divide-border">
                  {notifications.map((notification, index) => <div key={notification.id} onClick={() => handleNotificationClick(notification)} className="p-6 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 cursor-pointer transition-all duration-500 border-l-4 border-transparent hover:border-primary group animate-fade-in relative overflow-hidden" style={{
              animationDelay: `${index * 150}ms`
            }}>
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-500"></div>
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-3 h-3 rounded-full shadow-lg ${notification.type === 'new_test' ? 'bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse' : 'bg-gradient-to-r from-primary to-accent animate-pulse'}`}></div>
                            <p className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                              {notification.title}
                            </p>
                          </div>
                          <p className="text-base text-muted-foreground leading-relaxed font-medium group-hover:text-foreground transition-colors duration-300 pl-6">
                            {notification.description}
                          </p>
                          <div className="flex items-center justify-between mt-4 pl-6">
                            <p className="text-sm text-muted-foreground font-semibold">
                              {formatTime(notification.timestamp)}
                            </p>
                            <Badge variant="secondary" className={`text-sm px-3 py-1 rounded-full font-semibold shadow-sm ${notification.type === 'new_test' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                              {notification.type === 'new_test' ? '📝 New Test' : '📢 Announcement'}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-4 h-4 bg-gradient-elegant rounded-full ml-6 mt-2 flex-shrink-0 group-hover:scale-125 group-hover:shadow-lg transition-all duration-300 shadow-sm"></div>
                      </div>
                      
                      {/* Interactive hover line */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500"></div>
                    </div>)}
                </div>}
            </CardContent>
          </Card>
        </div>}
    </div>;
};
export default NotificationBell;