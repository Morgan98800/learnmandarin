import React, { useState } from 'react';

interface PinyinRevealProps {
  hanzi: string;
  pinyin: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PinyinReveal({ hanzi, pinyin, className = '', size = 'md' }: PinyinRevealProps) {
  const [revealed, setRevealed] = useState(false);

  const sizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div 
      className={`inline-flex flex-col items-center cursor-pointer select-none group max-w-full overflow-hidden ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setRevealed(!revealed);
      }}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
    >
      <span className={`font-display-hanzi text-on-background max-w-full break-all text-center leading-tight ${sizeClasses[size]}`}>{hanzi}</span>
      <span 
        className={`font-label-pinyin text-[11px] sm:text-xs text-primary transition-opacity duration-200 mt-0.5 min-h-[16px] text-center max-w-full break-words leading-tight ${
          revealed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {pinyin}
      </span>
    </div>
  );
}
