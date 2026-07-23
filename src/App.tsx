import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  BookMarked, 
  Layers, 
  Activity, 
  GitCommit, 
  Search,
  Sun,
  Moon
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const navigationItems = [
    { id: 'vocab' as TabId, label: 'Vocab', icon: BookOpen },
    { id: 'grammar' as TabId, label: 'Grammar', icon: Layers },
    { id: 'verbs' as TabId, label: 'Verbs', icon: Activity },
    { id: 'flashcards' as TabId, label: 'Cards', icon: BookMarked },
    { id: 'sentence-builder' as TabId, label: 'Builder', icon: GitCommit },
    { id: 'dictionary' as TabId, label: 'Search', icon: Search },
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-background text-on-background flex flex-col relative pb-24 border-x-0 sm:border-x border-outline-variant/80 shadow-sm overflow-x-hidden transition-colors duration-200">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full px-4 py-3 bg-surface/95 backdrop-blur-md border-b border-outline-variant flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="font-headline-lg-mobile text-lg sm:text-xl text-primary font-bold tracking-tight truncate">
            Notes from class
          </h1>
          <span className="text-[10px] text-outline font-bold uppercase tracking-wider bg-surface-container border border-outline-variant/60 px-2 py-0.5 rounded shrink-0">
            课堂笔记
          </span>
        </div>

        {/* Dark Mode Toggle Button (Min 44px Touch Target) */}
        <button
          onClick={toggleDarkMode}
          type="button"
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="min-w-[44px] min-h-[44px] p-2.5 rounded-full hover:bg-surface-container text-on-surface hover:text-primary transition-all flex items-center justify-center border border-outline-variant/50"
        >
          {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-primary" />}
        </button>
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

      {/* Fixed Mobile Navigation Bar with LARGER 24px ICONS */}
      <nav 
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-surface/95 backdrop-blur-md border-t-2 border-outline-variant/80 px-1 py-2 flex justify-between items-center shadow-lg"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        role="navigation"
        aria-label="Main navigation"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1 px-1 flex-1 min-w-[44px] min-h-[54px] rounded-xl transition-all active:scale-95 duration-150 ${
                isActive 
                  ? 'text-primary font-bold bg-primary/10 shadow-xs border border-primary/20' 
                  : 'text-outline hover:text-on-surface hover:bg-surface-container/50'
              }`}
            >
              <Icon size={24} className="mb-1 shrink-0 stroke-[2.2]" />
              <span className="text-[10px] font-semibold tracking-tight truncate w-full text-center">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
