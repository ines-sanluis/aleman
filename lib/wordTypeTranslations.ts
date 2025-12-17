import { WordType } from '@/types/word';

export function translateWordType(wordType: WordType): string {
  const translations: Record<WordType, string> = {
    noun: 'Sustantivo',
    verb: 'Verbo',
    adjective: 'Adjetivo',
    adverb: 'Adverbio',
    other: 'Otro',
  };

  return translations[wordType] || wordType;
}
