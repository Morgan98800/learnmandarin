import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import TTSButton from './TTSButton';
import DecompositionCard from './DecompositionCard';
import DecompositionView from './DecompositionView';

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

export default function FlashcardsTab() {
  const [deckType, setDeckType] = useState<'1000' | 'starred'>('1000');
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [dueCards, setDueCards] = useState<CardItem[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDecompose, setShowDecompose] = useState(false);

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
    setShowDecompose(false);
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
    setShowDecompose(false);
    if (currentCardIdx + 1 < dueCards.length) {
      setCurrentCardIdx(currentCardIdx + 1);
    } else {
      // Reached end of due list
      setCurrentCardIdx(0);
      filterDueCards(cards);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeCard = dueCards[currentCardIdx];

  return (
    <div className="w-full px-4 py-4 flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline-lg text-on-background">Flashcards</h2>
          <p className="text-xs text-outline font-semibold uppercase mt-0.5">Spaced Repetition (SRS)</p>
        </div>
        
        {/* Toggle deck type */}
        <div className="flex border border-outline-variant rounded-lg p-0.5 bg-surface-container">
          <button 
            onClick={() => setDeckType('1000')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${deckType === '1000' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'}`}
          >
            1000 List
          </button>
          <button 
            onClick={() => setDeckType('starred')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${deckType === 'starred' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'}`}
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
            className="mt-6 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm"
          >
            Review Deck Anyway
          </button>
        </div>
      ) : showDecompose && activeCard ? (
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-4">
            <button 
              onClick={() => setShowDecompose(false)}
              className="flex items-center text-primary font-label-sm font-semibold uppercase tracking-wider"
            >
              <Icons.ChevronLeft size={16} className="mr-1" /> Back to Card
            </button>
          </div>
          <DecompositionCard 
            character={activeCard.character}
            pinyin={activeCard.pinyin}
            meaning={activeCard.meaning}
            radical={activeCard.radical}
            decomposition={activeCard.decomposition}
            onClose={() => setShowDecompose(false)}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          {/* Progress bar */}
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentCardIdx) / dueCards.length) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-outline mb-2">
            <span>Card {currentCardIdx + 1} of {dueCards.length}</span>
            <button 
              onClick={() => setIsFlipped(!isFlipped)}
              className="text-primary font-semibold text-[11px] uppercase tracking-wider hover:underline"
            >
              {isFlipped ? 'Show Hanzi' : 'Flip for Answer'}
            </button>
          </div>

          {/* Flashcard Area */}
          {activeCard && (
            <div className="w-full flex justify-center">
              {!isFlipped ? (
                /* Front Side: Interactive Tap-To-Decompose Card */
                <DecompositionView 
                  character={activeCard.character}
                  radical={activeCard.radical}
                  decomposition={activeCard.decomposition}
                  showAudio={true}
                  className="w-full"
                />
              ) : (
                /* Back Side: Character + Pinyin + Meaning */
                <div 
                  onClick={() => setIsFlipped(false)}
                  className="relative aspect-square w-full max-w-[280px] sm:max-w-[320px] mx-auto bg-surface border border-outline-variant shadow-sm rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer select-none tian-zi-ge"
                >
                  <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
                    <TTSButton text={activeCard.character} />
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDecompose(true);
                    }}
                    title="Stroke Order Animation"
                    className="absolute top-4 left-4 z-20 p-2 text-outline hover:text-primary rounded-full hover:bg-surface-container transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                  >
                    <Icons.GitMerge size={18} />
                    Strokes
                  </button>

                  <div className="text-center px-4">
                    <span className="font-display-hanzi text-6xl sm:text-7xl text-on-surface opacity-45">{activeCard.character}</span>
                    <h3 className="font-label-pinyin text-primary text-xl font-bold tracking-wider mt-4">
                      {activeCard.pinyin}
                    </h3>
                    <p className="font-body-md text-on-surface-variant mt-2 text-sm max-w-[240px] mx-auto">
                      {activeCard.meaning}
                    </p>
                  </div>

                  <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-outline italic">
                    Tap to show front
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex gap-4 w-full">
            <button 
              onClick={() => handleSRSResponse(false)}
              className="flex-1 py-3.5 border border-primary text-primary text-xs font-bold uppercase tracking-widest bg-transparent hover:bg-surface-container active:scale-95 transition-all rounded-lg"
            >
              Needs Practice
            </button>
            <button 
              onClick={() => handleSRSResponse(true)}
              className="flex-1 py-3.5 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all rounded-lg shadow-md"
            >
              I know it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
