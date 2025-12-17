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
