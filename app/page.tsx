'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { getVocabularyData, getVocabularyByCategory } from './utils/vocabulary';
import Link from 'next/link';
export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState<number | null>(null);
  const vocabulary = getVocabularyData();
  const categoryRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  // Get unique categories
  const categories = Array.from(new Set(vocabulary.words.map(word => word.category)));
  
  // Get words for selected category or all words if no category selected
  const displayedWords = selectedCategory 
    ? getVocabularyByCategory(selectedCategory)
    : vocabulary.words;

  const handleKeyPress = (e: React.KeyboardEvent, wordId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowTranslation(showTranslation === wordId ? null : wordId);
    }
  };

  const handleCategoryKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = (index + 1) % (categories.length + 1); // +1 for "Todas" button
        categoryRefs.current[nextIndex]?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = index === 0 ? categories.length : index - 1;
        categoryRefs.current[prevIndex]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        categoryRefs.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        categoryRefs.current[categories.length]?.focus();
        break;
    }
  };

  const selectCategory = (category: string | null) => {
    setSelectedCategory(category);
    // Focus the selected category button
    const index = category === null ? 0 : categories.indexOf(category) + 1;
    categoryRefs.current[index]?.focus();
  };

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-900">Aprendendo alemán</h1>
        
        {/* Category Filter */}
        <div 
          className="mb-8" 
          role="tablist" 
          aria-label="Categorías de vocabulario"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              ref={(el) => { categoryRefs.current[0] = el }}
              onClick={() => selectCategory(null)}
              onKeyDown={(e) => handleCategoryKeyDown(e, 0)}
              role="tab"
              tabIndex={0}
              aria-selected={selectedCategory === null}
              className={`cursor-pointer px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
                selectedCategory === null 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white text-slate-900 border-2 border-slate-900 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {categories.map((category, index) => (
              <button
                key={category}
                ref={(el) => { categoryRefs.current[index + 1] = el }}
                onClick={() => selectCategory(category)}
                onKeyDown={(e) => handleCategoryKeyDown(e, index + 1)}
                role="tab"
                tabIndex={0}
                aria-selected={selectedCategory === category}
                className={`cursor-pointer px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
                  selectedCategory === category 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-900 border-2 border-slate-900 hover:bg-slate-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Vocabulary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Lista de palabras">
          {displayedWords.map((word) => (
            <div 
              key={word.id}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => handleKeyPress(e, word.id)}
              onClick={() => setShowTranslation(showTranslation === word.id ? null : word.id)}
              className="cursor-pointer bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              aria-expanded={showTranslation === word.id}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-slate-900">{word.german}</h2>
                <span className="text-sm bg-slate-900 text-white px-2 py-1 rounded" aria-label={`Nivel ${word.level}`}>
                  {word.level}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xl text-slate-700" aria-label={`Tradución: ${word.english}`}>
                    {showTranslation === word.id ? word.english : '•••••'}
                  </p>
                  <button
                    className="text-slate-900 hover:text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 rounded"
                    aria-label={showTranslation === word.id ? 'Ocultar tradución' : 'Ver tradución'}
                  >
                    {showTranslation === word.id ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
                
                {showTranslation === word.id && (
                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-slate-800 italic" aria-label={`Exemplo: ${word.example}`}>{word.example}</p>
                    <p className="text-slate-700" aria-label={`Tradución do exemplo: ${word.exampleTranslation}`}>{word.exampleTranslation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 text-center text-slate-700" role="status" aria-live="polite">
          <p>Número de total de palabras: {vocabulary.words.length}</p>
          {selectedCategory && (
            <p>Número de palabras na categoría: {displayedWords.length}</p>
          )}
        </div>
      </div>
    </main>
  );
} 