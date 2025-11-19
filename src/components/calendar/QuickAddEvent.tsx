import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Plus, Calendar, Clock, Type, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EVENT_TYPE_CONFIG, EVENT_COLORS } from '@/types/calendar';
import { useEventOperations } from '@/hooks/useCalendar';
import { format, parse, isValid, addDays } from 'date-fns';

interface QuickAddEventProps {
  defaultDate?: string;
  onClose?: () => void;
  className?: string;
}

// Natural language parsing patterns
const TIME_PATTERNS = [
  /at (\d{1,2}):(\d{2})\s*(am|pm)?/i,
  /at (\d{1,2})\s*(am|pm)/i,
  /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
  /(\d{1,2})\s*(am|pm)/i,
];

const DATE_PATTERNS = [
  /tomorrow/i,
  /next week/i,
  /(\d{1,2})\/(\d{1,2})/,
  /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})/i,
];

const EVENT_TYPE_KEYWORDS = {
  class: ['class', 'lecture', 'course', 'lesson'],
  exam: ['exam', 'test', 'quiz', 'assessment'],
  assignment: ['assignment', 'homework', 'project', 'due'],
  meeting: ['meeting', 'call', 'conference', 'discussion'],
  holiday: ['holiday', 'vacation', 'break', 'off'],
  personal: ['personal', 'appointment', 'doctor', 'dentist'],
  work: ['work', 'job', 'office', 'business'],
};

export const QuickAddEvent: React.FC<QuickAddEventProps> = ({
  defaultDate,
  onClose,
  className,
}) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [parsedEvent, setParsedEvent] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { quickAdd } = useEventOperations();

  const parseInput = useCallback((text: string) => {
    if (!text.trim()) {
      setParsedEvent(null);
      return;
    }

    const parsed: any = {
      title: text,
      date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
      time: undefined,
      type: 'other',
      duration: 60,
    };

    // Extract time
    for (const pattern of TIME_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const ampm = match[3] || match[match.length - 1];

        if (ampm?.toLowerCase() === 'pm' && hours !== 12) hours += 12;
        if (ampm?.toLowerCase() === 'am' && hours === 12) hours = 0;

        parsed.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        parsed.title = text.replace(pattern, '').trim();
        break;
      }
    }

    // Extract date
    for (const pattern of DATE_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        if (pattern.source.includes('tomorrow')) {
          parsed.date = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        } else if (pattern.source.includes('next week')) {
          parsed.date = format(addDays(new Date(), 7), 'yyyy-MM-dd');
        }
        // Add more date parsing logic here
        parsed.title = text.replace(pattern, '').trim();
        break;
      }
    }

    // Detect event type
    const lowerText = text.toLowerCase();
    for (const [type, keywords] of Object.entries(EVENT_TYPE_KEYWORDS)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        parsed.type = type;
        break;
      }
    }

    // Clean up title
    parsed.title = parsed.title.replace(/\s+/g, ' ').trim();
    if (parsed.title.length === 0) {
      parsed.title = 'New Event';
    }

    setParsedEvent(parsed);
  }, [defaultDate]);

  const handleInputChange = (value: string) => {
    setInput(value);
    parseInput(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedEvent || !parsedEvent.title) return;

    quickAdd.mutate({
      title: parsedEvent.title,
      date: parsedEvent.date,
      time: parsedEvent.time,
      duration: parsedEvent.duration,
    }, {
      onSuccess: () => {
        setInput('');
        setParsedEvent(null);
        setIsOpen(false);
        onClose?.();
      }
    });
  };

  const suggestions = [
    'Team meeting at 2pm',
    'Lunch with Sarah tomorrow',
    'Math exam next Friday at 10am',
    'Doctor appointment at 3:30pm',
    'Project due next week',
  ];

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className={cn(
                'h-12 px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90',
                'shadow-lg hover:shadow-xl transition-all duration-300 text-primary-foreground',
                'group relative overflow-hidden'
              )}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Quick Add Event</span>
              <Sparkles className="h-4 w-4 ml-2 group-hover:animate-pulse" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 min-w-[400px]"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quick Add Event</h3>
                    <p className="text-xs text-muted-foreground">
                      Use natural language like "Lunch at 2pm tomorrow"
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="e.g., Team meeting at 2pm tomorrow"
                    className="h-12 pl-4 pr-12 text-base bg-background/80 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!parsedEvent?.title || quickAdd.isPending}
                    className="absolute right-1 top-1 h-10 px-4 bg-primary hover:bg-primary/90"
                  >
                    {quickAdd.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Parsed Event Preview */}
                <AnimatePresence>
                  {parsedEvent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <span className="text-lg">
                            {EVENT_TYPE_CONFIG[parsedEvent.type as keyof typeof EVENT_TYPE_CONFIG].icon}
                          </span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold text-foreground">
                            {parsedEvent.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {format(new Date(parsedEvent.date), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            {parsedEvent.time && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(parse(parsedEvent.time, 'HH:mm', new Date()), 'h:mm a')}
                                </span>
                              </div>
                            )}
                            <Badge variant="outline" className="capitalize text-xs">
                              {parsedEvent.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Suggestions */}
              {!input && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <p className="text-xs text-muted-foreground font-medium">
                    Quick suggestions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleInputChange(suggestion)}
                        className="text-xs px-3 py-1.5 bg-muted/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full transition-all duration-200 hover:scale-105"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Keyboard Shortcuts */}
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Press Enter to create event</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-muted/50 rounded text-xs">Esc</kbd>
                    <span>to close</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};