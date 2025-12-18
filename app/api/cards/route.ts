import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Card } from '@/types/word';

const CARDS_KEY = 'german-learning-cards';

async function readCards(): Promise<Card[]> {
  try {
    const cards = await kv.get<Card[]>(CARDS_KEY);
    return cards || [];
  } catch (error) {
    console.error('Error reading from KV:', error);
    return [];
  }
}

async function writeCards(cards: Card[]): Promise<void> {
  await kv.set(CARDS_KEY, cards);
}

// GET all cards
export async function GET() {
  try {
    const cards = await readCards();
    return NextResponse.json({ cards });
  } catch (error: any) {
    console.error('Error reading cards:', error);
    return NextResponse.json(
      { error: 'Failed to read cards' },
      { status: 500 }
    );
  }
}

// POST - Add new cards
export async function POST(request: NextRequest) {
  try {
    const { cards: newCards } = await request.json();

    if (!Array.isArray(newCards)) {
      return NextResponse.json(
        { error: 'Cards must be an array' },
        { status: 400 }
      );
    }

    const existingCards = await readCards();
    const updatedCards = [...existingCards, ...newCards];
    await writeCards(updatedCards);

    return NextResponse.json({ success: true, cards: updatedCards });
  } catch (error: any) {
    console.error('Error adding cards:', error);
    return NextResponse.json(
      { error: 'Failed to add cards' },
      { status: 500 }
    );
  }
}

// PUT - Update a card
export async function PUT(request: NextRequest) {
  try {
    const { card: updatedCard } = await request.json();

    if (!updatedCard || !updatedCard.id) {
      return NextResponse.json(
        { error: 'Valid card with id is required' },
        { status: 400 }
      );
    }

    const cards = await readCards();
    const index = cards.findIndex(c => c.id === updatedCard.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    cards[index] = updatedCard;
    await writeCards(cards);

    return NextResponse.json({ success: true, card: updatedCard });
  } catch (error: any) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a card
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('id');

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card id is required' },
        { status: 400 }
      );
    }

    const cards = await readCards();
    const filtered = cards.filter(c => c.id !== cardId);

    if (filtered.length === cards.length) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    await writeCards(filtered);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}
