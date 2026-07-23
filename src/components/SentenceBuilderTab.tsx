import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

interface Sentence {
  english: string;
  correctHanzi: string;
  pinyin: string;
}

export default function SentenceBuilderTab() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSentences();
  }, []);

  const loadSentences = async () => {
    setLoading(true);
    try {
      // Gather sentences from vocab json files
      const sectionsRes = await fetch('data/vocab/index.json');
      const sections = await sectionsRes.json();
      
      const gatheredSentences: Sentence[] = [];

      // We'll load a few categories to get a pool of sentences
      const targetCategories = ['greetings', 'ordering-food', 'clothes', 'directions', 'numbers'];
      
      for (const catId of targetCategories) {
        if (sections.find((s: any) => s.id === catId)) {
          const res = await fetch(`data/vocab/${catId}.json`);
          const items = await res.json();
          items.forEach((item: any) => {
            if (item.exampleSentence && item.exampleSentence.hanzi) {
              gatheredSentences.push({
                english: item.exampleSentence.meaning,
                correctHanzi: item.exampleSentence.hanzi,
                pinyin: item.exampleSentence.pinyin
              });
            }
          });
        }
      }

      // Fallback sentences if lists are empty
      if (gatheredSentences.length === 0) {
        gatheredSentences.push(
          { english: 'I like drinking tea.', correctHanzi: '我喜欢喝茶。', pinyin: 'Wǒ xǐhuān hē chá.' },
          { english: 'This clothes is very pretty.', correctHanzi: '这件衣服很漂亮。', pinyin: 'Zhè jiàn yīfu hěn piàoliang.' },
          { english: 'What is your name?', correctHanzi: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?' }
        );
      }

      setSentences(gatheredSentences);
      initializeRound(gatheredSentences, 0);
    } catch (err) {
      console.error("Error loading sentence builder sentences", err);
      setLoading(false);
    }
  };

  const initializeRound = (list: Sentence[], index: number) => {
    if (list.length === 0) return;
    const current = list[index];
    
    // Parse Chinese characters, ignoring punctuation for tiles
    const cleanSentence = current.correctHanzi.replace(/[。，？！?.!, ]/g, '');
    
    // Split into individual characters/words
    // For single-user study, character-level building is very good for Hanzi writing.
    // If it's a multi-character word (like 喜欢 or 衣服), we can group them if we parse them, 
    // but building character-by-character forces direct character recognition!
    // Let's do character-by-character tiles.
    const chars = cleanSentence.split('');
    
    // Add 2 random distractors from the character deck or common chars
    const distractors = ['的', '是', '不', '我', '有', '在', '他', '她', '国', '人'];
    const selectedDistractors: string[] = [];
    while (selectedDistractors.length < 2) {
      const d = distractors[Math.floor(Math.random() * distractors.length)];
      if (!chars.includes(d) && !selectedDistractors.includes(d)) {
        selectedDistractors.push(d);
      }
    }

    const allTiles = [...chars, ...selectedDistractors];
    
    // Shuffle tiles
    for (let i = allTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
    }

    setWordBank(allTiles);
    setSelectedWords([]);
    setStatus('idle');
    setCurrentIdx(index);
    setLoading(false);
  };

  const handleTileTap = (word: string, isFromSelected: boolean) => {
    if (status === 'correct') return;
    
    if (isFromSelected) {
      // Remove from selected, return to bank
      // Find first occurrence in selectedWords
      const idx = selectedWords.indexOf(word);
      if (idx > -1) {
        const updated = [...selectedWords];
        updated.splice(idx, 1);
        setSelectedWords(updated);
        setWordBank([...wordBank, word]);
        setStatus('idle');
      }
    } else {
      // Add to selected, remove from bank
      const idx = wordBank.indexOf(word);
      if (idx > -1) {
        const updatedBank = [...wordBank];
        updatedBank.splice(idx, 1);
        setWordBank(updatedBank);
        setSelectedWords([...selectedWords, word]);
        setStatus('idle');
      }
    }
  };

  const checkAnswer = () => {
    if (sentences.length === 0) return;
    const current = sentences[currentIdx];
    const cleanTarget = current.correctHanzi.replace(/[。，？！?.!, ]/g, '');
    const userString = selectedWords.join('');

    if (userString === cleanTarget) {
      setStatus('correct');
      // Speak correct sentence
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(current.correctHanzi);
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setStatus('incorrect');
    }
  };

  const resetRound = () => {
    initializeRound(sentences, currentIdx);
  };

  const nextRound = () => {
    const nextIdx = (currentIdx + 1) % sentences.length;
    initializeRound(sentences, nextIdx);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeSentence = sentences[currentIdx];

  return (
    <div className="px-container-margin py-lg max-w-md mx-auto flex flex-col min-h-[calc(100vh-140px)]">
      <div className="mb-6">
        <h2 className="text-2xl font-headline-lg text-on-background">Sentence Builder</h2>
        <p className="font-body-md text-on-surface-variant text-sm mt-1">Tap tiles in order to build the Mandarin translation.</p>
      </div>

      {activeSentence && (
        <div className="flex-1 flex flex-col gap-6">
          {/* Prompt card */}
          <div className="bg-surface border border-outline-variant p-5 rounded-xl shadow-sm">
            <span className="text-[10px] text-outline font-bold uppercase tracking-wider bg-surface-container px-2 py-1 rounded">
              Translate
            </span>
            <p className="text-lg text-on-background font-body-md mt-3 font-semibold">
              "{activeSentence.english}"
            </p>
          </div>

          {/* Answer Box */}
          <div 
            className={`min-h-[100px] border-2 border-dashed rounded-xl p-4 flex flex-wrap gap-2.5 items-center justify-center transition-all duration-300 ${
              status === 'correct' ? 'bg-secondary-container border-secondary' : 
              status === 'incorrect' ? 'bg-error-container border-error animate-shake' : 
              'border-outline-variant bg-surface-container'
            }`}
          >
            {selectedWords.length === 0 ? (
              <span className="text-outline text-sm italic">Tap tiles below...</span>
            ) : (
              selectedWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTileTap(word, true)}
                  className="bg-white border border-primary text-primary font-display-hanzi text-2xl px-4 py-2.5 rounded-lg shadow-sm hover:translate-y-[-1px] transition-transform active:scale-95"
                >
                  {word}
                </button>
              ))
            )}
          </div>

          {/* Word Bank */}
          <div className="flex flex-wrap gap-3 justify-center py-4">
            {wordBank.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleTileTap(word, false)}
                className="bg-white border border-outline text-on-background font-display-hanzi text-2xl px-4 py-2.5 rounded-lg shadow-sm hover:border-primary hover:text-primary active:scale-95 transition-all"
              >
                {word}
              </button>
            ))}
          </div>

          {/* Status message */}
          {status === 'correct' && (
            <div className="text-center p-3 bg-secondary-container text-on-secondary-container border border-secondary rounded-lg font-body-md text-sm font-semibold">
              🎉 Correct! "{activeSentence.correctHanzi}" ({activeSentence.pinyin})
            </div>
          )}
          {status === 'incorrect' && (
            <div className="text-center p-3 bg-error-container text-on-error-container border border-error rounded-lg font-body-md text-sm font-semibold">
              ❌ Try again. Remember the Subject-Verb-Object word order!
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto pt-6 flex gap-4 w-full">
            {status === 'correct' ? (
              <button
                onClick={nextRound}
                className="w-full py-3.5 bg-secondary text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all rounded-lg shadow-md flex items-center justify-center gap-1"
              >
                Next Sentence <Icons.ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button
                  onClick={resetRound}
                  className="flex-1 py-3.5 border border-primary text-primary text-xs font-bold uppercase tracking-widest hover:bg-surface-container active:scale-95 transition-all rounded-lg"
                >
                  Reset
                </button>
                <button
                  onClick={checkAnswer}
                  disabled={selectedWords.length === 0}
                  className="flex-1 py-3.5 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all rounded-lg shadow-md disabled:opacity-40"
                >
                  Check
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
