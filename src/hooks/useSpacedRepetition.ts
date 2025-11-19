import { useState, useCallback } from 'react';

export interface SpacedRepetitionCard {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  nextReview: Date;
  interval: number; // days
  repetitions: number;
  easeFactor: number;
}

// SM-2 Algorithm for spaced repetition
export const useSpacedRepetition = () => {
  const calculateNextReview = useCallback((
    quality: 'easy' | 'medium' | 'hard',
    card: SpacedRepetitionCard
  ): SpacedRepetitionCard => {
    // Convert quality to numeric (0-5 scale)
    const q = quality === 'hard' ? 1 : quality === 'medium' ? 3 : 5;
    
    let { interval, repetitions, easeFactor } = card;

    // Update ease factor
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

    // Calculate new interval
    if (q < 3) {
      // Failed - reset
      repetitions = 0;
      interval = 1;
    } else {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ...card,
      difficulty: quality,
      nextReview,
      interval,
      repetitions,
      easeFactor
    };
  }, []);

  const getDueCards = useCallback((cards: SpacedRepetitionCard[]): SpacedRepetitionCard[] => {
    const now = new Date();
    return cards
      .filter(card => new Date(card.nextReview) <= now)
      .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
  }, []);

  const getUpcomingReviews = useCallback((cards: SpacedRepetitionCard[]): {
    today: number;
    tomorrow: number;
    thisWeek: number;
  } => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return {
      today: cards.filter(card => {
        const reviewDate = new Date(card.nextReview);
        return reviewDate.toDateString() === now.toDateString();
      }).length,
      tomorrow: cards.filter(card => {
        const reviewDate = new Date(card.nextReview);
        return reviewDate.toDateString() === tomorrow.toDateString();
      }).length,
      thisWeek: cards.filter(card => {
        const reviewDate = new Date(card.nextReview);
        return reviewDate > now && reviewDate <= weekFromNow;
      }).length
    };
  }, []);

  const initializeCard = useCallback((id: string, front: string, back: string): SpacedRepetitionCard => {
    return {
      id,
      front,
      back,
      nextReview: new Date(),
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5
    };
  }, []);

  return {
    calculateNextReview,
    getDueCards,
    getUpcomingReviews,
    initializeCard
  };
};