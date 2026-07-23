import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PinyinPillProps {
  pinyin: string;
  className?: string;
}

export default function PinyinPill({ pinyin, className = '' }: PinyinPillProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setRevealed(!revealed);
      }}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full text-xs font-label-pinyin font-medium transition-all duration-200 border select-none shrink-0 ${
        revealed
          ? 'bg-primary-fixed/20 border-primary/30 text-primary shadow-xs'
          : 'bg-surface-container border-outline-variant text-outline hover:border-outline hover:text-on-surface-variant'
      } ${className}`}
      aria-label="Toggle Pinyin reveal"
      title="Tap or hover to toggle Pinyin"
    >
      {revealed ? (
        <>
          <Eye size={14} className="text-primary shrink-0" />
          <span className="font-semibold text-primary tracking-wide text-xs">{pinyin}</span>
        </>
      ) : (
        <>
          <EyeOff size={14} className="text-outline shrink-0" />
          <span className="text-[11px] tracking-wider uppercase font-semibold">pīn yīn · reveal</span>
        </>
      )}
    </button>
  );
}
