import React from 'react';
import * as Icons from 'lucide-react';
import TTSButton from './TTSButton';
import PinyinPill from './PinyinPill';

export interface VocabCardProps {
  hanzi: string;
  pinyin: string;
  meaning: string;
  partOfSpeech?: string;
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
  isStarred = false,
  onToggleStar,
  onDecompose,
  exampleSentence,
  patterns,
}: VocabCardProps) {
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
    <div className="w-full bg-surface border border-outline-variant p-4 rounded-xl shadow-xs flex flex-col gap-3 transition-all hover:border-outline">
      {/* TOP ROW: Hanzi + TTS (Left) | Action Icons (Right) */}
      <div className="flex justify-between items-center w-full gap-2">
        {/* Left: Large Dominant Hanzi + Audio Button inline */}
        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
          <div className={`font-display-hanzi text-on-background font-bold leading-none tracking-tight flex flex-wrap items-center ${getHanziSizeClass(hanzi)}`}>
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
          <div className="shrink-0 flex items-center">
            <TTSButton text={hanzi} size={20} />
          </div>
        </div>

        {/* Right: Secondary Action Icons (min 44px touch targets) */}
        <div className="flex items-center gap-1 shrink-0 text-outline">
          <button
            type="button"
            onClick={() => onDecompose && onDecompose(hanzi[0])}
            title="Decompose character radicals"
            aria-label="Decompose character radicals"
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-full hover:bg-surface-container hover:text-primary transition-all flex items-center justify-center"
          >
            <Icons.GitMerge size={18} />
          </button>
          {onToggleStar && (
            <button
              type="button"
              onClick={onToggleStar}
              title={isStarred ? 'Remove from starred' : 'Add to starred flashcards'}
              aria-label={isStarred ? 'Remove from starred' : 'Add to starred flashcards'}
              className={`min-w-[44px] min-h-[44px] p-2.5 rounded-full hover:bg-surface-container transition-all flex items-center justify-center ${
                isStarred ? 'text-primary' : 'hover:text-primary'
              }`}
            >
              <Icons.Star size={18} fill={isStarred ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* SECOND ROW: Pinyin Pill (Left) | Part of Speech & Meaning (Right) */}
      <div className="flex justify-between items-center w-full gap-3 flex-wrap sm:flex-nowrap pt-1">
        {/* Left: Interactive Pinyin Reveal Pill */}
        <PinyinPill pinyin={pinyin} />

        {/* Right: Part-of-speech Tag + English Meaning */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end text-right flex-wrap sm:flex-nowrap">
          {partOfSpeech && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-surface-container-high text-outline shrink-0">
              {partOfSpeech}
            </span>
          )}
          <span className="text-base sm:text-[17px] text-on-surface-variant font-body-md font-medium leading-tight break-words">
            {meaning}
          </span>
        </div>
      </div>

      {/* BOTTOM SECTION: Example Sentence (Vocab) */}
      {exampleSentence && (
        <div className="mt-1 pl-3 border-l-2 border-primary/40 bg-surface-container-lowest p-2.5 rounded-r-lg flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2 flex-wrap min-w-0 overflow-hidden">
            <span className="font-display-hanzi text-base sm:text-lg text-on-background">{exampleSentence.hanzi}</span>
            <span className="font-label-pinyin text-xs text-primary">{exampleSentence.pinyin}</span>
            <TTSButton text={exampleSentence.hanzi} size={14} />
          </div>
          <p className="text-xs text-outline italic break-words">{exampleSentence.meaning}</p>
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
                  <span className="font-label-pinyin text-xs text-outline">({pat.examplePinyin})</span>
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
