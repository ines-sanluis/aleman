import { Card, ReviewButtonType, CardState } from '@/types/word';

/**
 * Anki-style Spaced Repetition System
 *
 * State machine: new → learning → review
 * - New cards: never seen before
 * - Learning: short-term reinforcement with learning steps
 * - Review: long-term retention with exponential intervals
 */

export interface ReviewResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  state: CardState;
  learningStep: number;
}

/**
 * Learning steps in days
 * New cards go through these steps before graduating to review
 */
const LEARNING_STEPS = [1, 6]; // 1 day, then 6 days

/**
 * Graduating interval: interval when card moves from learning → review
 */
const GRADUATING_INTERVAL = 1;

/**
 * Easy interval: interval when "Easy" is pressed on a new card
 */
const EASY_INTERVAL = 4;

/**
 * Interval modifiers based on difficulty
 */
const MODIFIERS = {
  again: 0,      // Reset to learning
  hard: 0.8,     // 80% of normal interval
  good: 1.0,     // 100% of normal interval
  easy: 1.3,     // 130% of normal interval
};

/**
 * Maps review button types to quality ratings (0-3 scale)
 */
export function getQualityFromButton(buttonType: ReviewButtonType): number {
  const qualityMap: Record<ReviewButtonType, number> = {
    again: 0, // Failure
    hard: 1,  // Difficult
    good: 2,  // Good
    easy: 3,  // Easy
  };
  return qualityMap[buttonType];
}

/**
 * Updates ease factor based on performance (Anki-style)
 */
function updateEaseFactor(currentEase: number, quality: number): number {
  // Formula: EF' = EF + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02))
  // where q is quality (0-3)
  const newEase = currentEase + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));

  // Minimum ease factor is 1.3
  return Math.max(1.3, newEase);
}

/**
 * Calculates the next review parameters based on card state and user feedback
 */
export function calculateNextReview(card: Card, quality: number): ReviewResult {
  let { easeFactor, interval, repetitions, state, learningStep } = card;

  // Again button: reset to learning
  if (quality === 0) {
    return {
      easeFactor,
      interval: 0,
      repetitions: 0,
      nextReviewDate: calculateNextDate(LEARNING_STEPS[0]),
      state: 'learning',
      learningStep: 0,
    };
  }

  // Handle based on current state
  if (state === 'new' || state === 'learning') {
    return handleLearningCard(card, quality);
  } else {
    return handleReviewCard(card, quality);
  }
}

/**
 * Handles new/learning cards
 */
function handleLearningCard(card: Card, quality: number): ReviewResult {
  const { easeFactor, learningStep } = card;

  // Easy on a new/learning card: graduate immediately with easy interval
  if (quality === 3) {
    return {
      easeFactor: updateEaseFactor(easeFactor, quality),
      interval: EASY_INTERVAL,
      repetitions: 1,
      nextReviewDate: calculateNextDate(EASY_INTERVAL),
      state: 'review',
      learningStep: 0,
    };
  }

  // Hard or Good: advance through learning steps
  const nextStep = learningStep + 1;

  // Still in learning phase
  if (nextStep < LEARNING_STEPS.length) {
    return {
      easeFactor,
      interval: 0,
      repetitions: 0,
      nextReviewDate: calculateNextDate(LEARNING_STEPS[nextStep]),
      state: 'learning',
      learningStep: nextStep,
    };
  }

  // Graduate to review state
  return {
    easeFactor: updateEaseFactor(easeFactor, quality),
    interval: GRADUATING_INTERVAL,
    repetitions: 1,
    nextReviewDate: calculateNextDate(GRADUATING_INTERVAL),
    state: 'review',
    learningStep: 0,
  };
}

/**
 * Handles review cards (long-term retention)
 */
function handleReviewCard(card: Card, quality: number): ReviewResult {
  let { easeFactor, interval, repetitions } = card;

  // Update ease factor
  easeFactor = updateEaseFactor(easeFactor, quality);

  // Calculate new interval based on quality and repetitions
  let newInterval: number;

  if (repetitions === 0) {
    // First review after graduation
    newInterval = GRADUATING_INTERVAL;
  } else if (repetitions === 1) {
    // Second review
    newInterval = 6;
  } else {
    // Third review and beyond: use ease factor
    const modifier = getModifier(quality);
    newInterval = Math.round(interval * easeFactor * modifier);
  }

  // Hard button: reduce interval but don't fail
  if (quality === 1) {
    newInterval = Math.max(1, Math.round(newInterval * MODIFIERS.hard));
  }

  return {
    easeFactor: Number(easeFactor.toFixed(2)),
    interval: newInterval,
    repetitions: repetitions + 1,
    nextReviewDate: calculateNextDate(newInterval),
    state: 'review',
    learningStep: 0,
  };
}

/**
 * Gets the interval modifier based on quality
 */
function getModifier(quality: number): number {
  if (quality === 1) return MODIFIERS.hard;
  if (quality === 2) return MODIFIERS.good;
  if (quality === 3) return MODIFIERS.easy;
  return MODIFIERS.good;
}

/**
 * Calculates the next review date
 */
function calculateNextDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/**
 * Gets the interval preview for each button
 */
export function getIntervalPreview(card: Card): Record<ReviewButtonType, string> {
  const previews: Record<ReviewButtonType, string> = {
    again: '',
    hard: '',
    good: '',
    easy: '',
  };

  const buttons: ReviewButtonType[] = ['again', 'hard', 'good', 'easy'];

  buttons.forEach(button => {
    const quality = getQualityFromButton(button);
    const result = calculateNextReview(card, quality);

    if (result.state === 'learning') {
      // Show learning step
      const stepIndex = result.learningStep;
      if (stepIndex < LEARNING_STEPS.length) {
        const days = LEARNING_STEPS[stepIndex];
        previews[button] = days === 1 ? '1d' : `${days}d`;
      } else {
        previews[button] = '1d';
      }
    } else {
      // Show review interval
      if (result.interval === 0) {
        previews[button] = '1d';
      } else if (result.interval === 1) {
        previews[button] = '1d';
      } else if (result.interval < 30) {
        previews[button] = `${result.interval}d`;
      } else if (result.interval < 365) {
        const months = Math.round(result.interval / 30);
        previews[button] = `${months}mo`;
      } else {
        const years = (result.interval / 365).toFixed(1);
        previews[button] = `${years}y`;
      }
    }
  });

  return previews;
}

/**
 * Checks if a card is due for review
 */
export function isCardDue(card: Card): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nextReview = new Date(card.nextReviewDate);
  return nextReview <= now;
}

/**
 * Gets all cards that are due for review today
 */
export function getDueCards(cards: Card[]): Card[] {
  return cards.filter(isCardDue).sort((a, b) => {
    return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
  });
}

/**
 * Smart card selection algorithm for optimal learning
 * Prioritizes overdue cards, mixes in new cards, and limits the review session
 */
export function getSmartReviewCards(cards: Card[], limit: number): Card[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Categorize cards by state
  const newCards = cards.filter(card => card.state === 'new' && isCardDue(card));
  const learningCards = cards.filter(card => card.state === 'learning' && isCardDue(card));
  const reviewCards = cards.filter(card => card.state === 'review' && isCardDue(card));

  // Sort by priority
  const sortedLearning = learningCards.sort((a, b) => {
    return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
  });

  const sortedReview = reviewCards.sort((a, b) => {
    const aDate = new Date(a.nextReviewDate).getTime();
    const bDate = new Date(b.nextReviewDate).getTime();
    const nowTime = now.getTime();

    // Calculate how overdue each card is
    const aOverdue = Math.max(0, (nowTime - aDate) / (1000 * 60 * 60 * 24));
    const bOverdue = Math.max(0, (nowTime - bDate) / (1000 * 60 * 60 * 24));

    if (aOverdue !== bOverdue) {
      return bOverdue - aOverdue;
    }

    // Secondary: harder cards first
    return a.easeFactor - b.easeFactor;
  });

  const shuffledNew = [...newCards].sort(() => Math.random() - 0.5);

  // Mix ratio: prioritize learning, then review, then new
  // 50% review, 30% learning, 20% new
  const reviewCount = Math.ceil(limit * 0.5);
  const learningCount = Math.ceil(limit * 0.3);
  const newCount = limit - reviewCount - learningCount;

  const selected = [
    ...sortedLearning.slice(0, learningCount),
    ...sortedReview.slice(0, reviewCount),
    ...shuffledNew.slice(0, newCount),
  ];

  // If we don't have enough, fill with whatever is available
  const remaining = limit - selected.length;
  if (remaining > 0) {
    const allRemaining = [
      ...sortedLearning.slice(learningCount),
      ...sortedReview.slice(reviewCount),
      ...shuffledNew.slice(newCount),
    ];
    selected.push(...allRemaining.slice(0, remaining));
  }

  // Interleave for better learning experience
  return interleaveCards(selected).slice(0, limit);
}

/**
 * Interleaves different card types for better learning
 */
function interleaveCards(cards: Card[]): Card[] {
  const learning = cards.filter(c => c.state === 'learning');
  const review = cards.filter(c => c.state === 'review');
  const newCards = cards.filter(c => c.state === 'new');

  const mixed: Card[] = [];
  const maxLength = Math.max(learning.length, review.length, newCards.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < review.length) mixed.push(review[i]);
    if (i < learning.length) mixed.push(learning[i]);
    if (i < newCards.length) mixed.push(newCards[i]);
  }

  return mixed;
}

/**
 * Creates a new card with default SRS values
 */
export function createNewCard(wordData: any): Card {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return {
    id: crypto.randomUUID(),
    wordData,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: now.toISOString(),
    lastReviewDate: null,
    state: 'new',
    learningStep: 0,
    isNew: true, // Legacy field
    createdAt: new Date().toISOString(),
  };
}
