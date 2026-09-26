import React from 'react';

interface DictionaryAlphabetBarProps {
  selectedLetter: string | null;
  onSelectLetter: (letter: string | null) => void;
  availableLetters: Set<string>;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const DictionaryAlphabetBar: React.FC<DictionaryAlphabetBarProps> = ({
  selectedLetter,
  onSelectLetter,
  availableLetters,
}) => {
  return (
    <nav
      aria-label="Índice alfabético de términos"
      className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-2 bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs"
    >
      <button
        type="button"
        onClick={() => onSelectLetter(null)}
        aria-pressed={selectedLetter === null}
        className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
          selectedLetter === null
            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800'
        }`}
      >
        Todas
      </button>

      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

      {ALPHABET.map((letter) => {
        const isAvailable = availableLetters.has(letter);
        const isSelected = selectedLetter === letter;

        return (
          <button
            key={letter}
            type="button"
            disabled={!isAvailable}
            onClick={() => onSelectLetter(isSelected ? null : letter)}
            aria-label={`Filtrar por letra ${letter}${!isAvailable ? ' (sin términos)' : ''}`}
            aria-pressed={isSelected}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${
              isSelected
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-110 z-10'
                : isAvailable
                ? 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-amber-500 shadow-xs'
                : 'text-slate-400/40 dark:text-slate-600/40 cursor-not-allowed select-none'
            }`}
          >
            {letter}
          </button>
        );
      })}
    </nav>
  );
};
