import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import PinyinReveal from './PinyinReveal';
import TTSButton from './TTSButton';
import DecompositionCard from './DecompositionCard';

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
  const [selectedChar, setSelectedChar] = useState<any | null>(null);
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
      // Save details to srs_db in localStorage if not already present
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

  const handleDecompose = (item: VocabItem) => {
    // Find radical info in the 1000 frequency list if it exists
    fetch('data/frequency-1000.json')
      .then(res => res.json())
      .then((chars: any[]) => {
        const found = chars.find(c => c.character === item.hanzi[0]);
        if (found) {
          setSelectedChar({
            character: found.character,
            pinyin: found.pinyin,
            meaning: found.meaning,
            radical: found.radical,
            decomposition: found.decomposition
          });
        } else {
          // Fallback with current item details
          setSelectedChar({
            character: item.hanzi[0],
            pinyin: item.pinyin,
            meaning: item.meaning,
            radical: '',
            decomposition: []
          });
        }
      })
      .catch(() => {
        setSelectedChar({
          character: item.hanzi[0],
          pinyin: item.pinyin,
          meaning: item.meaning,
          radical: '',
          decomposition: []
        });
      });
  };

  if (selectedChar) {
    return (
      <div className="px-container-margin py-lg max-w-md mx-auto">
        <button 
          onClick={() => setSelectedChar(null)}
          className="mb-6 flex items-center text-primary font-label-sm font-semibold uppercase tracking-wider"
        >
          <Icons.ChevronLeft size={16} className="mr-1" /> Back to List
        </button>
        <DecompositionCard 
          character={selectedChar.character}
          pinyin={selectedChar.pinyin}
          meaning={selectedChar.meaning}
          radical={selectedChar.radical}
          decomposition={selectedChar.decomposition}
          onClose={() => setSelectedChar(null)}
        />
      </div>
    );
  }

  if (selectedSection) {
    return (
      <div className="px-container-margin py-lg max-w-md mx-auto">
        <button 
          onClick={() => setSelectedSection(null)}
          className="mb-6 flex items-center text-primary font-label-sm font-semibold uppercase tracking-wider"
        >
          <Icons.ChevronLeft size={16} className="mr-1" /> Categories
        </button>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-headline-lg text-on-background">{selectedSection.name}</h2>
          <span className="text-xs text-outline font-semibold uppercase bg-surface-container px-2 py-1 rounded">
            {vocabItems.length} words
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {vocabItems.map((item, idx) => {
              const isStarred = starredWords.includes(item.hanzi);
              return (
                <div key={idx} className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Interactive Pinyin Reveal */}
                      <PinyinReveal hanzi={item.hanzi} pinyin={item.pinyin} size="md" />
                      <TTSButton text={item.hanzi} />
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleDecompose(item)}
                        title="Decompose character"
                        className="p-2 text-outline hover:text-primary rounded-full hover:bg-surface-container transition-all"
                      >
                        <Icons.GitMerge size={16} />
                      </button>
                      <button 
                        onClick={() => toggleStar(item)}
                        className={`p-2 rounded-full hover:bg-surface-container transition-all ${isStarred ? 'text-primary' : 'text-outline hover:text-primary'}`}
                      >
                        <Icons.Star size={16} fill={isStarred ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-outline font-semibold uppercase bg-surface-container-low px-1.5 py-0.5 rounded mr-2">
                      {item.partOfSpeech}
                    </span>
                    <span className="text-sm text-on-surface-variant font-body-md">{item.meaning}</span>
                  </div>

                  {item.exampleSentence && (
                    <div className="mt-2 pl-3 border-l-2 border-outline-variant bg-surface-container-lowest p-2.5 rounded-r-lg flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <PinyinReveal 
                          hanzi={item.exampleSentence.hanzi} 
                          pinyin={item.exampleSentence.pinyin} 
                          size="sm" 
                        />
                        <TTSButton text={item.exampleSentence.hanzi} size={16} />
                      </div>
                      <p className="text-xs text-outline italic mt-1">{item.exampleSentence.meaning}</p>
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

  return (
    <div className="px-container-margin py-lg max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-headline-lg text-on-background">Vocabulary</h2>
        <p className="font-body-md text-on-surface-variant text-sm mt-1">Select a category to study.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sections.map((section) => {
          const IconComponent = (Icons as any)[section.icon] || Icons.BookOpen;
          return (
            <button
              key={section.id}
              onClick={() => loadSection(section)}
              className="flex flex-col items-center p-4 bg-surface border border-outline-variant rounded-xl active:scale-95 transition-transform duration-150 text-center w-full"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3 text-primary">
                <IconComponent size={24} />
              </div>
              <span className="text-sm font-semibold text-on-background font-body-md">{section.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
