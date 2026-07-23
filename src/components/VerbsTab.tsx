import React, { useEffect, useState } from 'react';
import VocabCard from './VocabCard';
import DecompositionModal from './DecompositionModal';
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
  const [decomposeChar, setDecomposeChar] = useState<string | null>(null);

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
      <DecompositionModal 
        character={decomposeChar} 
        onClose={() => setDecomposeChar(null)} 
      />

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
          <VocabCard
            key={idx}
            hanzi={v.hanzi}
            pinyin={v.pinyin}
            meaning={v.meaning}
            partOfSpeech="verb"
            onDecompose={(char) => setDecomposeChar(char)}
            patterns={v.patterns}
          />
        ))}
      </div>
    </div>
  );
}
