import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import VocabCard from './VocabCard';
import DecompositionModal from './DecompositionModal';

interface VocabItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  partOfSpeech: string;
  _categoryName?: string;
  exampleSentence?: {
    hanzi: string;
    pinyin: string;
    meaning: string;
  };
}

interface Section {
  id: string;
  name: string;
  icon: string;
}

export default function VocabTab() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [allVocab, setAllVocab] = useState<VocabItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [decomposeChar, setDecomposeChar] = useState<string | null>(null);
  const [starredWords, setStarredWords] = useState<string[]>([]);

  useEffect(() => {
    // Load index & preload all vocab for global search
    fetch('data/vocab/index.json')
      .then(res => res.json())
      .then((data: Section[]) => {
        setSections(data);
        preloadAllVocab(data);
      })
      .catch(err => console.error("Error loading vocab index", err));

    // Load starred words for flashcards
    const saved = localStorage.getItem('starred_vocab');
    if (saved) {
      setStarredWords(JSON.parse(saved));
    }
  }, []);

  const preloadAllVocab = async (cats: Section[]) => {
    try {
      const catPromises = cats.map(cat =>
        fetch(`data/vocab/${cat.id}.json`)
          .then(res => res.json())
          .then((items: VocabItem[]) =>
            items.map(item => ({ ...item, _categoryName: cat.name }))
          )
          .catch(() => [])
      );
      const results = await Promise.all(catPromises);
      setAllVocab(results.flat());
    } catch (err) {
      console.error("Error preloading all vocab", err);
    }
  };

  const loadSection = (section: Section) => {
    setLoading(true);
    setSearchQuery('');
    fetch(`data/vocab/${section.id}.json`)
      .then(res => res.json())
      .then(data => {
        setVocabItems(data);
        setSelectedSection(section);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading section data", err);
        setLoading(false);
      });
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

  const handleDecompose = (char: string) => {
    setDecomposeChar(char);
  };

  // Search filtering inside selected category
  const filteredCategoryItems = vocabItems.filter(item =>
    item.hanzi.includes(searchQuery) ||
    item.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Global search filtering across all categories
  const filteredGlobalItems = allVocab.filter(item =>
    item.hanzi.includes(searchQuery) ||
    item.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered categories grid
  const filteredSections = sections.filter(sec =>
    sec.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSection) {
    return (
      <div className="w-full px-4 py-4">
        <DecompositionModal 
          character={decomposeChar} 
          onClose={() => setDecomposeChar(null)} 
        />

        <button 
          onClick={() => {
            setSelectedSection(null);
            setSearchQuery('');
          }}
          className="mb-4 flex items-center text-primary font-label-sm font-semibold uppercase tracking-wider hover:underline"
        >
          <Icons.ChevronLeft size={16} className="mr-1" /> Categories
        </button>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-headline-lg text-on-background">{selectedSection.name}</h2>
          <span className="text-xs text-outline font-semibold uppercase bg-surface-container px-2.5 py-0.5 rounded">
            {filteredCategoryItems.length} words
          </span>
        </div>

        {/* Category Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={`Search in ${selectedSection.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm placeholder:text-outline font-body-md min-h-[44px]"
          />
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary p-1"
            >
              ✕
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCategoryItems.length === 0 ? (
          <div className="text-center py-12 text-outline border border-dashed border-outline-variant rounded-xl p-6 bg-surface-container-low">
            <Icons.BookOpen className="mx-auto mb-2 opacity-40" size={32} />
            <p className="text-sm font-semibold">No words matching "{searchQuery}".</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategoryItems.map((item, idx) => (
              <VocabCard
                key={idx}
                hanzi={item.hanzi}
                pinyin={item.pinyin}
                meaning={item.meaning}
                partOfSpeech={item.partOfSpeech}
                isStarred={starredWords.includes(item.hanzi)}
                onToggleStar={() => toggleStar(item)}
                onDecompose={handleDecompose}
                exampleSentence={item.exampleSentence}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 overflow-hidden">
      <DecompositionModal 
        character={decomposeChar} 
        onClose={() => setDecomposeChar(null)} 
      />

      <div className="mb-4">
        <h2 className="text-xl font-headline-lg text-on-background">Vocabulary</h2>
        <p className="font-body-md text-on-surface-variant text-xs sm:text-sm mt-0.5">Explore categories or search across 1,150+ words.</p>
      </div>

      {/* Global Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search all vocabulary (e.g. 妈妈, māma, mom)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm placeholder:text-outline font-body-md min-h-[44px]"
        />
        <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Global Search Results Mode */}
      {searchQuery.trim() !== '' ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-outline uppercase">
              Search Results ({filteredGlobalItems.length})
            </span>
          </div>

          {filteredGlobalItems.length === 0 ? (
            <div className="text-center py-12 text-outline border border-dashed border-outline-variant rounded-xl p-6 bg-surface-container-low">
              <Icons.Search className="mx-auto mb-2 opacity-40" size={32} />
              <p className="text-sm font-semibold">No vocabulary words found for "{searchQuery}".</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGlobalItems.map((item, idx) => (
                <VocabCard
                  key={idx}
                  hanzi={item.hanzi}
                  pinyin={item.pinyin}
                  meaning={item.meaning}
                  partOfSpeech={`${item.partOfSpeech}${item._categoryName ? ' · ' + item._categoryName : ''}`}
                  isStarred={starredWords.includes(item.hanzi)}
                  onToggleStar={() => toggleStar(item)}
                  onDecompose={handleDecompose}
                  exampleSentence={item.exampleSentence}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {filteredSections.map((section) => {
            const IconComponent = (Icons as any)[section.icon] || Icons.BookOpen;
            return (
              <button
                key={section.id}
                onClick={() => loadSection(section)}
                className="flex items-center p-3 bg-surface border border-outline-variant rounded-xl hover:bg-surface-container-low active:scale-95 transition-all text-left w-full gap-2.5 shadow-xs min-w-0 overflow-hidden min-h-[56px]"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <IconComponent size={18} />
                </div>
                <span className="text-xs font-semibold text-on-background font-body-md leading-tight truncate min-w-0 flex-1">{section.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
