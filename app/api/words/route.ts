import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { VocabularyWord } from '@/app/types/vocabulary';

export async function POST(request: Request) {
  try {
    const newWord = await request.json();
    
    // Read the current vocabulary file
    const filePath = path.join(process.cwd(), 'app/data/vocabulary.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const vocabulary = JSON.parse(fileContent);
    
    // Generate new ID (max existing ID + 1)
    const newId = Math.max(...vocabulary.words.map((word: VocabularyWord) => word.id)) + 1;
    
    // Add the new word
    vocabulary.words.push({
      id: newId,
      ...newWord
    });
    
    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(vocabulary, null, 2));
    
    return NextResponse.json({ success: true, id: newId });
  } catch (error) {
    console.error('Error adding word:', error);
    return NextResponse.json(
      { error: 'Failed to add word' },
      { status: 500 }
    );
  }
} 