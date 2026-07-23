import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import TTSButton from './TTSButton';
import DecompositionModal from './DecompositionModal';

interface CardItem {
  character: string;
  pinyin: string;
  meaning: string;
  rank?: number;
  radical?: string;
  decomposition?: string[];
}

interface SRSState {
  box: number;
  nextReview: number;
}

const STAGE_LABELS: Record<number, { label: string; badgeClass: string }> = {
  1: { label: 'New / Practice', badgeClass: 'bg-primary/10 text-primary border-primary/20' },
  2: { label: 'Learning', badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  3: { label: 'Reviewing', badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20' },
  4: { label: 'Comfortable', badgeClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20' },
  5: { label: 'Mastered', badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
};

export default function FlashcardsTab() {
  const [deckType, setDeckType] = useState<'1000' | 'starred'>('1000');
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [dueCards, setDueCards] = useState<CardItem[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [decomposeChar, setDecomposeChar] = useState<string | null>(null);

  // Leitner system intervals in milliseconds
  const boxIntervals: Record<number, number> = {
    1: 24 * 60 * 60 * 1000,       // 1 day
    2: 2 * 24 * 60 * 60 * 1000,   // 2 days
    3: 4 * 24 * 60 * 60 * 1000,   // 4 days
    4: 7 * 24 * 60 * 60 * 1000,   // 7 days
    5: 14 * 24 * 60 * 60 * 1000,  // 14 days
  };

  useEffect(() => {
    loadDeck();
  }, [deckType]);

  const loadDeck = async () => {
    setLoading(true);
    setIsFlipped(false);
    setDecomposeChar(null);
    setCurrentCardIdx(0);

    try {
      if (deckType === '1000') {
        const res = await fetch('data/frequency-1000.json');
        const data = await res.json();
        setCards(data);
        filterDueCards(data);
      } else {
        // Starred vocab
        const starredList = JSON.parse(localStorage.getItem('starred_vocab') || '[]');
        const srsData = JSON.parse(localStorage.getItem('srs_vocab_data') || '{}');
        
        const starredCards: CardItem[] = starredList.map((hanzi: string) => {
          const item = srsData[hanzi];
          if (item) {
            return {
              character: item.hanzi,
              pinyin: item.pinyin,
              meaning: item.meaning,
              radical: '',
              decomposition: []
            };
          }
          return {
            character: hanzi,
            pinyin: '',
            meaning: '',
            radical: '',
            decomposition: []
          };
        });

        setCards(starredCards);
        filterDueCards(starredCards);
      }
    } catch (err) {
      console.error("Error loading cards deck", err);
      setLoading(false);
    }
  };

  const filterDueCards = (allCards: CardItem[]) => {
    const srsData: Record<string, SRSState> = JSON.parse(localStorage.getItem('srs_vocab_data') || '{}');
    const now = Date.now();

    const due = allCards.filter(card => {
      const state = srsData[card.character];
      if (!state) return true; // New card, due immediately
      return state.nextReview <= now;
    });

    setDueCards(due.length > 0 ? due : allCards); // Fallback to all cards if none due
    setLoading(false);
  };

  const handleSRSResponse = (remembered: boolean) => {
    if (dueCards.length === 0) return;
    const current = dueCards[currentCardIdx];
    
    // Save Leitner state
    const srsSaved = localStorage.getItem('srs_vocab_data') || '{}';
    const srsData = JSON.parse(srsSaved);
    const existing = srsData[current.character] || { box: 1, nextReview: Date.now() };

    let nextBox = remembered ? Math.min(5, existing.box + 1) : 1;
    let interval = boxIntervals[nextBox];

    srsData[current.character] = {
      ...existing,
      box: nextBox,
      nextReview: Date.now() + interval
    };

    localStorage.setItem('srs_vocab_data', JSON.stringify(srsData));

    // Next Card
    setIsFlipped(false);
    setDecomposeChar(null);
    if (currentCardIdx + 1 < dueCards.length) {
      setCurrentCardIdx(currentCardIdx + 1);
    } else {
      // Reached end of due list
      setCurrentCardIdx(0);
      filterDueCards(cards);
    }
  };

  const getCardStage = (char: string) => {
    const srsData = JSON.parse(localStorage.getItem('srs_vocab_data') || '{}');
    const item = srsData[char];
    const box = item ? item.box : 1;
    return STAGE_LABELS[box] || STAGE_LABELS[1];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeCard = dueCards[currentCardIdx];
  const stageInfo = activeCard ? getCardStage(activeCard.character) : STAGE_LABELS[1];

  return (
    <div className="w-full px-4 py-4 flex flex-col">
      <DecompositionModal 
        character={decomposeChar} 
        onClose={() => setDecomposeChar(null)} 
      />

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline-lg text-on-background">Flashcards</h2>
          <p className="text-xs text-outline font-semibold uppercase mt-0.5">Spaced Repetition (SRS)</p>
        </div>
        
        {/* Toggle deck type with 44px touch target */}
        <div className="flex border border-outline-variant rounded-lg p-0.5 bg-surface-container">
          <button 
            onClick={() => setDeckType('1000')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-all min-h-[44px] flex items-center ${deckType === '1000' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'}`}
          >
            1000 List
          </button>
          <button 
            onClick={() => setDeckType('starred')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-all min-h-[44px] flex items-center ${deckType === 'starred' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'}`}
          >
            Starred
          </button>
        </div>
      </div>

      {dueCards.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 border border-dashed border-outline-variant bg-surface-container-low rounded-xl">
          <Icons.CheckCircle className="text-secondary mb-3" size={48} />
          <h3 className="text-lg font-bold text-on-background">All caught up!</h3>
          <p className="text-sm text-outline mt-1 max-w-[240px]">
            No due reviews for this deck. Check back later or add more starred vocabulary words!
          </p>
          <button 
            onClick={loadDeck}
            className="mt-6 px-5 py-3 min-h-[44px] bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center"
          >
            Review Deck Anyway
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentCardIdx) / dueCards.length) * 100}%` }}
            />
          </div>

          {/* Clean Card Counter & Stage Badge */}
          <div className="flex justify-between items-center text-xs text-outline mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-on-surface">Card {currentCardIdx + 1} of {dueCards.length}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${stageInfo.badgeClass}`}>
                {stageInfo.label}
              </span>
            </div>
            <span className="text-[11px] text-outline italic">Tap card to flip</span>
          </div>

          {/* Flashcard Box */}
          {activeCard && (
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative aspect-square w-full max-w-[280px] sm:max-w-[320px] mx-auto bg-surface border-2 border-outline-variant/80 shadow-sm rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer select-none transition-all duration-200 active:scale-[0.98] hover:border-outline"
            >
              {/* Decompose Action Button (GitMerge Icon) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setDecomposeChar(activeCard.character);
                }}
                aria-label="Decompose Character Components"
                className="absolute top-3 left-3 z-20 min-h-[44px] min-w-[44px] px-3 bg-surface-container hover:bg-surface-container-high text-primary rounded-full transition-all flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase border border-outline-variant/60 shadow-xs"
                title="Decompose Character Components"
              >
                <Icons.GitMerge size={16} />
                Decompose
              </button>

              {/* Audio Button (Top Right) */}
              <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
                <TTSButton text={activeCard.character} size={18} />
              </div>

              {!isFlipped ? (
                /* FRONT SIDE: Hanzi Character */
                <div className="text-center">
                  <span className="font-display-hanzi text-8xl sm:text-9xl text-on-surface leading-none">
                    {activeCard.character}
                  </span>
                  <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-outline font-semibold uppercase tracking-wider">
                    Tap card to reveal answer
                  </div>
                </div>
              ) : (
                /* BACK SIDE: Pinyin & Meaning */
                <div className="text-center px-4">
                  <span className="font-display-hanzi text-5xl sm:text-6xl text-on-surface opacity-35 leading-none">
                    {activeCard.character}
                  </span>
                  <h3 className="font-label-pinyin text-primary text-xl font-bold tracking-wider mt-4">
                    {activeCard.pinyin}
                  </h3>
                  <p className="font-body-md text-on-surface-variant mt-2 text-sm max-w-[240px] mx-auto font-medium">
                    {activeCard.meaning}
                  </p>
                  <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-outline italic">
                    Tap to show front
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SRS Action Buttons */}
          <div className="mt-6 flex gap-4 w-full">
            <button 
              onClick={() => handleSRSResponse(false)}
              className="flex-1 py-3.5 min-h-[48px] border-2 border-primary text-primary text-xs font-bold uppercase tracking-widest bg-transparent hover:bg-primary/5 active:scale-95 transition-all rounded-xl flex items-center justify-center"
            >
              Needs Practice
            </button>
            <button 
              onClick={() => handleSRSResponse(true)}
              className="flex-1 py-3.5 min-h-[48px] bg-primary text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all rounded-xl shadow-md flex items-center justify-center"
            >
              I know it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
