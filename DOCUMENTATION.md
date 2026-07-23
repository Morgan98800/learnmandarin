# Notes from class — App Architecture & Technical Documentation

## 1. Executive Summary & Overview

**Notes from class** (formerly Mandarin Scholar) is a modern, responsive, offline-capable Mandarin Chinese learning application engineered specifically for mobile-first and desktop pair-learning. Built with React 19, TypeScript, Vite, and Tailwind CSS v4, the application provides an intuitive reference system and spaced repetition study tool without requiring a backend database.

### Core Modules:
1. **Vocabulary Explorer (`VocabTab.tsx`)**: 11 topic categories (Ordering Food, Travel, Family, Clothes, Directions, Numbers, Time & Dates, Greetings, Emotions, Work & School, General Basics) containing over 1,150+ vocabulary entries with real-time global/category search filtering and Multi-Select Custom Study Deck mode.
2. **Dynamic Verbs Reference (`VerbsTab.tsx`)**: A single-source-of-truth view that dynamically aggregates, deduplicates, and categorizes verbs across all vocabulary modules with horizontal category filter pills.
3. **Grammar & Patterns (`GrammarTab.tsx`)**: Structural Chinese grammar rules categorized by HSK/CEFR difficulty levels with interactive Pinyin reveals and example sentences.
4. **Spaced Repetition System (SRS) Flashcards (`FlashcardsTab.tsx`)**: Leitner 5-box algorithm for reviewing the Top 1,000 Chinese characters or user-starred vocabulary with human-friendly progress stage badges (`New / Practice`, `Learning`, `Reviewing`, `Comfortable`, `Mastered`).
5. **Interactive Sentence Builder (`SentenceBuilderTab.tsx`)**: Character tile arrangement puzzle game for testing Chinese word order and sentence structure.
6. **Dictionary Search (`DictionaryTab.tsx`)**: Instant offline search across the dictionary database by Hanzi, Pinyin, or English gloss.
7. **MakeMeAHanzi Character Decomposition & Etymology Engine (`DecompositionView.tsx` / `DecompositionModal.tsx`)**: Interactive spatial breakdown of Chinese characters into constituent radicals, semantic/phonetic components, etymology formation hints, and `hanzi-writer` stroke order animations.

---

## 2. Technology Stack & UX Accessibility Systems

### 2.1 Technology Stack
* **Framework**: React 19 + TypeScript (Strict Mode)
* **Build Tooling & Bundler**: Vite 8 + Rolldown / ESBuild
* **Styling Engine**: Tailwind CSS v4 using CSS `@theme` design tokens
* **Dark Mode & Theme Engine**: Instant theme switcher (Sun / Moon toggle) with persistent `localStorage` theme state (`.dark` class on root document element).
* **Canvas Vector Engine**: `hanzi-writer` for real-time SVG stroke animations
* **Enhanced Audio Engine (`TTSButton.tsx`)**: Web Speech Synthesis API querying native Chinese voice engines (`Ting-Ting`, `Mei-Jia`, `Sin-Ji`, `Xiaoxiao`, `zh-CN`) with an animated 3-bar audio equalizer playing indicator.
* **Icon System**: `lucide-react` with enlarged **24px navigation icons** in bottom bar (`min-h-[54px]` touch target).
* **Deployment**: GitHub Pages (`gh-pages`)

### 2.2 Mobile Ergonomics & High Contrast System
* **Touch Targets ($\ge 44\text{px}$)**: All interactive buttons, icon buttons, and navigation elements enforce a minimum hitbox area of $44\text{px} \times 44\text{px}$ or $54\text{px}$ touch height. Explicit `aria-label` tags are attached to all icon controls for iOS VoiceOver compatibility.
* **Enhanced High Contrast Borders**: High-contrast borders (`border-2 border-outline-variant/80`) provide crisp visual separation for cards, inputs, and controls in both Light and Dark themes.

### 2.3 Dark Mode & Light Mode CSS Tokens
```css
/* Light Mode (Rice Paper & Imperial Red) */
:root {
  --color-primary: #9e2016;
  --color-background: #fff8f6;
  --color-on-background: #261816;
  --color-surface: #fff8f6;
  --color-on-surface: #261816;
  --color-outline: #8d706c;
  --color-outline-variant: #e1bfb9;
}

/* Dark Mode (Warm Charcoal & Glowing Crimson) */
.dark {
  --color-primary: #ff5252;
  --color-background: #140d0c;
  --color-on-background: #f5e8e4;
  --color-surface: #1e1513;
  --color-on-surface: #f5e8e4;
  --color-outline: #b5948f;
  --color-outline-variant: #523c37;
}
```

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
        SSOT --> VT[Vocab Tab (Search & Multi-Select Deck)]
        SSOT --> VR[Verbs Tab (Filtered Query)]
        VT --> VC[VocabCard Component]
        VR --> VC
        VC --> PP[PinyinPill Component]
        VC --> TT[TTSButton (Chinese Voice + Audio Bars)]
        VC --> DM[DecompositionModal]
        MH --> DM
        DM --> DV[DecompositionView]
        DM --> HW[HanziWriter Canvas]
    end

    subgraph State Storage
        LS[(Browser LocalStorage)] <--> |Starred Words, Theme Mode & SRS State| VT
        LS <--> |Leitner Box Intervals & Stage Badges| FlashcardsTab
    end
```

---

## 4. Key Component Systems

### 4.1 Header & Navigation (`App.tsx`)
* **Renamed Header**: App renamed to **Notes from class** with subtitle tag **课堂笔记**.
* **Dark Mode Switcher**: Header Sun/Moon icon toggle instantly flips between Light Mode and Dark Mode.
* **Larger 24px Navigation Bar**: Bottom navigation bar icons enlarged to **24px stroke-width 2.2** for prominent touch selection.

### 4.2 Audio Pronunciation with Playing Indicator (`TTSButton.tsx`)
* Automatically queries browser SpeechSynthesis voices for preferred native Chinese voices (`Ting-Ting`, `Mei-Jia`, `Sin-Ji`, `Xiaoxiao`, `zh-CN`).
* Renders an animated 3-bar equalizer graphic and ring pulse while audio is playing.

### 4.3 Unified `VocabCard` Component (`VocabCard.tsx`)
Features a 2-row full-width layout with high-contrast borders, 44px touch targets, and expandable example sentence accordion:

```
+-------------------------------------------------------------------------+
| [ TOP ROW ]                                                             |
|  木木木  (48-56px Hanzi)  [🔊 TTS (44px)]    [✨ Decompose (44px)] [⭐ Star] |
|                                                                         |
| [ SECOND ROW ]                                                          |
|  [ pīn yīn · reveal ] (44px)           [VERB] to meet, to know someone  |
|                                                                         |
| [ ACCORDION SECTION - COLLAPSIBLE ▾ ]                                   |
|  Example sentence ▾                                                     |
|  | 认识你很高兴。 (Rènshi nǐ hěn gāoxìng.)                               |
|  | Nice to meet you.                                                    |
+-------------------------------------------------------------------------+
```

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
│   └── data/
│       ├── frequency-1000.json      # Top 1000 Hanzi + Etymology + Decomposition
│       ├── dictionary.json          # Offline dictionary lookup data
│       ├── grammar.json             # HSK Grammar points & structural formulas
│       └── vocab/                   # SINGLE SOURCE OF TRUTH FOR VOCABULARY
│           ├── index.json           # Category directory index
│           ├── basics.json          # General basic phrases & vocabulary
│           ├── clothes.json         # Apparel & accessories
│           ├── directions.json      # Spatial orientation & navigation
│           ├── emotions.json        # Feelings & mental states
│           ├── family.json          # Kinship terms
│           ├── greetings.json       # Salutations & meeting phrases
│           ├── numbers.json         # Numerals & measure words
│           ├── ordering-food.json   # Culinary & dining vocabulary
│           ├── time-dates.json      # Calendar & temporal expressions
│           ├── travel.json          # Transit & tourism
│           └── work-school.json     # Professional & academic terms
├── src/
│   ├── components/
│   │   ├── DecompositionCard.tsx   # Stroke order canvas + Etymology details card
│   │   ├── DecompositionModal.tsx  # Pop-up modal wrapper for decomposition
│   │   ├── DecompositionView.tsx   # Interactive spatial tap-to-decompose component
│   │   ├── DictionaryTab.tsx       # Search dictionary view
│   │   ├── FlashcardsTab.tsx       # SRS Leitner flashcard review system + Human badges
│   │   ├── GrammarTab.tsx          # Grammar rules & pattern list
│   │   ├── PinyinPill.tsx          # Interactive pill-styled Pinyin reveal control (44px)
│   │   ├── PinyinReveal.tsx        # Inline Hanzi character Pinyin reveal wrapper
│   │   ├── SentenceBuilderTab.tsx  # Word order arrangement puzzle
│   │   ├── TTSButton.tsx           # Chinese voice selection + Animated audio equalizer
│   │   ├── VerbsTab.tsx            # Dynamic aggregated verb reference view
│   │   └── VocabCard.tsx           # Unified 2-row card + Expandable Example Accordion
│   ├── utils/
│   │   ├── charLookup.ts           # Character metadata & etymology fetcher
│   │   └── radicalData.ts          # Kangxi radical dictionary lookup
│   ├── App.tsx                     # Top-level shell ("Notes from class"), Dark Mode & 24px nav
│   ├── index.css                   # Tailwind v4 theme + Dark mode tokens + High contrast borders
│   └── main.tsx                    # React application entry point
├── fetch_hanzi.py                  # Python pipeline script for makemeahanzi enrichment
└── package.json                    # Dependencies & build/deploy scripts
```
