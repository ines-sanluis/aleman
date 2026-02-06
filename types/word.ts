export type WordType = 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';

export type Gender = 'der' | 'die' | 'das' | null;

export interface WordData {
  german: string;
  spanish: string;
  wordType: WordType;
  gender: Gender;
  plural: string | null;
  exampleGerman: string;
  exampleSpanish: string;
  conjugations?: string[]; // For verbs
  conjugationLink?: string; // Link to conjugation resource
  pastTense?: string; // For verbs - past tense forms
}

export type CardState = 'new' | 'learning' | 'review';

export interface Card {
  id: string;
  wordData: WordData;

  // SRS fields (SM-2 algorithm)
  easeFactor: number; // Default: 2.5
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews in a row
  nextReviewDate: string; // ISO date string
  lastReviewDate: string | null;

  // State machine
  state: CardState; // new → learning → review
  learningStep: number; // Current step in learning phase (0-indexed)

  // Legacy field (kept for backwards compatibility)
  isNew: boolean; // Deprecated: use state === 'new' instead

  createdAt: string;
}

export interface ReviewRating {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  // 0: Complete blackout
  // 1: Incorrect, but familiar
  // 2: Incorrect, but easy to recall
  // 3: Correct, but difficult
  // 4: Correct, with some hesitation
  // 5: Perfect response
}

export type ReviewButtonType = 'again' | 'hard' | 'good' | 'easy';
