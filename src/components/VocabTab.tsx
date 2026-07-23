import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import VocabCard from './VocabCard';
import DecompositionModal from './DecompositionModal';

interface VocabItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  partOfSpeech: string;
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
  const [loading, setLoading] = useState(false);
  const [decomposeChar, setDecomposeChar] = useState<string | null>(null);
  const [starredWords, setStarredWords] = useState<string[]>([]);

  useEffect(() => {
    // Load index
    fetch('data/vocab/index.json')
      .then(res => res.json())
      .then(data => setSections(data))
      .catch(err => console.error("Error loading vocab index", err));

    // Load starred words for flashcards
    const saved = localStorage.getItem('starred_vocab');
    if (saved) {
      setStarredWords(JSON.parse(saved));
    }
  }, []);

  const loadSection = (section: Section) => {
    setLoading(true);
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

  if (selectedSection) {
    return (
      <div className="w-full px-4 py-4">
        <DecompositionModal 
          character={decomposeChar} 
          onClose={() => setDecomposeChar(null)} 
        />

        <button 
          onClick={() => setSelectedSection(null)}
          className="mb-4 flex items-center text-primary font-label-sm font-semibold uppercase tracking-wider hover:underline"
        >
          <Icons.ChevronLeft size={16} className="mr-1" /> Categories
        </button>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-headline-lg text-on-background">{selectedSection.name}</h2>
          <span className="text-xs text-outline font-semibold uppercase bg-surface-container px-2.5 py-0.5 rounded">
            {vocabItems.length} words
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {vocabItems.map((item, idx) => (
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
        <p className="font-body-md text-on-surface-variant text-xs sm:text-sm mt-0.5">Select a category to study.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 w-full">
        {sections.map((section) => {
          const IconComponent = (Icons as any)[section.icon] || Icons.BookOpen;
          return (
            <button
              key={section.id}
              onClick={() => loadSection(section)}
              className="flex items-center p-3 bg-surface border border-outline-variant rounded-xl hover:bg-surface-container-low active:scale-95 transition-all text-left w-full gap-2.5 shadow-xs min-w-0 overflow-hidden"
            >
              <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                <IconComponent size={18} />
              </div>
              <span className="text-xs font-semibold text-on-background font-body-md leading-tight truncate min-w-0 flex-1">{section.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
