'use client';

import { useState } from 'react';

interface PronunciationButtonProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PronunciationButton({
  text,
  size = 'md',
  className = ''
}: PronunciationButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handlePlay = async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setError(false);

    try {
      const response = await fetch('/api/pronunciation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate pronunciation');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setError(true);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.error('Error playing pronunciation:', err);
      setIsPlaying(false);
      setError(true);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      className={`
        inline-flex items-center justify-center
        text-blue-600 dark:text-blue-400
        hover:text-blue-700 dark:hover:text-blue-300
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
      title="Escuchar pronunciación"
      aria-label="Escuchar pronunciación"
    >
      {error ? (
        <svg
          className={sizeClasses[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ) : isPlaying ? (
        <svg
          className={`${sizeClasses[size]} animate-pulse`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M11.983 3.5c.776 0 1.396.627 1.396 1.4v14.2c0 .773-.62 1.4-1.396 1.4-.775 0-1.396-.627-1.396-1.4V4.9c0-.773.62-1.4 1.396-1.4zm-5.231 3c.776 0 1.396.627 1.396 1.4v8.2c0 .773-.62 1.4-1.396 1.4-.776 0-1.396-.627-1.396-1.4V7.9c0-.773.62-1.4 1.396-1.4zm10.703 0c.776 0 1.396.627 1.396 1.4v8.2c0 .773-.62 1.4-1.396 1.4-.776 0-1.396-.627-1.396-1.4V7.9c0-.773.62-1.4 1.396-1.4z" />
        </svg>
      ) : (
        <svg
          className={sizeClasses[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.414H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15.414z"
          />
        </svg>
      )}
    </button>
  );
}
