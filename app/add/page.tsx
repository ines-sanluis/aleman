"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WordData } from "@/types/word";
import { createNewCard } from "@/lib/srs";
import { addCards } from "@/lib/storage";
import PronunciationButton from "@/components/PronunciationButton";
import { translateWordType } from "@/lib/wordTypeTranslations";

export default function AddWords() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enrichedWords, setEnrichedWords] = useState<WordData[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnrichedWords([]);

    if (!input.trim()) {
      setError("Por favor ingresa al menos una palabra");
      return;
    }

    // Split input by newlines or commas
    const words = input
      .split(/[\n,]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length === 0) {
      setError("Por favor ingresa palabras válidas");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/enrich-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ words }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enrich words");
      }

      setEnrichedWords(data.words);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (enrichedWords.length === 0) return;

    try {
      setLoading(true);
      const cards = enrichedWords.map((wordData) => createNewCard(wordData));
      const success = await addCards(cards);

      if (success) {
        router.push("/");
      } else {
        setError("Error al guardar las tarjetas. Por favor intenta de nuevo.");
      }
    } catch (err: any) {
      console.error("Error saving cards:", err);
      setError(`Error al guardar: ${err.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          ✨ Añadir Nuevas Palabras
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Ingresa palabras en alemán (una por línea o separadas por comas). La
          IA añadirá traducciones, ejemplos y más.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ingresa palabras en alemán, ej.:&#10;Haus&#10;laufen&#10;schön"
            className="w-full h-40 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
            disabled={loading}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="mt-4 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer transition-all duration-200"
          >
            {loading ? "✨ Procesando..." : "🤖 Enriquecer con IA"}
          </button>
        </form>
      </div>

      {enrichedWords.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            🎯 Vista Previa ({enrichedWords.length} palabras)
          </h3>

          <div className="space-y-4 max-h-[600px] overflow-y-auto mb-6 pr-2">
            {enrichedWords.map((word, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 dark:border-gray-600 rounded-xl p-5 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {word.gender && `${word.gender} `}
                        {word.german}
                        {word.plural && ` (${word.plural})`}
                      </h4>
                      <PronunciationButton text={word.german} size="sm" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {word.spanish}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                    {translateWordType(word.wordType)}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Ejemplo:
                    </span>
                    <p className="text-gray-800 dark:text-gray-200 mt-1">
                      {word.exampleGerman}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 italic">
                      {word.exampleSpanish}
                    </p>
                  </div>

                  {word.conjugations && word.conjugations.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Tiempo Presente:
                      </span>
                      <p className="text-gray-800 dark:text-gray-200 mt-1">
                        {word.conjugations.join(", ")}
                      </p>
                    </div>
                  )}

                  {word.pastTense && (
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Tiempo Pasado (Perfekt):
                      </span>
                      <p className="text-gray-800 dark:text-gray-200 mt-1">
                        {word.pastTense}
                      </p>
                    </div>
                  )}

                  {word.conjugationLink && (
                    <a
                      href={word.conjugationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Ver conjugación completa →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer transition-all duration-200"
            >
              {loading ? "💾 Guardando..." : "💾 Guardar Todas las Tarjetas"}
            </button>
            <button
              onClick={() => {
                setEnrichedWords([]);
                setInput("");
              }}
              disabled={loading}
              className="px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer transition-all duration-200"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
