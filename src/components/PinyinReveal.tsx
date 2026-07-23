import React, { useState } from 'react';

interface PinyinRevealProps {
  hanzi: string;
  pinyin: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onDecompose?: (char: string) => void;
}

export default function PinyinReveal({ hanzi, pinyin, className = '', size = 'md', onDecompose }: PinyinRevealProps) {
  const [revealed, setRevealed] = useState(false);

  const sizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const handleCharClick = (e: React.MouseEvent, char: string) => {
    e.stopPropagation();
    if (onDecompose) {
      onDecompose(char);
    } else {
      setRevealed(!revealed);
    }
  };

  const chars = hanzi.split('');

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
      <div className={`font-display-hanzi text-on-background max-w-full break-all text-center leading-tight flex flex-wrap justify-center ${sizeClasses[size]}`}>
        {chars.map((ch, idx) => (
          <span 
            key={idx}
            onClick={(e) => handleCharClick(e, ch)}
            className="hover:text-primary hover:underline transition-all cursor-pointer px-0.5 active:scale-95"
            title={`Click to decompose ${ch}`}
          >
            {ch}
          </span>
        ))}
      </div>
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
