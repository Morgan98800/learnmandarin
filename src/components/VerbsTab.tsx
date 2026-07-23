import React, { useEffect, useState } from 'react';
import PinyinReveal from './PinyinReveal';
import TTSButton from './TTSButton';
import { Search } from 'lucide-react';

interface Pattern {
  pattern: string;
  exampleHanzi: string;
  examplePinyin: string;
  exampleMeaning: string;
}

interface VerbItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  patterns?: Pattern[];
}

export default function VerbsTab() {
  const [verbs, setVerbs] = useState<VerbItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('data/verbs.json')
      .then(res => res.json())
      .then(data => setVerbs(data))
      .catch(err => console.error("Error loading verbs", err));
  }, []);

  const filteredVerbs = verbs.filter(v =>
    v.hanzi.includes(searchQuery) ||
    v.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full px-4 py-4">
      <div className="mb-6">
        <h2 className="text-2xl font-headline-lg text-on-background">Verbs Reference</h2>
        <p className="font-body-md text-on-surface-variant text-sm mt-1">Study essential verbs, particles, and verb structures.</p>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search verbs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm placeholder:text-outline font-body-md"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
      </div>

      <div className="space-y-4">
        {filteredVerbs.map((v, idx) => (
          <div key={idx} className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <PinyinReveal hanzi={v.hanzi} pinyin={v.pinyin} size="md" />
                <TTSButton text={v.hanzi} />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-outline font-semibold uppercase bg-surface-container-low px-1.5 py-0.5 rounded mr-2">
                Verb
              </span>
              <span className="text-sm text-on-surface-variant font-body-md">{v.meaning}</span>
            </div>

            {v.patterns && v.patterns.length > 0 && (
              <div className="mt-3 border-t border-outline-variant pt-3 space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider text-outline font-bold">Common Patterns</h4>
                <div className="space-y-2.5">
                  {v.patterns.map((pat, pIdx) => (
                    <div key={pIdx} className="bg-surface-container-lowest border border-outline-variant p-2.5 rounded-lg space-y-1">
                      <div className="text-xs font-semibold text-primary">{pat.pattern}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <PinyinReveal hanzi={pat.exampleHanzi} pinyin={pat.examplePinyin} size="sm" />
                        <TTSButton text={pat.exampleHanzi} size={14} />
                      </div>
                      <div className="text-xs text-outline italic">{pat.exampleMeaning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
