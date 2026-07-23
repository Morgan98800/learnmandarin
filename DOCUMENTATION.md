# Notes from class — App Architecture & Technical Documentation

## 1. Executive Summary & Overview

**Notes from class** (formerly Mandarin Scholar) is a modern, responsive, offline-capable Progressive Web Application (PWA) engineered specifically for mobile-first and desktop pair-learning. Built with React 19, TypeScript, Vite, and Tailwind CSS v4, the application provides an installable home-screen app experience with 100% offline capability (on the subway/airplane) without requiring a backend server.

### Core Modules:
1. **Vocabulary Explorer (`VocabTab.tsx`)**: 11 topic categories (Ordering Food, Travel, Family, Clothes, Directions, Numbers, Time & Dates, Greetings, Emotions, Work & School, General Basics) containing over 1,150+ vocabulary entries with real-time global/category search filtering and a **global Pinyin ON/OFF toggle**.
2. **Dynamic Verbs Reference (`VerbsTab.tsx`)**: A single-source-of-truth view that dynamically aggregates, deduplicates, and categorizes verbs across all vocabulary modules with horizontal category filter pills and a **global Pinyin ON/OFF toggle**.
3. **Grammar & Patterns (`GrammarTab.tsx`)**: Structural Chinese grammar rules categorized by HSK/CEFR difficulty levels with interactive Pinyin reveals, example sentences, and a **global Pinyin ON/OFF toggle**.
4. **Spaced Repetition System (SRS) Flashcards (`FlashcardsTab.tsx`)**: Leitner 5-box algorithm for reviewing the Top 1,000 Chinese characters or user-starred vocabulary with human-friendly progress stage badges (`New / Practice`, `Learning`, `Reviewing`, `Comfortable`, `Mastered`) and instant component decomposition.
5. **Upgraded Interactive Sentence Builder (`SentenceBuilderTab.tsx`)**: Character tile arrangement puzzle game featuring **Difficulty Levels (Easy/Medium/Hard)**, **Score Tracking & Progress Bar**, **Helpful Hints**, **Global Pinyin Toggle**, **TTS Button**, and **High-Contrast Dark Mode Tiles**.
6. **Dictionary Search (`DictionaryTab.tsx`)**: Instant offline search across the dictionary database by Hanzi, Pinyin, or English gloss.
7. **MakeMeAHanzi Character Decomposition & Etymology Engine (`DecompositionView.tsx` / `DecompositionModal.tsx`)**: Interactive spatial breakdown of Chinese characters into constituent radicals, semantic/phonetic components, etymology formation hints, and `hanzi-writer` stroke order animations with **instant component decomposition upon opening**.

---

## 2. Technology Stack, PWA & Accessibility Systems

### 2.1 Technology Stack & PWA Engine
* **Framework**: React 19 + TypeScript (Strict Mode)
* **Build Tooling & Bundler**: Vite 8 + Rolldown / ESBuild
* **PWA Web Manifest (`manifest.webmanifest`)**: Configured for `standalone` display mode, portrait orientation, Imperial Red theme color (`#9e2016`), and dark background (`#140d0c`).
* **PWA Service Worker (`sw.js`)**: Pre-caches all HTML, JS, CSS, and 14 JSON data files on installation. Employs a Cache-First / Stale-While-Revalidate caching strategy for 100% offline subway/airplane usability.
* **App Installation Prompt (`App.tsx`)**: Header **Install** button triggers native Android/Desktop installation; displays an iOS Safari **Add to Home Screen** guide for iPhone users.
* **Styling Engine**: Tailwind CSS v4 using CSS `@theme` design tokens
* **Dark Mode & Theme Engine**: Instant theme switcher (Sun / Moon toggle) with persistent `localStorage` theme state (`.dark` class on root document element).
* **Canvas Vector Engine**: `hanzi-writer` for real-time SVG stroke animations
* **Enhanced Audio Engine (`TTSButton.tsx`)**: Web Speech Synthesis API querying native Chinese voice engines (`Ting-Ting`, `Mei-Jia`, `Sin-Ji`, `Xiaoxiao`, `zh-CN`) with an **iOS Silent Mode Hardware Audio Unlocker** and an animated 3-bar audio equalizer playing indicator.
* **Icon System**: `lucide-react` with enlarged **24px navigation icons** in bottom bar (`min-h-[54px]` touch target) and `GitMerge` decomposition icons.
* **Deployment**: GitHub Pages (`gh-pages`)

### 2.2 Mobile Ergonomics & High Contrast System
* **Touch Targets ($\ge 44\text{px}$)**: All interactive buttons, icon buttons, and navigation elements enforce a minimum hitbox area of $44\text{px} \times 44\text{px}$ or $54\text{px}$ touch height. Explicit `aria-label` tags are attached to all icon controls for iOS VoiceOver compatibility.
* **iOS Silent Mode Audio Override**: Automatically initializes and resumes a silent Web Audio context prior to TTS playback to bypass the hardware silent/vibrate switch on iPhones (`AVAudioSessionCategoryPlayback`).
* **High Contrast Dark Mode Tiles**: High-contrast surface tokens (`bg-surface`, `border-2 border-outline-variant`) eliminate harsh white text tiles in dark mode.

---

## 3. Data Schemas & Architecture

```mermaid
flowchart TD
    subgraph Data Sources
        V[vocab/*.json] --> SSOT[Single Source of Truth]
        G[grammar.json] --> GT[Grammar Tab]
        D[dictionary.json] --> DT[Dictionary Tab]
        MH[frequency-1000.json] --> DE[Decomposition & Etymology Engine]
    end

    subgraph Core Components
        SSOT --> VT[Vocab Tab (Search & Pinyin Toggle)]
        SSOT --> VR[Verbs Tab (Filtered Query & Pinyin Toggle)]
        SSOT --> SB[Sentence Builder (Difficulty & Hints)]
        VT --> VC[VocabCard Component]
        VR --> VC
        VC --> PP[PinyinPill Component]
        VC --> TT[TTSButton (iOS Silent Unlocker + Audio Bars)]
        VC --> DM[DecompositionModal (Instant Decomposition)]
        MH --> DM
        DM --> DV[DecompositionView]
        DM --> HW[HanziWriter Canvas]
    end

    subgraph Offline PWA & Service Worker
        SW[sw.js Service Worker] <--> |Cache-First Pre-caching| V
        SW <--> |Stale-While-Revalidate| G
        SW <--> |Full Offline Support| D
    end

    subgraph State Storage
        LS[(Browser LocalStorage)] <--> |Starred Words, Theme Mode & SRS State| VT
        LS <--> |Leitner Box Intervals & Stage Badges| FlashcardsTab
    end
```

---

## 4. Key Component Systems

### 4.1 PWA & Standalone Installation (`App.tsx` / `sw.js` / `manifest.webmanifest`)
* **Standalone Mode**: Configures iOS & Android webview parameters so the app launches fullscreen without browser address bars.
* **Pre-cached Offline Storage**: `sw.js` automatically downloads and caches all 1,150+ vocabulary entries, Top 1,000 Hanzi etymology dictionary, HSK grammar rules, and search databases.

---

## 5. Build & Deployment Pipeline

The project includes an automated deployment workflow:
1. `tsc -b`: Type-checks the entire TypeScript codebase using strict mode (`verbatimModuleSyntax: true`).
2. `vite build`: Compiles production assets into `dist/`.
3. `gh-pages -d dist`: Publishes built artifacts to the `gh-pages` branch hosted at `https://morgan98800.github.io/learnmandarin/`.

---

## 6. Directory Map

```
mandarin-app/
├── public/
│   ├── apple-touch-icon.png         # iOS Home Screen App Icon (180x180)
│   ├── icon-192.png                 # PWA App Icon (192x192)
│   ├── icon-512.png                 # PWA App Icon (512x512)
│   ├── manifest.webmanifest         # PWA Web Application Manifest
│   ├── sw.js                        # PWA Service Worker for 100% offline caching
│   └── data/                        # SINGLE SOURCE OF TRUTH FOR VOCABULARY & DATA
│       ├── frequency-1000.json      # Top 1000 Hanzi + Etymology + Decomposition
│       ├── dictionary.json          # Offline dictionary lookup data
│       ├── grammar.json             # HSK Grammar points & structural formulas
│       └── vocab/                   # Category vocabulary JSON files
├── src/
│   ├── components/
│   │   ├── DecompositionCard.tsx   # Stroke order canvas + Etymology details card
│   │   ├── DecompositionModal.tsx  # Pop-up modal wrapper for decomposition
│   │   ├── DecompositionView.tsx   # Instant spatial tap-to-decompose component
│   │   ├── DictionaryTab.tsx       # Search dictionary view
│   │   ├── FlashcardsTab.tsx       # SRS Leitner flashcard review system + Human badges
│   │   ├── GrammarTab.tsx          # Grammar rules + Global Pinyin Toggle
│   │   ├── PinyinPill.tsx          # Interactive pill-styled Pinyin reveal control (44px)
│   │   ├── PinyinReveal.tsx        # Inline Hanzi character Pinyin reveal wrapper
│   │   ├── SentenceBuilderTab.tsx  # Upgraded puzzle + Difficulty levels + Hints + Score
│   │   ├── TTSButton.tsx           # iOS Silent Unlocker + Chinese Voice + Audio Equalizer
│   │   ├── VerbsTab.tsx            # Dynamic aggregated verbs + Global Pinyin Toggle
│   │   └── VocabCard.tsx           # Unified 2-row card + GitMerge icon + Pinyin Toggle
│   ├── utils/
│   │   ├── charLookup.ts           # Character metadata & etymology fetcher
│   │   └── radicalData.ts          # Kangxi radical dictionary lookup
│   ├── App.tsx                     # Top-level shell ("Notes from class"), Dark Mode & PWA Install
│   ├── index.css                   # Tailwind v4 theme + Dark mode tokens + High contrast borders
│   └── main.tsx                    # React application entry point + Service Worker Registration
├── fetch_hanzi.py                  # Python pipeline script for makemeahanzi enrichment
└── package.json                    # Dependencies & build/deploy scripts
```
