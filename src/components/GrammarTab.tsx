import React, { useEffect, useState } from 'react';
import PinyinReveal from './PinyinReveal';
import TTSButton from './TTSButton';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

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
      <div className="mb-6">
        <h2 className="text-2xl font-headline-lg text-on-background">Grammar Rules</h2>
        <p className="font-body-md text-on-surface-variant text-sm mt-1">Study structural formulas and patterns.</p>
      </div>

      {/* Level Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border shrink-0 ${
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
        <div className="text-center py-10 text-outline">
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
                className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm"
              >
                <div 
                  onClick={() => toggleExpand(idx)}
                  className="p-4 flex justify-between items-center cursor-pointer select-none hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary-fixed text-primary">
                        {gp.level}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-base text-on-background truncate">{gp.title}</h3>
                    <p className="text-xs font-label-pinyin text-outline truncate">{gp.pinyin}</p>
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
                            <div key={eIdx} className="bg-surface border border-outline-variant p-3 rounded-lg flex flex-col gap-1.5">
                              <div className="flex items-center gap-3">
                                <PinyinReveal hanzi={ex.hanzi} pinyin={ex.pinyin} size="sm" />
                                <TTSButton text={ex.hanzi} size={16} />
                              </div>
                              <p className="text-xs text-outline italic">{ex.meaning}</p>
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
