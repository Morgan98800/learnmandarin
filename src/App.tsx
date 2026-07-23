import React, { useState } from 'react';
import { 
  BookOpen, 
  BookMarked, 
  Layers, 
  Activity, 
  GitCommit, 
  Search 
} from 'lucide-react';
import VocabTab from './components/VocabTab';
import GrammarTab from './components/GrammarTab';
import VerbsTab from './components/VerbsTab';
import FlashcardsTab from './components/FlashcardsTab';
import SentenceBuilderTab from './components/SentenceBuilderTab';
import DictionaryTab from './components/DictionaryTab';

type TabId = 'vocab' | 'grammar' | 'verbs' | 'flashcards' | 'sentence-builder' | 'dictionary';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('vocab');

  const navigationItems = [
    { id: 'vocab' as TabId, label: 'Vocab', icon: BookOpen },
    { id: 'grammar' as TabId, label: 'Grammar', icon: Layers },
    { id: 'verbs' as TabId, label: 'Verbs', icon: Activity },
    { id: 'flashcards' as TabId, label: 'Flashcards', icon: BookMarked },
    { id: 'sentence-builder' as TabId, label: 'Builder', icon: GitCommit },
    { id: 'dictionary' as TabId, label: 'Search', icon: Search },
  ];

  return (
    <div className="w-full min-h-screen bg-background text-on-background max-w-md mx-auto border-x border-outline-variant flex flex-col relative pb-24">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-container-margin py-md sticky top-0 z-40 bg-surface border-b border-outline-variant">
        <h1 className="font-headline-lg-mobile text-lg text-primary uppercase tracking-widest font-bold">
          Mandarin Scholar
        </h1>
        <div className="text-[10px] text-outline font-bold uppercase tracking-wider bg-surface-container px-2.5 py-1 rounded">
          Study Tool
        </div>
      </header>

      {/* Main Tab Render */}
      <main className="flex-1">
        {activeTab === 'vocab' && <VocabTab />}
        {activeTab === 'grammar' && <GrammarTab />}
        {activeTab === 'verbs' && <VerbsTab />}
        {activeTab === 'flashcards' && <FlashcardsTab />}
        {activeTab === 'sentence-builder' && <SentenceBuilderTab />}
        {activeTab === 'dictionary' && <DictionaryTab />}
      </main>

      {/* Navigation Footer */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-45 flex justify-around items-center px-2 py-2 bg-surface border-t border-outline-variant">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all active:scale-95 duration-100 ${
                isActive 
                  ? 'text-primary font-bold bg-surface-container-low' 
                  : 'text-on-surface-variant opacity-60 hover:opacity-100'
              }`}
            >
              <Icon size={18} className="mb-1" />
              <span className="text-[9px] font-semibold tracking-wider font-label-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
