import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PinyinPillProps {
  pinyin: string;
  className?: string;
  forceRevealed?: boolean;
}

export default function PinyinPill({ pinyin, className = '', forceRevealed }: PinyinPillProps) {
  const [localRevealed, setLocalRevealed] = useState(false);

  const isRevealed = forceRevealed !== undefined ? forceRevealed : localRevealed;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (forceRevealed === undefined) {
          setLocalRevealed(!localRevealed);
        }
      }}
      onMouseEnter={() => forceRevealed === undefined && setLocalRevealed(true)}
      onMouseLeave={() => forceRevealed === undefined && setLocalRevealed(false)}
      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-full text-xs font-label-pinyin font-semibold transition-all duration-200 border select-none shrink-0 ${
        isRevealed
          ? 'bg-primary/10 border-primary/30 text-primary shadow-xs'
          : 'bg-surface-container border-outline-variant text-outline hover:border-outline hover:text-on-surface-variant'
      } ${className}`}
      aria-label="Toggle Pinyin reveal"
      title={forceRevealed !== undefined ? 'Pinyin' : 'Tap or hover to toggle Pinyin'}
    >
      {isRevealed ? (
        <>
          <Eye size={15} className="text-primary shrink-0" />
          <span className="font-bold text-primary tracking-wide text-xs sm:text-sm">{pinyin}</span>
        </>
      ) : (
        <>
          <EyeOff size={15} className="text-outline shrink-0" />
          <span className="text-[11px] tracking-wider uppercase font-semibold">pīn yīn · reveal</span>
        </>
      )}
    </button>
  );
}
