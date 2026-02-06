'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, ReviewButtonType } from '@/types/word';
import { getAllCards, updateCard } from '@/lib/storage';
import { getSmartReviewCards, calculateNextReview, getQualityFromButton, getIntervalPreview } from '@/lib/srs';
import PronunciationButton from '@/components/PronunciationButton';
import { translateWordType } from '@/lib/wordTypeTranslations';

function ReviewContent() {
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
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            📝 {currentIndex + 1} / {dueCards.length}
          </span>
          <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {Math.round(progress)}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 md:p-10 min-h-[450px] flex flex-col transform transition-all duration-300 hover:shadow-3xl">
        {/* Question Side */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            {currentCard.state === 'new' && (
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 text-sm font-bold rounded-full mb-4 border border-blue-200 dark:border-blue-800">
                🆕 Tarjeta Nueva
              </span>
            )}
            {currentCard.state === 'learning' && (
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 text-orange-700 dark:text-orange-400 text-sm font-bold rounded-full mb-4 border border-orange-200 dark:border-orange-800">
                🎯 Aprendiendo
              </span>
            )}
            <div className="flex items-center justify-center gap-3 mb-3">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                {currentCard.wordData.gender && `${currentCard.wordData.gender} `}
                {currentCard.wordData.german}
              </h2>
              <PronunciationButton text={currentCard.wordData.german} size="lg" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
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
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-lg cursor-pointer"
            >
              🔍 Mostrar Respuesta
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                ¿Qué tan bien conocías esta palabra?
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleReview('again')}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <div className="text-sm mb-1">😔 Otra vez</div>
                  <div className="text-xs opacity-90 font-normal">{intervalPreviews.again}</div>
                </button>
                <button
                  onClick={() => handleReview('hard')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <div className="text-sm mb-1">😅 Difícil</div>
                  <div className="text-xs opacity-90 font-normal">{intervalPreviews.hard}</div>
                </button>
                <button
                  onClick={() => handleReview('good')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <div className="text-sm mb-1">😊 Bien</div>
                  <div className="text-xs opacity-90 font-normal">{intervalPreviews.good}</div>
                </button>
                <button
                  onClick={() => handleReview('easy')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <div className="text-sm mb-1">🎉 Fácil</div>
                  <div className="text-xs opacity-90 font-normal">{intervalPreviews.easy}</div>
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

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}
