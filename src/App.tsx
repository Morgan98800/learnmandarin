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
    { id: 'flashcards' as TabId, label: 'Cards', icon: BookMarked },
    { id: 'sentence-builder' as TabId, label: 'Builder', icon: GitCommit },
    { id: 'dictionary' as TabId, label: 'Search', icon: Search },
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-background text-on-background flex flex-col relative pb-24 border-x-0 sm:border-x border-outline-variant shadow-sm overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full px-4 py-3 bg-surface/95 backdrop-blur-md border-b border-outline-variant flex justify-between items-center shrink-0">
        <h1 className="font-headline-lg-mobile text-base sm:text-lg text-primary uppercase tracking-widest font-bold truncate">
          Mandarin Scholar
        </h1>
        <div className="text-[10px] text-outline font-bold uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded shrink-0">
          Study Tool
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 overflow-x-hidden">
        {activeTab === 'vocab' && <VocabTab />}
        {activeTab === 'grammar' && <GrammarTab />}
        {activeTab === 'verbs' && <VerbsTab />}
        {activeTab === 'flashcards' && <FlashcardsTab />}
        {activeTab === 'sentence-builder' && <SentenceBuilderTab />}
        {activeTab === 'dictionary' && <DictionaryTab />}
      </main>

      {/* Fixed Centered Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-surface/95 backdrop-blur-md border-t border-outline-variant px-1 py-1.5 flex justify-between items-center">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 flex-1 min-w-0 rounded-lg transition-all active:scale-95 duration-100 ${
                isActive 
                  ? 'text-primary font-bold bg-surface-container-low' 
                  : 'text-on-surface-variant opacity-60 hover:opacity-100'
              }`}
            >
              <Icon size={18} className="mb-0.5 shrink-0" />
              <span className="text-[9px] font-semibold tracking-tighter truncate w-full text-center">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
