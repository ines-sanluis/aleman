export interface VocabularyWord {
  id: number;
  german: string;
  english: string;
  example: string;
  exampleTranslation: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
}

export interface VocabularyData {
  words: VocabularyWord[];
} 