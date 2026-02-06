import { Card, CardState } from '@/types/word';

/**
 * Migrates old cards to the new schema with state and learningStep
 */
export function migrateCard(card: any): Card {
  // If card already has the new fields, return as is
  if ('state' in card && 'learningStep' in card) {
    return card as Card;
  }

  // Determine state based on old isNew field and repetitions
  let state: CardState;
  let learningStep = 0;

  if (card.isNew || card.repetitions === 0) {
    // Was a new card or never successfully reviewed
    state = 'new';
  } else if (card.repetitions === 1 || card.repetitions === 2) {
    // In early stages of learning
    state = 'learning';
    learningStep = Math.min(card.repetitions, 1); // 0 or 1
  } else {
    // Has been reviewed multiple times successfully
    state = 'review';
  }

  return {
    ...card,
    state,
    learningStep,
    // Ensure isNew exists for backwards compatibility
    isNew: card.isNew !== undefined ? card.isNew : state === 'new',
  };
}

/**
 * Migrates an array of cards
 */
export function migrateCards(cards: any[]): Card[] {
  return cards.map(migrateCard);
}
