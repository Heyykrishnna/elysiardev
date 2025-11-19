import React, { useState, useEffect } from 'react';
import { Loader2, Zap } from 'lucide-react';
import Loader from './loader';

const funnyLoadingTexts = [
  "Teaching pixels to dance... 💃",
  "Convincing the hamsters to run faster... 🐹",
  "Brewing some digital coffee... ☕",
  "Counting all the zeros and ones... 🔢",
  "Asking the internet politely to hurry up... 🙏",
  "Loading awesomeness at light speed... ⚡",
  "Waking up the server from its nap... 😴",
  "Gathering all the smart bytes... 🧠",
  "Making sure everything is perfectly perfect... ✨",
  "Summoning the quiz wizards... 🧙‍♂️",
  "Polishing the digital doorknobs... 🚪",
  "Feeding the code monsters... 👾",
  "Warming up the thinking engines... 🔥",
  "Organizing the chaos into order... 🌪️",
  "Translating thoughts into reality... 💭",
  "Installing smartness update… 🧠⚙️ 99%",
  "Trying to remember where we left your focus 👀🔍",
  "Loading facts, figures, and fun (okay, maybe just facts) 🤓📈",
  "Loading motivation… please don’t close the tab 😅📖",
  "Procrastination levels critical. Deploying study mode 🚨📚",
];

const EnhancedLoadingScreen = () => {
  const [currentText, setCurrentText] = useState(funnyLoadingTexts[0]);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 2) % funnyLoadingTexts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentText(funnyLoadingTexts[textIndex]);
  }, [textIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-secondary/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Loader replaces the logo */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="w-32 h-32 mx-auto flex items-center justify-center">
            <Loader />
          </div>
          <div className="absolute -bottom-1 -left-1">
            <Zap className="w-6 h-6 text-muted-foreground animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Elysiar
          </h1>
          <p className="text-lg text-muted-foreground">
            Preparing your learning adventure...
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>

      {/* Funny Text at Bottom */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="text-center px-4">
          <p 
            key={textIndex}
            className="text-muted-foreground text-sm md:text-base font-medium animate-fade-in"
          >
            {currentText}
          </p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-16 right-16 animate-bounce" style={{ animationDelay: '0.5s' }}>
        <div className="w-4 h-4 bg-primary/20 rounded-full"></div>
      </div>
      <div className="absolute top-32 left-16 animate-bounce" style={{ animationDelay: '1s' }}>
        <div className="w-3 h-3 bg-accent/30 rounded-full"></div>
      </div>
      <div className="absolute bottom-32 right-1/4 animate-bounce" style={{ animationDelay: '1.5s' }}>
        <div className="w-2 h-2 bg-secondary/40 rounded-full"></div>
      </div>
    </div>
  );
};

export default EnhancedLoadingScreen;
