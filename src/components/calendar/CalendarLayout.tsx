import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  Filter,
  Settings,
  Grid,
  List,
  Clock,
  TableProperties,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ViewType, CalendarFilter } from '@/types/calendar';
import { format } from 'date-fns';
import { BackToDashboard } from '@/components/BackToDashboard';

interface CalendarLayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  currentDate: Date;
  onViewChange: (view: ViewType) => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onCreateEvent: () => void;
  onSettings?: () => void;
  filter: CalendarFilter;
  onFilterChange: (filter: CalendarFilter) => void;
  eventCount: number;
  isOwner?: boolean;
}

const VIEW_CONFIGS = {
  month: { icon: Grid, label: 'Month', shortcut: 'M' },
  week: { icon: LayoutGrid, label: 'Week', shortcut: 'W' },
  day: { icon: Calendar, label: 'Day', shortcut: 'D' },
  agenda: { icon: List, label: 'Agenda', shortcut: 'A' },
  timeline: { icon: Clock, label: 'Timeline', shortcut: 'T' },
  year: { icon: TableProperties, label: 'Year', shortcut: 'Y' },
};

export const CalendarLayout: React.FC<CalendarLayoutProps> = ({
  children,
  currentView,
  currentDate,
  onViewChange,
  onNavigate,
  onCreateEvent,
  onSettings,
  filter,
  onFilterChange,
  eventCount,
  isOwner = false,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(!!filter.search_query);
  const [searchQuery, setSearchQuery] = useState(filter.search_query || '');

  const getDateRange = () => {
    switch (currentView) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        return `Week of ${format(currentDate, 'MMM dd, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM dd, yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return format(currentDate, 'MMM yyyy');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onFilterChange({ ...filter, search_query: query || undefined });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
    onFilterChange({ ...filter, search_query: undefined });
  };

  // Sync internal state with filter prop changes
  React.useEffect(() => {
    setSearchQuery(filter.search_query || '');
    setIsSearchOpen(!!filter.search_query);
  }, [filter.search_query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-primary/2">
      <div className="h-full flex flex-col">
        {/* Enhanced Header */}
        <motion.header 
          className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="mt-2 ">
                    <BackToDashboard />
                  </div>
              {/* Left Section - Logo & Title */}
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <div className="w-10 h-10 text-black bg-black rounded-xl flex items-center justify-center shadow-lg">
                      <Calendar className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: eventCount > 0 ? 1 : 0 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <span className="text-xs text-white font-bold">
                        {eventCount > 9 ? '9+' : eventCount}
                      </span>
                    </motion.div>
                  </div>

                  
                  <div className="hidden sm:block">
                    <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-black">
                      Calendar
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Smart scheduling made simple
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Center Section - Date Navigation */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate('today')}
                      className="hidden sm:flex h-8 px-3 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    >
                      Today
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Go to today</TooltipContent>
                </Tooltip>

                <div className="flex items-center space-x-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('prev')}
                        className="h-8 w-8 p-0 hover:bg-primary/10 group"
                      >
                        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Previous</TooltipContent>
                  </Tooltip>

                  <div className="min-w-[160px] sm:min-w-[200px] text-center">
                    <motion.h2 
                      key={getDateRange()}
                      className="text-lg sm:text-xl font-semibold text-foreground"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {getDateRange()}
                    </motion.h2>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('next')}
                        className="h-8 w-8 p-0 hover:bg-primary/10 group"
                      >
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Next</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center space-x-2">
                {/* Search */}
                <AnimatePresence>
                  {isSearchOpen ? (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center"
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search events..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          onBlur={() => !searchQuery && clearSearch()}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              clearSearch();
                            }
                          }}
                          autoFocus
                          className="w-[200px] sm:w-[250px] pl-10 pr-8 h-8 bg-background/80 backdrop-blur border-border/50"
                        />
                        {searchQuery && (
                          <button
                            onClick={clearSearch}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsSearchOpen(true)}
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Search events</TooltipContent>
                    </Tooltip>
                  )}
                </AnimatePresence>

                {/* Filter */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-primary/10 relative"
                    >
                      <Filter className="h-4 w-4" />
                      {(filter.event_types?.length || filter.priorities?.length) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Filter events</TooltipContent>
                </Tooltip>

                {/* Create Event */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onCreateEvent}
                      size="sm"
                      className="h-8 px-3 hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-primary-foreground"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      <span className="hidden sm:inline">Create</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create new event (Ctrl+N)</TooltipContent>
                </Tooltip>

                {/* Settings */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onSettings}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* View Switcher */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center space-x-1 bg-muted/30 rounded-lg p-1">
                {(Object.keys(VIEW_CONFIGS) as ViewType[]).map((view) => {
                  const config = VIEW_CONFIGS[view];
                  const Icon = config.icon;
                  const isActive = currentView === view;
                  
                  return (
                    <Tooltip key={view}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => onViewChange(view)}
                          className={cn(
                            'h-8 px-2 sm:px-3 transition-all duration-200 relative',
                            isActive 
                              ? 'bg-background shadow-sm text-foreground' 
                              : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4 sm:mr-1.5" />
                          <span className="hidden sm:inline text-xs font-medium">
                            {config.label}
                          </span>
                          {isActive && (
                            <motion.div
                              layoutId="activeView"
                              className="absolute inset-0 bg-background rounded-md -z-10 shadow-sm"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {config.label} view ({config.shortcut})
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {eventCount} events
                </Badge>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden mr-20 ml-20">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
    </div>
  );
};