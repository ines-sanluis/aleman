'use client';

import { useState, useEffect } from 'react';
import { Card, WordType, Gender } from '@/types/word';

interface EditCardModalProps {
  card: Card;
  onSave: (updatedCard: Card) => void;
  onCancel: () => void;
}

export default function EditCardModal({ card, onSave, onCancel }: EditCardModalProps) {
  const [formData, setFormData] = useState({
    german: card.wordData.german,
    spanish: card.wordData.spanish,
    wordType: card.wordData.wordType,
    gender: card.wordData.gender || '',
    plural: card.wordData.plural || '',
    exampleGerman: card.wordData.exampleGerman,
    exampleSpanish: card.wordData.exampleSpanish,
    conjugations: card.wordData.conjugations?.join(', ') || '',
    pastTense: card.wordData.pastTense || '',
    conjugationLink: card.wordData.conjugationLink || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedCard: Card = {
      ...card,
      wordData: {
        german: formData.german.trim(),
        spanish: formData.spanish.trim(),
        wordType: formData.wordType,
        gender: formData.gender ? (formData.gender as Gender) : null,
        plural: formData.plural.trim() || null,
        exampleGerman: formData.exampleGerman.trim(),
        exampleSpanish: formData.exampleSpanish.trim(),
        conjugations: formData.conjugations
          ? formData.conjugations.split(',').map(c => c.trim()).filter(c => c)
          : undefined,
        pastTense: formData.pastTense.trim() || undefined,
        conjugationLink: formData.conjugationLink.trim() || undefined,
      },
    };

    onSave(updatedCard);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editar Tarjeta
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* German Word */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Palabra en Alemán *
            </label>
            <input
              type="text"
              required
              value={formData.german}
              onChange={e => setFormData({ ...formData, german: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Spanish Translation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Traducción al Español *
            </label>
            <input
              type="text"
              required
              value={formData.spanish}
              onChange={e => setFormData({ ...formData, spanish: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Word Type and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Palabra *
              </label>
              <select
                required
                value={formData.wordType}
                onChange={e => setFormData({ ...formData, wordType: e.target.value as WordType })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="noun">Sustantivo</option>
                <option value="verb">Verbo</option>
                <option value="adjective">Adjetivo</option>
                <option value="adverb">Adverbio</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Género (para sustantivos)
              </label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Ninguno</option>
                <option value="der">der</option>
                <option value="die">die</option>
                <option value="das">das</option>
              </select>
            </div>
          </div>

          {/* Plural */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Plural con artículo (para sustantivos, ej: die Häuser)
            </label>
            <input
              type="text"
              value={formData.plural}
              onChange={e => setFormData({ ...formData, plural: e.target.value })}
              placeholder="die Häuser"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Example German */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Oración de Ejemplo (Alemán) *
            </label>
            <textarea
              required
              value={formData.exampleGerman}
              onChange={e => setFormData({ ...formData, exampleGerman: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Example Spanish */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Oración de Ejemplo (Español) *
            </label>
            <textarea
              required
              value={formData.exampleSpanish}
              onChange={e => setFormData({ ...formData, exampleSpanish: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Conjugations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Conjugaciones en Presente (para verbos, separadas por comas)
            </label>
            <input
              type="text"
              value={formData.conjugations}
              onChange={e => setFormData({ ...formData, conjugations: e.target.value })}
              placeholder="ich gehe, du gehst, er/sie/es geht, wir gehen, ihr geht, sie/Sie gehen"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Past Tense */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Tiempo Pasado Perfekt (para verbos)
            </label>
            <input
              type="text"
              value={formData.pastTense}
              onChange={e => setFormData({ ...formData, pastTense: e.target.value })}
              placeholder="ich habe gegessen, du hast gegessen, er/sie/es hat gegessen"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Conjugation Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Enlace de Conjugación (para verbos)
            </label>
            <input
              type="url"
              value={formData.conjugationLink}
              onChange={e => setFormData({ ...formData, conjugationLink: e.target.value })}
              placeholder="https://conjugator.reverso.net/conjugation-german-verb-..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
