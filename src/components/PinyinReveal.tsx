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
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div 
      className={`inline-flex flex-col items-center cursor-pointer select-none group ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setRevealed(!revealed);
      }}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
    >
      <span className={`font-display-hanzi text-on-background ${sizeClasses[size]}`}>{hanzi}</span>
      <span 
        className={`font-label-pinyin text-xs text-primary transition-opacity duration-200 mt-1 min-h-[16px] text-center ${
          revealed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {pinyin}
      </span>
    </div>
  );
}
