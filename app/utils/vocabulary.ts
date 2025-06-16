import vocabularyData from '../data/vocabulary.json';
import { VocabularyData, VocabularyWord } from '../types/vocabulary';

export const getVocabularyData = (): VocabularyData => {
  return vocabularyData as VocabularyData;
};

export const getVocabularyWord = (id: number): VocabularyWord | undefined => {
  const word = vocabularyData.words.find(word => word.id === id);
  return word as VocabularyWord | undefined;
};

export const getVocabularyByCategory = (category: string): VocabularyWord[] => {
  return vocabularyData.words.filter(word => word.category === category) as VocabularyWord[];
};

export const getVocabularyByLevel = (level: VocabularyWord['level']): VocabularyWord[] => {
  return vocabularyData.words.filter(word => word.level === level) as VocabularyWord[];
}; 