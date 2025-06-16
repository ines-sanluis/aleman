'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VocabularyWord } from '../types/vocabulary';

export default function AddWord() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<VocabularyWord, 'id'>>({
    german: '',
    english: '',
    example: '',
    exampleTranslation: '',
    level: 'A1',
    category: 'common words'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add word');
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error adding word:', error);
      alert('Failed to add word. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Add New Word</h1>
          <p className="text-slate-600">Expand your German vocabulary</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="german" className="block text-sm font-semibold text-slate-700 mb-2">
                German Word
              </label>
              <input
                type="text"
                id="german"
                name="german"
                value={formData.german}
                onChange={handleChange}
                required
                placeholder="Enter German word"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="english" className="block text-sm font-semibold text-slate-700 mb-2">
                English Translation
              </label>
              <input
                type="text"
                id="english"
                name="english"
                value={formData.english}
                onChange={handleChange}
                required
                placeholder="Enter English translation"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="example" className="block text-sm font-semibold text-slate-700 mb-2">
              Example Sentence (German)
            </label>
            <textarea
              id="example"
              name="example"
              value={formData.example}
              onChange={handleChange}
              required
              placeholder="Enter example sentence in German"
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          <div>
            <label htmlFor="exampleTranslation" className="block text-sm font-semibold text-slate-700 mb-2">
              Example Translation
            </label>
            <textarea
              id="exampleTranslation"
              name="exampleTranslation"
              value={formData.exampleTranslation}
              onChange={handleChange}
              required
              placeholder="Enter example translation"
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="level" className="block text-sm font-semibold text-slate-700 mb-2">
                Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Mastery</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="common words">Common Words</option>
                <option value="greetings">Greetings</option>
                <option value="questions">Questions</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 text-slate-700 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm"
            >
              Add Word
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 