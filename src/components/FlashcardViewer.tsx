import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCw, ChevronLeft, ChevronRight, Check, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  nextReview?: Date;
  interval?: number;
  easeFactor?: number;
}

interface FlashcardViewerProps {
  cards: Flashcard[];
  onRate?: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
  onDelete?: (cardId: string) => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ cards, onRate, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        No flashcards available. Generate some from your study notes!
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating: 'easy' | 'medium' | 'hard') => {
    if (onRate) {
      onRate(currentCard.id, rating);
    }
    if (currentIndex < cards.length - 1) {
      handleNext();
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      rotateY: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      rotateY: 0
    })
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Card {currentIndex + 1} of {cards.length}
        </span>
        <div className="flex gap-2">
          {currentCard.difficulty && (
            <Badge 
              variant={
                currentCard.difficulty === 'easy' ? 'default' : 
                currentCard.difficulty === 'medium' ? 'secondary' : 
                'destructive'
              }
            >
              {currentCard.difficulty}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Flashcard */}
      <div className="relative h-[400px] perspective-1000">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            <motion.div
              className="relative w-full h-full cursor-pointer"
              onClick={handleFlip}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front of card */}
              <Card 
                className="absolute inset-0 flex items-center justify-center p-8 shadow-lg hover:shadow-xl transition-shadow"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg)'
                }}
              >
                <CardContent className="text-center space-y-4 w-full">
                  <div className="text-sm text-muted-foreground font-medium mb-4">
                    Question
                  </div>
                  <p className="text-xl md:text-2xl font-semibold leading-relaxed">
                    {currentCard.front}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-8">
                    <RotateCw className="w-4 h-4" />
                    <span>Click to flip</span>
                  </div>
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card 
                className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg hover:shadow-xl transition-shadow"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <CardContent className="text-center space-y-4 w-full">
                  <div className="text-sm text-muted-foreground font-medium mb-4">
                    Answer
                  </div>
                  <p className="text-lg md:text-xl leading-relaxed">
                    {currentCard.back}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-8">
                    <RotateCw className="w-4 h-4" />
                    <span>Click to flip back</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {isFlipped && onRate && (
          <motion.div 
            className="flex gap-2 flex-1 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRate('hard')}
              className="flex-1 max-w-[120px] border-destructive/50 hover:bg-destructive/10"
            >
              <X className="w-4 h-4 mr-1" />
              Hard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRate('medium')}
              className="flex-1 max-w-[120px] border-primary/50 hover:bg-primary/10"
            >
              Medium
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRate('easy')}
              className="flex-1 max-w-[120px] border-green-500/50 hover:bg-green-500/10"
            >
              <Check className="w-4 h-4 mr-1" />
              Easy
            </Button>
          </motion.div>
        )}

        {!isFlipped && onDelete && (
          <motion.div 
            className="flex gap-2 flex-1 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(currentCard.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Card
            </Button>
          </motion.div>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};