import { Card } from '@/types/word';

/**
 * Storage utilities for managing cards via API
 */

export async function getAllCards(): Promise<Card[]> {
  try {
    const response = await fetch('/api/cards');
    const data = await response.json();
    return data.cards || [];
  } catch (error) {
    console.error('Error loading cards:', error);
    return [];
  }
}

export async function addCard(card: Card): Promise<boolean> {
  return addCards([card]);
}

export async function addCards(newCards: Card[]): Promise<boolean> {
  try {
    const response = await fetch('/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cards: newCards }),
    });

    if (!response.ok) {
      throw new Error('Failed to add cards');
    }

    return true;
  } catch (error) {
    console.error('Error adding cards:', error);
    return false;
  }
}

export async function updateCard(updatedCard: Card): Promise<boolean> {
  try {
    const response = await fetch('/api/cards', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ card: updatedCard }),
    });

    if (!response.ok) {
      throw new Error('Failed to update card');
    }

    return true;
  } catch (error) {
    console.error('Error updating card:', error);
    return false;
  }
}

export async function deleteCard(cardId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/cards?id=${cardId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete card');
    }

    return true;
  } catch (error) {
    console.error('Error deleting card:', error);
    return false;
  }
}

export async function getCardById(cardId: string): Promise<Card | null> {
  const cards = await getAllCards();
  return cards.find(c => c.id === cardId) || null;
}

/**
 * Export cards as JSON for backup
 */
export async function exportCards(): Promise<string> {
  const cards = await getAllCards();
  return JSON.stringify(cards, null, 2);
}

/**
 * Import cards from JSON backup
 */
export async function importCards(jsonString: string): Promise<boolean> {
  try {
    const cards = JSON.parse(jsonString) as Card[];
    return await addCards(cards);
  } catch (error) {
    console.error('Error importing cards:', error);
    return false;
  }
}

/**
 * Reset all SRS progress (keep words, reset repetitions/intervals)
 */
export async function resetAllProgress(): Promise<boolean> {
  try {
    const response = await fetch('/api/cards', {
      method: 'PATCH',
    });

    if (!response.ok) {
      throw new Error('Failed to reset progress');
    }

    return true;
  } catch (error) {
    console.error('Error resetting progress:', error);
    return false;
  }
}
