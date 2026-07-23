import React, { useEffect, useState } from 'react';
import VocabCard from './VocabCard';
import DecompositionModal from './DecompositionModal';
import { Search, Filter, BookOpen, Eye, EyeOff } from 'lucide-react';

interface VocabItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  partOfSpeech: string;
  _categoryId?: string;
  _categoryName?: string;
  exampleSentence?: {
    hanzi: string;
    pinyin: string;
    meaning: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function VerbsTab() {
  const [verbs, setVerbs] = useState<VocabItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [decomposeChar, setDecomposeChar] = useState<string | null>(null);
  const [starredWords, setStarredWords] = useState<string[]>([]);
  const [showPinyin, setShowPinyin] = useState<boolean>(true);

  useEffect(() => {
    // Load starred words
    const saved = localStorage.getItem('starred_vocab');
    if (saved) {
      setStarredWords(JSON.parse(saved));
    }

    loadAllVerbs();
  }, []);

  const loadAllVerbs = async () => {
    setLoading(true);
    try {
      // 1. Fetch category index
      const indexRes = await fetch('data/vocab/index.json');
      const cats: Category[] = await indexRes.json();
      setCategories(cats);

      // 2. Fetch all category JSON files in parallel
      const catPromises = cats.map(cat =>
        fetch(`data/vocab/${cat.id}.json`)
          .then(res => res.json())
          .then((items: VocabItem[]) =>
            items.map(item => ({
              ...item,
              _categoryId: cat.id,
              _categoryName: cat.name
            }))
          )
          .catch(() => [])
      );

      const allCatData = await Promise.all(catPromises);
      const flattened = allCatData.flat();

      // 3. Filter entries where partOfSpeech contains "verb"
      const verbEntries = flattened.filter(item =>
        item.partOfSpeech && item.partOfSpeech.toLowerCase().includes('verb')
      );

      // Deduplicate verbs by Hanzi (keep category info)
      const uniqueVerbs: VocabItem[] = [];
      const seenHanzi = new Set<string>();

      for (const item of verbEntries) {
        if (!seenHanzi.has(item.hanzi)) {
          seenHanzi.add(item.hanzi);
          uniqueVerbs.push(item);
        }
      }

      setVerbs(uniqueVerbs);
      setLoading(false);
    } catch (err) {
      console.error("Error aggregating verbs from vocab categories", err);
      setLoading(false);
    }
  };

  const toggleStar = (item: VocabItem) => {
    let updated;
    const isStarred = starredWords.includes(item.hanzi);
    if (isStarred) {
      updated = starredWords.filter(h => h !== item.hanzi);
    } else {
      updated = [...starredWords, item.hanzi];
      const srsSaved = localStorage.getItem('srs_vocab_data') || '{}';
      const srsData = JSON.parse(srsSaved);
      srsData[item.hanzi] = {
        hanzi: item.hanzi,
        pinyin: item.pinyin,
        meaning: item.meaning,
        box: 1,
        nextReview: Date.now()
      };
      localStorage.setItem('srs_vocab_data', JSON.stringify(srsData));
    }
    setStarredWords(updated);
    localStorage.setItem('starred_vocab', JSON.stringify(updated));
  };

  const filteredVerbs = verbs.filter(v => {
    const matchesSearch =
      v.hanzi.includes(searchQuery) ||
      v.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.meaning.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'All' || v._categoryId === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full px-4 py-4">
      <DecompositionModal 
        character={decomposeChar} 
        onClose={() => setDecomposeChar(null)} 
      />

      <div className="mb-6 flex justify-between items-start gap-2">
        <div>
          <h2 className="text-2xl font-headline-lg text-on-background">Verbs Reference</h2>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">
            Dynamic view of all verbs ({verbs.length}) aggregated across vocabulary categories.
          </p>
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

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search verbs by Hanzi, Pinyin, or Meaning..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm placeholder:text-outline font-body-md min-h-[48px]"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" size={18} />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
        <span className="text-xs text-outline font-semibold uppercase flex items-center gap-1 shrink-0 mr-1">
          <Filter size={13} /> Filter:
        </span>
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border shrink-0 min-h-[44px] ${
            selectedCategory === 'All'
              ? 'bg-primary border-primary text-white shadow-sm'
              : 'bg-surface border-outline-variant text-on-surface-variant hover:border-outline'
          }`}
        >
          All Verbs ({verbs.length})
        </button>

        {categories.map((cat) => {
          const catVerbsCount = verbs.filter(v => v._categoryId === cat.id).length;
          if (catVerbsCount === 0) return null;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border shrink-0 min-h-[44px] ${
                selectedCategory === cat.id
                  ? 'bg-primary border-primary text-white shadow-sm'
                  : 'bg-surface border-outline-variant text-on-surface-variant hover:border-outline'
              }`}
            >
              {cat.name} ({catVerbsCount})
            </button>
          );
        })}
      </div>

      {/* Verbs List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredVerbs.length === 0 ? (
        <div className="text-center py-12 text-outline border border-dashed border-outline-variant rounded-xl p-6 bg-surface-container-low">
          <BookOpen className="mx-auto mb-2 opacity-40" size={32} />
          <p className="text-sm font-semibold">No verbs found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVerbs.map((v, idx) => (
            <VocabCard
              key={idx}
              hanzi={v.hanzi}
              pinyin={v.pinyin}
              meaning={v.meaning}
              partOfSpeech={`verb · ${v._categoryName || ''}`}
              showPinyinGlobal={showPinyin}
              isStarred={starredWords.includes(v.hanzi)}
              onToggleStar={() => toggleStar(v)}
              onDecompose={(char) => setDecomposeChar(char)}
              exampleSentence={v.exampleSentence}
            />
          ))}
        </div>
      )}
    </div>
  );
}
