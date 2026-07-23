import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import TTSButton from './TTSButton';
import PinyinPill from './PinyinPill';

export interface VocabCardProps {
  hanzi: string;
  pinyin: string;
  meaning: string;
  partOfSpeech?: string;
  showPinyinGlobal?: boolean;
  isStarred?: boolean;
  onToggleStar?: () => void;
  onDecompose?: (char: string) => void;
  exampleSentence?: {
    hanzi: string;
    pinyin: string;
    meaning: string;
  };
  patterns?: {
    pattern: string;
    exampleHanzi: string;
    examplePinyin: string;
    exampleMeaning: string;
  }[];
}

export default function VocabCard({
  hanzi,
  pinyin,
  meaning,
  partOfSpeech,
  showPinyinGlobal = true,
  isStarred = false,
  onToggleStar,
  onDecompose,
  exampleSentence,
  patterns,
}: VocabCardProps) {
  const [showExample, setShowExample] = useState(false);

  // Determine responsive font size for Hanzi based on length
  const getHanziSizeClass = (str: string) => {
    const len = str.length;
    if (len <= 2) return 'text-4xl sm:text-5xl'; // ~48px-56px
    if (len === 3) return 'text-3xl sm:text-4xl'; // ~36px-44px
    return 'text-2xl sm:text-3xl'; // ~28px-36px
  };

  const handleCharClick = (e: React.MouseEvent, char: string) => {
    e.stopPropagation();
    if (onDecompose) {
      onDecompose(char);
    }
  };

  const chars = hanzi.split('');

  return (
    <div className="vocab-card w-full bg-surface border-2 border-outline-variant/80 p-4 rounded-xl shadow-xs flex flex-col gap-3 transition-all hover:border-outline">
      {/* TOP ROW: Hanzi + TTS (Left) | Action Icons (Right) */}
      <div className="flex justify-between items-center w-full gap-2">
        {/* Left: Large Dominant Hanzi + Audio Button inline */}
        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
          <div className={`font-display-hanzi text-on-background font-bold leading-none tracking-tight flex flex-wrap items-center ${getHanziSizeClass(hanzi)}`}>
            {chars.map((ch, idx) => (
              <span
                key={idx}
                onClick={(e) => handleCharClick(e, ch)}
                className="hover:text-primary hover:underline transition-all cursor-pointer px-0.5 active:scale-95 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                title={`Click to decompose ${ch}`}
                aria-label={`Decompose character ${ch}`}
              >
                {ch}
              </span>
            ))}
          </div>
          <div className="shrink-0 flex items-center">
            <TTSButton text={hanzi} size={20} />
          </div>
        </div>

        {/* Right: Secondary Action Icons (GitMerge for Decompose, Star for Favorite) */}
        <div className="flex items-center gap-1 shrink-0 text-outline">
          <button
            type="button"
            onClick={() => onDecompose && onDecompose(hanzi[0])}
            title="Decompose character components"
            aria-label="Decompose character components"
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-full hover:bg-surface-container hover:text-primary transition-all flex items-center justify-center border border-outline-variant/50"
          >
            <Icons.GitMerge size={18} />
          </button>
          {onToggleStar && (
            <button
              type="button"
              onClick={onToggleStar}
              title={isStarred ? 'Remove from starred' : 'Add to starred flashcards'}
              aria-label={isStarred ? 'Remove from starred' : 'Add to starred flashcards'}
              className={`min-w-[44px] min-h-[44px] p-2.5 rounded-full hover:bg-surface-container transition-all flex items-center justify-center border border-outline-variant/50 ${
                isStarred ? 'text-amber-500 fill-amber-500' : 'hover:text-primary'
              }`}
            >
              <Icons.Star size={18} fill={isStarred ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* SECOND ROW: Pinyin Pill (Left) | Part of Speech & Meaning (Right) */}
      <div className="flex justify-between items-center w-full gap-3 flex-wrap sm:flex-nowrap pt-1">
        {/* Left: Interactive Pinyin Pill with zero layout shift */}
        <PinyinPill pinyin={pinyin} forceRevealed={showPinyinGlobal} />

        {/* Right: Part-of-speech Tag + English Meaning */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end text-right flex-wrap sm:flex-nowrap">
          {partOfSpeech && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
              {partOfSpeech}
            </span>
          )}
          <span className="text-base sm:text-[17px] text-on-surface font-medium leading-tight break-words">
            {meaning}
          </span>
        </div>
      </div>

      {/* EXPANDABLE SECTION: Example Sentence (Accordion) */}
      {exampleSentence && (
        <div className="border-t border-outline-variant/60 pt-2 mt-1">
          <button
            type="button"
            onClick={() => setShowExample(!showExample)}
            className="flex items-center gap-1.5 text-xs text-outline hover:text-primary transition-colors min-h-[44px] px-1 rounded-lg font-medium"
            aria-expanded={showExample}
          >
            <Icons.ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showExample ? 'rotate-180 text-primary' : ''}`} />
            <span>Example sentence</span>
          </button>

          {showExample && (
            <div className="mt-2 pl-3 border-l-2 border-primary/40 bg-surface-container-lowest p-3 rounded-r-xl flex flex-col gap-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 flex-wrap min-w-0 overflow-hidden">
                <span className="font-display-hanzi text-base sm:text-lg text-on-background">{exampleSentence.hanzi}</span>
                {showPinyinGlobal && (
                  <span className="font-label-pinyin text-xs text-primary">{exampleSentence.pinyin}</span>
                )}
                <TTSButton text={exampleSentence.hanzi} size={16} />
              </div>
              <p className="text-xs text-on-surface-variant italic break-words">{exampleSentence.meaning}</p>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM SECTION: Verb Patterns (Verbs) */}
      {patterns && patterns.length > 0 && (
        <div className="mt-1 border-t border-outline-variant pt-2.5 space-y-2">
          <h4 className="text-[10px] uppercase tracking-wider text-outline font-bold">Grammar Patterns</h4>
          <div className="space-y-2">
            {patterns.map((pat, pIdx) => (
              <div key={pIdx} className="bg-surface-container-lowest border border-outline-variant p-2.5 rounded-lg space-y-1">
                <div className="text-xs font-bold text-primary">{pat.pattern}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display-hanzi text-sm font-semibold">{pat.exampleHanzi}</span>
                  {showPinyinGlobal && (
                    <span className="font-label-pinyin text-xs text-outline">({pat.examplePinyin})</span>
                  )}
                  <TTSButton text={pat.exampleHanzi} size={14} />
                </div>
                <div className="text-xs text-on-surface-variant italic">{pat.exampleMeaning}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
