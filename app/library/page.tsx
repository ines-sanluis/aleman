'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/types/word';
import { getAllCards, deleteCard, exportCards, importCards, updateCard, resetAllProgress } from '@/lib/storage';
import { isCardDue } from '@/lib/srs';
import EditCardModal from '@/components/EditCardModal';
import PronunciationButton from '@/components/PronunciationButton';
import { translateWordType } from '@/lib/wordTypeTranslations';
import { WordType } from '@/types/word';

export default function LibraryPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<WordType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'date' | 'alpha-asc' | 'alpha-desc'>('date');
  const [loading, setLoading] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    const allCards = await getAllCards();
    setCards(allCards);
    setLoading(false);
  };

  const handleDelete = async (cardId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      await deleteCard(cardId);
      loadCards();
    }
  };

  const handleExport = async () => {
    const json = await exportCards();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `german-cards-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (await importCards(content)) {
        loadCards();
        alert('¡Tarjetas importadas exitosamente!');
      } else {
        alert('Error al importar tarjetas. Por favor verifica el formato del archivo.');
      }
    };
    reader.readAsText(file);
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
  };

  const handleSaveEdit = async (updatedCard: Card) => {
    const success = await updateCard(updatedCard);
    if (success) {
      setEditingCard(null);
      loadCards();
    } else {
      alert('Error al actualizar la tarjeta. Por favor intenta de nuevo.');
    }
  };

  const handleResetProgress = async () => {
    if (confirm('¿Estás seguro de que quieres reiniciar todo el progreso? Esto mantendrá tus palabras pero reiniciará todas las repeticiones e intervalos.')) {
      const success = await resetAllProgress();
      if (success) {
        loadCards();
        alert('¡Progreso reiniciado exitosamente!');
      } else {
        alert('Error al reiniciar el progreso. Por favor intenta de nuevo.');
      }
    }
  };

  const filteredCards = cards
    .filter(card => {
      const matchesSearch = card.wordData.german.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.wordData.spanish.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || card.wordData.wordType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortOrder === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === 'alpha-asc') {
        return a.wordData.german.localeCompare(b.wordData.german);
      } else {
        return b.wordData.german.localeCompare(a.wordData.german);
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Biblioteca ({cards.length} tarjetas)
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              disabled={cards.length === 0}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors text-sm"
            >
              Exportar
            </button>
            <label className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer text-sm">
              Importar
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleResetProgress}
              disabled={cards.length === 0}
              className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg font-semibold hover:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors text-sm"
            >
              Reiniciar Progreso
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar palabras..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as WordType | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos los tipos</option>
            <option value="noun">Sustantivos</option>
            <option value="verb">Verbos</option>
            <option value="adjective">Adjetivos</option>
            <option value="adverb">Adverbios</option>
            <option value="other">Otros</option>
          </select>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'date' | 'alpha-asc' | 'alpha-desc')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="date">Más recientes</option>
            <option value="alpha-asc">A-Z</option>
            <option value="alpha-desc">Z-A</option>
          </select>
        </div>
      </div>

      {/* Cards List */}
      {filteredCards.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No hay tarjetas que coincidan con tu búsqueda' : 'No hay tarjetas en la biblioteca'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCards.map(card => {
            const isDue = isCardDue(card);
            const isExpanded = expandedCardId === card.id;
            const nextReview = new Date(card.nextReviewDate);
            const daysUntil = Math.ceil(
              (nextReview.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={card.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div
                  onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                  className="p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {card.wordData.gender && `${card.wordData.gender} `}
                          {card.wordData.german}
                        </h3>
                        <PronunciationButton text={card.wordData.german} size="sm" />
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded">
                          {translateWordType(card.wordData.wordType)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{card.wordData.spanish}</p>
                      <div className="flex gap-2 mt-2 text-xs">
                        {isDue ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded">
                            Pendiente
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold rounded">
                            En {daysUntil} día{daysUntil !== 1 ? 's' : ''}
                          </span>
                        )}
                        {card.state === 'new' && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold rounded text-xs">
                            Nueva
                          </span>
                        )}
                        {card.state === 'learning' && (
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-semibold rounded text-xs">
                            Aprendiendo
                          </span>
                        )}
                        {card.state === 'review' && card.repetitions >= 5 && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold rounded text-xs">
                            Consolidada
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(card);
                        }}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                        title="Editar tarjeta"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(card.id);
                        }}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                        title="Eliminar tarjeta"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600 pt-4 space-y-3 text-sm animate-fadeIn">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Ejemplo:</p>
                      <p className="text-gray-800 dark:text-gray-200">{card.wordData.exampleGerman}</p>
                      <p className="text-gray-600 dark:text-gray-400 italic">{card.wordData.exampleSpanish}</p>
                    </div>

                    {card.wordData.conjugations && (
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Conjugaciones:</p>
                        <p className="text-gray-800 dark:text-gray-200">
                          {card.wordData.conjugations.join(' • ')}
                        </p>
                        {card.wordData.conjugationLink && (
                          <a
                            href={card.wordData.conjugationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Ver conjugación completa →
                          </a>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-semibold">Intervalo:</span> {card.interval} días
                        </div>
                        <div>
                          <span className="font-semibold">Facilidad:</span> {card.easeFactor}
                        </div>
                        <div>
                          <span className="font-semibold">Repasos:</span> {card.repetitions}
                        </div>
                        <div>
                          <span className="font-semibold">Próximo:</span>{' '}
                          {nextReview.toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editingCard && (
        <EditCardModal
          card={editingCard}
          onSave={handleSaveEdit}
          onCancel={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
