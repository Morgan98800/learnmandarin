import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import PinyinReveal from './PinyinReveal';
import TTSButton from './TTSButton';
import DecompositionModal from './DecompositionModal';

interface DictEntry {
  hanzi: string;
  pinyin: string;
  meaning: string;
  definition: string;
}

export default function DictionaryTab() {
  const [dictionary, setDictionary] = useState<DictEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [decomposeChar, setDecomposeChar] = useState<string | null>(null);

  useEffect(() => {
    fetch('data/dictionary.json')
      .then(res => res.json())
      .then(data => {
        setDictionary(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading dictionary", err);
        setLoading(false);
      });
  }, []);

  const filteredEntries = searchQuery.trim() === ''
    ? []
    : dictionary.filter(entry => 
        entry.hanzi.includes(searchQuery) ||
        entry.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.meaning.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="w-full px-4 py-4 flex flex-col">
      <DecompositionModal 
        character={decomposeChar} 
        onClose={() => setDecomposeChar(null)} 
      />

      <div className="mb-6">
        <h2 className="text-2xl font-headline-lg text-on-background">Dictionary Search</h2>
        <p className="font-body-md text-on-surface-variant text-sm mt-1">Look up words by Hanzi, Pinyin, or English translation.</p>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Type to search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm placeholder:text-outline font-body-md"
        />
        <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : searchQuery.trim() === '' ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-outline">
          <Icons.Search className="opacity-30 mb-2" size={32} />
          <p className="text-sm font-body-md">Search across {dictionary.length} local vocabulary entries.</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-outline">
          <Icons.HelpCircle className="opacity-30 mb-2" size={32} />
          <p className="text-sm font-body-md">No entries found for "{searchQuery}".</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredEntries.map((entry, idx) => (
            <div key={idx} className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <PinyinReveal 
                    hanzi={entry.hanzi} 
                    pinyin={entry.pinyin} 
                    size="md" 
                    onDecompose={(char) => setDecomposeChar(char)}
                  />
                  <TTSButton text={entry.hanzi} />
                </div>
              </div>
              <div className="text-sm text-on-surface-variant font-body-md leading-normal">
                {entry.definition}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
