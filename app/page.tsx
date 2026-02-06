'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/types/word';
import { getAllCards } from '@/lib/storage';
import { getDueCards } from '@/lib/srs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [dueCards, setDueCards] = useState<Card[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewLimit, setReviewLimit] = useState(20);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    const allCards = await getAllCards();
    const due = getDueCards(allCards);
    setDueCards(due);
    setTotalCards(allCards.length);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (totalCards === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Aún no hay tarjetas
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Comienza añadiendo algunas palabras en alemán para aprender
        </p>
        <Link
          href="/add"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Añadir Tus Primeras Palabras
        </Link>
      </div>
    );
  }

  if (dueCards.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          ¡Estás al día!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          No hay tarjetas pendientes de repasar hoy
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Tienes {totalCards} tarjeta{totalCards !== 1 ? 's' : ''} en total en tu biblioteca
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Añadir Más Palabras
          </Link>
          <Link
            href="/library"
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Ver Biblioteca
          </Link>
        </div>
      </div>
    );
  }

  const handleStartReview = () => {
    router.push(`/review?limit=${reviewLimit}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Repaso de Hoy
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {dueCards.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pendientes</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">
              {totalCards}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
        </div>

        {/* Review Limit Selector */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ¿Cuántas tarjetas quieres repasar?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[10, 20, 30, 50, dueCards.length].map((limit) => (
              <button
                key={limit}
                onClick={() => setReviewLimit(limit)}
                className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  reviewLimit === limit
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {limit === dueCards.length ? 'Todas' : limit}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Se priorizarán las tarjetas más atrasadas y se mezclarán con nuevas
          </p>
        </div>

        <button
          onClick={handleStartReview}
          className="block w-full bg-blue-600 text-white text-center px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Iniciar Sesión de Repaso ({Math.min(reviewLimit, dueCards.length)} tarjetas)
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Estadísticas Rápidas
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Nuevas:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {dueCards.filter(c => c.state === 'new').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Aprendiendo:</span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {dueCards.filter(c => c.state === 'learning').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Repaso:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {dueCards.filter(c => c.state === 'review').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
