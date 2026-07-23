import React, { useEffect, useState } from 'react';
import PinyinReveal from './PinyinReveal';
import TTSButton from './TTSButton';
import DecompositionModal from './DecompositionModal';
import { ChevronDown, ChevronUp, BookOpen, Eye, EyeOff } from 'lucide-react';

interface Example {
  hanzi: string;
  pinyin: string;
  meaning: string;
}

interface GrammarPoint {
  title: string;
  explanation: string;
  pinyin: string;
  level: string;
  examples: Example[];
}

export default function GrammarTab() {
  const [grammarPoints, setGrammarPoints] = useState<GrammarPoint[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [decomposeChar, setDecomposeChar] = useState<string | null>(null);
  const [showPinyin, setShowPinyin] = useState<boolean>(true); // Default Pinyin is shown

  useEffect(() => {
    fetch('data/grammar.json')
      .then(res => res.json())
      .then(data => setGrammarPoints(data))
      .catch(err => console.error("Error loading grammar rules", err));
  }, []);

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredPoints = filterLevel === 'All'
    ? grammarPoints
    : grammarPoints.filter(p => p.level.toLowerCase() === filterLevel.toLowerCase());

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="w-full px-4 py-4">
      <DecompositionModal 
        character={decomposeChar} 
        onClose={() => setDecomposeChar(null)} 
      />

      <div className="mb-6 flex justify-between items-start gap-2">
        <div>
          <h2 className="text-2xl font-headline-lg text-on-background">Grammar Rules</h2>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">Study structural formulas and patterns.</p>
        </div>

        {/* Global Pinyin Toggle */}
        <button
          onClick={() => setShowPinyin(!showPinyin)}
          className={`px-3 py-2 text-xs font-semibold rounded-full border transition-all min-h-[44px] shrink-0 flex items-center gap-1.5 ${
            showPinyin
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-surface-container border-outline-variant text-outline'
          }`}
        >
          {showPinyin ? <Eye size={15} /> : <EyeOff size={15} />}
          <span>Pinyin: {showPinyin ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Level Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border shrink-0 min-h-[44px] ${
              filterLevel === lvl
                ? 'bg-primary border-primary text-white shadow-sm'
                : 'bg-surface border-outline-variant text-on-surface-variant hover:border-outline'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {filteredPoints.length === 0 ? (
        <div className="text-center py-10 text-outline border border-dashed border-outline-variant rounded-xl p-6 bg-surface-container-low">
          <BookOpen className="mx-auto mb-2 opacity-45" size={24} />
          No grammar rules found for this level.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPoints.map((gp, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-surface border-2 border-outline-variant rounded-xl overflow-hidden shadow-sm hover:border-outline transition-all"
              >
                <div 
                  onClick={() => toggleExpand(idx)}
                  className="p-4 flex justify-between items-center cursor-pointer select-none hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {gp.level}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-base sm:text-lg text-on-background truncate">{gp.title}</h3>
                    {showPinyin && (
                      <p className="text-xs font-label-pinyin text-primary mt-0.5 truncate">{gp.pinyin}</p>
                    )}
                  </div>
                  <div className="text-outline">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 border-t border-outline-variant bg-surface-container-lowest space-y-4">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-outline font-bold mb-1">Explanation</h4>
                      <p className="text-sm text-on-surface-variant font-body-md leading-relaxed">{gp.explanation}</p>
                    </div>

                    {gp.examples && gp.examples.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase tracking-wider text-outline font-bold">Examples</h4>
                        <div className="space-y-2">
                          {gp.examples.map((ex, eIdx) => (
                            <div key={eIdx} className="bg-surface border border-outline-variant p-3 rounded-xl flex flex-col gap-1.5">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {showPinyin ? (
                                    <div className="flex items-center gap-2">
                                      <span className="font-display-hanzi text-lg font-bold text-on-background">{ex.hanzi}</span>
                                      <span className="font-label-pinyin text-xs text-primary font-semibold">({ex.pinyin})</span>
                                    </div>
                                  ) : (
                                    <PinyinReveal 
                                      hanzi={ex.hanzi} 
                                      pinyin={ex.pinyin} 
                                      size="sm" 
                                      onDecompose={(char) => setDecomposeChar(char)}
                                    />
                                  )}
                                </div>
                                <TTSButton text={ex.hanzi} size={16} />
                              </div>
                              <p className="text-xs text-on-surface-variant italic">{ex.meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
