'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, ReviewButtonType } from '@/types/word';
import { getAllCards, updateCard } from '@/lib/storage';
import { getSmartReviewCards, calculateNextReview, getQualityFromButton, getIntervalPreview } from '@/lib/srs';
import PronunciationButton from '@/components/PronunciationButton';
import { translateWordType } from '@/lib/wordTypeTranslations';

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dueCards, setDueCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDueCards();
  }, []);

  const loadDueCards = async () => {
    const allCards = await getAllCards();
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const selected = getSmartReviewCards(allCards, limit);

    if (selected.length === 0) {
      router.push('/');
      return;
    }

    setDueCards(selected);
    setLoading(false);
  };

  const handleReview = async (buttonType: ReviewButtonType) => {
    const currentCard = dueCards[currentIndex];
    const quality = getQualityFromButton(buttonType);
    const reviewResult = calculateNextReview(currentCard, quality);

    const updatedCard: Card = {
      ...currentCard,
      ...reviewResult,
      lastReviewDate: new Date().toISOString(),
      isNew: false,
    };

    await updateCard(updatedCard);

    // Move to next card
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Finished all cards
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (dueCards.length === 0) {
    return null;
  }

  const currentCard = dueCards[currentIndex];
  const progress = ((currentIndex + 1) / dueCards.length) * 100;
  const intervalPreviews = getIntervalPreview(currentCard);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {currentIndex + 1} / {dueCards.length}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progress)}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 min-h-[400px] flex flex-col">
        {/* Question Side */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            {currentCard.isNew && (
              <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full mb-4">
                Tarjeta Nueva
              </span>
            )}
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {currentCard.wordData.gender && `${currentCard.wordData.gender} `}
                {currentCard.wordData.german}
              </h2>
              <PronunciationButton text={currentCard.wordData.german} size="lg" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {translateWordType(currentCard.wordData.wordType)}
              {currentCard.wordData.plural && ` • Plural: ${currentCard.wordData.plural}`}
            </p>
          </div>

          {/* Answer (revealed when showAnswer is true) */}
          {showAnswer && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                <div className="text-center mb-6">
                  <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {currentCard.wordData.spanish}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ejemplo:</p>
                  <p className="text-gray-800 dark:text-gray-200 mb-1">
                    {currentCard.wordData.exampleGerman}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    {currentCard.wordData.exampleSpanish}
                  </p>
                </div>

                {currentCard.wordData.conjugations && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tiempo Presente:
                    </p>
                    <p className="text-gray-800 dark:text-gray-200 text-sm">
                      {currentCard.wordData.conjugations.join(' • ')}
                    </p>
                    {currentCard.wordData.pastTense && (
                      <>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 mt-3">
                          Tiempo Pasado (Perfekt):
                        </p>
                        <p className="text-gray-800 dark:text-gray-200 text-sm">
                          {currentCard.wordData.pastTense}
                        </p>
                      </>
                    )}
                    {currentCard.wordData.conjugationLink && (
                      <a
                        href={currentCard.wordData.conjugationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block"
                      >
                        Ver conjugación completa →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              Mostrar Respuesta
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                ¿Qué tan bien conocías esta palabra?
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleReview('again')}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  <div className="text-sm">Otra vez</div>
                  <div className="text-xs opacity-90">{intervalPreviews.again}</div>
                </button>
                <button
                  onClick={() => handleReview('hard')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  <div className="text-sm">Difícil</div>
                  <div className="text-xs opacity-90">{intervalPreviews.hard}</div>
                </button>
                <button
                  onClick={() => handleReview('good')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  <div className="text-sm">Bien</div>
                  <div className="text-xs opacity-90">{intervalPreviews.good}</div>
                </button>
                <button
                  onClick={() => handleReview('easy')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  <div className="text-sm">Fácil</div>
                  <div className="text-xs opacity-90">{intervalPreviews.easy}</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        {dueCards.length - currentIndex - 1} tarjetas restantes
      </div>
    </div>
  );
}
