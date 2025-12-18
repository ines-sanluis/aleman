import { Card, ReviewButtonType } from '@/types/word';

/**
 * SM-2 (SuperMemo 2) Algorithm Implementation
 * Based on: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 */

export interface ReviewResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
}

/**
 * Calculates the next review parameters based on the SM-2 algorithm
 * @param card - The card being reviewed
 * @param quality - Quality rating (0-5)
 * @returns Updated review parameters
 */
export function calculateNextReview(card: Card, quality: number): ReviewResult {
  let { easeFactor, interval, repetitions } = card;

  // Quality < 3 means the card was forgotten
  if (quality < 3) {
    repetitions = 0;
    interval = 1; // Review again tomorrow
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;

    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Ease factor should not go below 1.3
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  nextReviewDate.setHours(0, 0, 0, 0); // Reset to start of day

  return {
    easeFactor: Number(easeFactor.toFixed(2)),
    interval,
    repetitions,
    nextReviewDate: nextReviewDate.toISOString(),
  };
}

/**
 * Maps review button types to quality ratings
 */
export function getQualityFromButton(buttonType: ReviewButtonType): number {
  const qualityMap: Record<ReviewButtonType, number> = {
    again: 0, // Complete failure
    hard: 3,  // Correct but difficult
    good: 4,  // Correct with some hesitation
    easy: 5,  // Perfect response
  };
  return qualityMap[buttonType];
}

/**
 * Gets the interval preview for each button
 * Useful for showing "Again: <10min, Hard: 1d, Good: 3d, Easy: 4d"
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

    if (result.interval === 0) {
      previews[button] = '<10m';
    } else if (result.interval === 1) {
      previews[button] = '1d';
    } else if (result.interval < 30) {
      previews[button] = `${result.interval}d`;
    } else if (result.interval < 365) {
      const months = Math.round(result.interval / 30);
      previews[button] = `${months}mo`;
    } else {
      const years = Math.round(result.interval / 365);
      previews[button] = `${years}y`;
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
    // Sort by next review date (oldest first)
    return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
  });
}

/**
 * Smart card selection algorithm for optimal learning
 * Prioritizes overdue cards, mixes in new cards, and limits the review session
 *
 * @param cards - All available cards
 * @param limit - Maximum number of cards to review
 * @returns Optimally selected cards for review
 */
export function getSmartReviewCards(cards: Card[], limit: number): Card[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Categorize cards
  const newCards = cards.filter(card => card.isNew && isCardDue(card));
  const reviewCards = cards.filter(card => !card.isNew && isCardDue(card));

  // Sort review cards by priority
  const sortedReviewCards = reviewCards.sort((a, b) => {
    const aDate = new Date(a.nextReviewDate).getTime();
    const bDate = new Date(b.nextReviewDate).getTime();
    const nowTime = now.getTime();

    // Calculate how overdue each card is (in days)
    const aOverdue = Math.max(0, (nowTime - aDate) / (1000 * 60 * 60 * 24));
    const bOverdue = Math.max(0, (nowTime - bDate) / (1000 * 60 * 60 * 24));

    // Priority: more overdue cards first
    if (aOverdue !== bOverdue) {
      return bOverdue - aOverdue;
    }

    // Secondary: lower ease factor (harder cards) first
    return a.easeFactor - b.easeFactor;
  });

  // Shuffle new cards to keep variety
  const shuffledNewCards = [...newCards].sort(() => Math.random() - 0.5);

  // Determine mix ratio (70% review, 30% new cards)
  const reviewCount = Math.ceil(limit * 0.7);
  const newCount = limit - reviewCount;

  // Select cards
  const selectedReviewCards = sortedReviewCards.slice(0, reviewCount);
  const selectedNewCards = shuffledNewCards.slice(0, newCount);

  // If we don't have enough review cards, add more new cards
  const remaining = limit - selectedReviewCards.length - selectedNewCards.length;
  if (remaining > 0) {
    selectedNewCards.push(...shuffledNewCards.slice(newCount, newCount + remaining));
  }

  // Mix them together (interleave for better learning)
  const mixed: Card[] = [];
  const maxLength = Math.max(selectedReviewCards.length, selectedNewCards.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < selectedReviewCards.length) {
      mixed.push(selectedReviewCards[i]);
    }
    if (i < selectedNewCards.length) {
      mixed.push(selectedNewCards[i]);
    }
  }

  return mixed.slice(0, limit);
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
    nextReviewDate: now.toISOString(), // Due today
    lastReviewDate: null,
    isNew: true,
    createdAt: new Date().toISOString(),
  };
}
