# Mandarin Scholar — App Architecture & Technical Documentation

## 1. Executive Summary & Overview

**Mandarin Scholar** is a modern, responsive, offline-capable Mandarin Chinese learning application engineered specifically for mobile-first and desktop pair-learning. Built with React 19, TypeScript, Vite, and Tailwind CSS v4, the application provides an intuitive reference system and spaced repetition study tool without requiring a backend database.

### Core Modules:
1. **Vocabulary Explorer (`VocabTab.tsx`)**: 11 topic categories (Ordering Food, Travel, Family, Clothes, Directions, Numbers, Time & Dates, Greetings, Emotions, Work & School, General Basics) containing over 1,150+ vocabulary entries with real-time global/category search filtering and **Multi-Select Custom Study Deck mode**.
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
* **Canvas Vector Engine**: `hanzi-writer` for real-time SVG stroke animations
* **Audio Engine**: Web Speech Synthesis API (`window.speechSynthesis` configured with `zh-CN` voice fallback)
* **Icon System**: `lucide-react`
* **Deployment**: GitHub Pages (`gh-pages`)

### 2.2 Mobile Ergonomics & Touch Target System ($\ge 44\text{px}$)
All interactive buttons and icon controls enforce a minimum hit box area of $44\text{px} \times 44\text{px}$ (`min-w-[44px] min-h-[44px]`), preventing accidental miss-taps on iOS/Android mobile screens. Explicit `aria-label` tags are attached to all icon controls for iOS VoiceOver compatibility.

### 2.3 Keyframe Animations & Focus Rings
* `@keyframes slideUp`: Smooth 60fps staggered entrance animations for category grids and vocabulary cards.
* `*:focus-visible`: Visible primary-colored outline rings (`2px solid #9e2016`) for desktop keyboard navigation.
* `@media (prefers-reduced-motion)`: Graceful accessibility fallback for motion-sensitive users.

### 2.4 Design System & Material Design 3 HSL Tokens
```css
@theme {
  --color-primary: #9e2016; /* Imperial Red */
  --color-on-primary: #ffffff;
  --color-background: #fff8f6; /* Warm rice paper background */
  --color-on-background: #261816;
  --color-surface: #fff8f6;
  --color-on-surface: #261816;
  --color-surface-variant: #f7ddd9;
  --color-on-surface-variant: #59413d;
  --color-outline: #8d706c;
  --color-outline-variant: #e1bfb9;
  --color-secondary: #006d37; /* Bamboo Green */

  --font-body-md: "Noto Sans", sans-serif;
  --font-headline-lg: "Source Serif 4", serif;
  --font-display-hanzi: "Source Serif 4", serif;
  --font-label-pinyin: "JetBrains Mono", monospace;
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
        VC --> TT[TTSButton Component]
        VC --> DM[DecompositionModal]
        MH --> DM
        DM --> DV[DecompositionView]
        DM --> HW[HanziWriter Canvas]
    end

    subgraph State Storage
        LS[(Browser LocalStorage)] <--> |Starred Words & SRS State| VT
        LS <--> |Leitner Box Intervals & Stage Badges| FlashcardsTab
    end
```

### 3.1 Vocabulary Category Schema (`public/data/vocab/*.json`)
All vocabulary entries share a unified, single-source-of-truth JSON structure:

```json
{
  "hanzi": "认识",
  "pinyin": "rènshi",
  "meaning": "to meet, to know",
  "partOfSpeech": "verb",
  "exampleSentence": {
    "hanzi": "认识你很高兴。",
    "pinyin": "Rènshi nǐ hěn gāoxìng.",
    "meaning": "Nice to meet you."
  }
}
```

### 3.2 Dynamic Verbs Aggregation Model
To avoid dataset duplication and data drift, the **Verbs Tab (`VerbsTab.tsx`)** has no static dataset file. Upon initialization:
1. Fetches `data/vocab/index.json` to discover all category files.
2. Loads all category JSON files asynchronously using `Promise.all()`.
3. Filters entries where `partOfSpeech` contains `"verb"`.
4. Deduplicates by Hanzi character while attaching category provenance (`_categoryId` and `_categoryName`).
5. Provides category filter pills (`All Verbs`, `Greetings`, `Travel`, `Work & School`, etc.) and search filtering.

### 3.3 Frequency & Etymology Schema (`public/data/frequency-1000.json`)
Sourced from the **MakeMeAHanzi** dataset, enriched with Unicode Ideographic Description Characters (IDC) and linguistic etymology:

```json
{
  "rank": 6,
  "character": "在",
  "pinyin": "zài",
  "meaning": "at, in, on; to exist; present progressive",
  "decomposition": "⿸才土",
  "radical": "土",
  "etymology": {
    "type": "pictophonetic",
    "phonetic": "才",
    "semantic": "土",
    "hint": "earth 土 providing meaning, 才 providing sound"
  }
}
```

---

## 4. Key Component Systems

### 4.1 Unified `VocabCard` Component (`VocabCard.tsx`)
Features a 2-row full-width responsive flexbox layout with $44\text{px}$ touch targets and expandable example sentence accordion:

```
+-------------------------------------------------------------------------+
| [ TOP ROW ]                                                             |
|  木木木  (48-56px Hanzi)  [🔊 TTS (44px)]    [🔀 Decompose (44px)]  [⭐ Star] |
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

* **Top Row**:
  * **Dominant Hanzi**: Responsive font size scaling based on string length (`text-4xl sm:text-5xl` for 1-2 chars, `text-3xl` for 3 chars, `text-2xl` for 4+ chars).
  * **Clickable Characters**: Each character in the string can be clicked individually to launch character radical decomposition.
  * **Inline TTS Audio**: Vertically centered speaker icon with 44px touch hitbox.
  * **Right Action Icons**: 44px touch target icon buttons for decomposition (`Sparkles`) and flashcard starring (`Star`).
* **Second Row**:
  * **Left**: `<PinyinPill />` interactive reveal control with 44px touch height.
  * **Right**: Part-of-speech badge + English gloss at 16–17px font size with text wrapping.
* **Expandable Example Accordion**:
  * Clean `ChevronDown` toggle button (`"Example sentence ▾"`) keeps list cards vertically compact while expanding full context on demand.

### 4.2 Interactive Pinyin Reveal Pill (`PinyinPill.tsx`)
* **Unrevealed State**: Displays `pīn yīn · reveal` with an `EyeOff` icon in muted colors.
* **Revealed State**: Tapping (on touch screens) or hovering (on desktop) dynamically expands the pill to reveal the tone-marked Pinyin (e.g. `māma`) styled in Imperial Red with an `Eye` icon.

### 4.3 Multi-Select Custom Study Deck (`VocabTab.tsx`)
* **Browsing Mode**: 1-tap navigation directly opens any vocabulary category.
* **Multi-Select Mode**: Tapping `"Multi-Select Deck"` enables checkboxes next to each category card. Clicking the floating bottom action bar (`"Study X Selected Categories"`) generates a combined custom study deck across selected categories.

### 4.4 Character Decomposition & Etymology Engine (`DecompositionView.tsx` / `DecompositionModal.tsx`)
Implements spatial layout rendering derived from Ideographic Description Characters (IDC):
* **Layout Geometries**:
  * `⿳` / `<ctrl42>` (3-tier stack like `森` -> `木`, `木`, `木`): Top center item + Bottom row items.
  * `⿰` (Left-Right): Side-by-side flex layout.
  * `<ctrl42>` (Top-Bottom): Vertical stacked flex layout.
* **Role Detection**:
  * Cross-references character components with MakeMeAHanzi etymology data.
  * Explicitly labels components as **`Semantic`** (meaning-bearing component), **`Phonetic`** (sound-bearing component), or **`Radical`**.
  * **Zero Fallback Artifacts**: If a component's role or pinyin is unknown, it renders the raw Chinese character without fake `"(part)"` labels.
* **Character Origin Panel**: Displays character formation types (`Pictophonetic`, `Ideographic`, `Pictographic`) along with historical formation hints.

### 4.5 Spaced Repetition System (SRS) Flashcards (`FlashcardsTab.tsx`)
Uses a 5-box Leitner Spaced Repetition Algorithm mapped to human progress stage badges:
* **Box 1**: `New / Practice` (1 Day interval)
* **Box 2**: `Learning` (2 Days interval)
* **Box 3**: `Reviewing` (4 Days interval)
* **Box 4**: `Comfortable` (7 Days interval)
* **Box 5**: `Mastered` (14 Days interval)

Reviews are persisted in `localStorage` under `srs_vocab_data`. Correct answers advance the card to the next box stage, while incorrect answers reset it to Box 1.

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
│   │   ├── TTSButton.tsx           # Web Speech Synthesis audio speaker button (44px)
│   │   ├── VerbsTab.tsx            # Dynamic aggregated verb reference view
│   │   └── VocabCard.tsx           # Unified 2-row card + Expandable Example Accordion
│   ├── utils/
│   │   ├── charLookup.ts           # Character metadata & etymology fetcher
│   │   └── radicalData.ts          # Kangxi radical dictionary lookup
│   ├── App.tsx                     # Top-level shell, mobile frame & navigation bar
│   ├── index.css                   # Tailwind v4 theme + slideUp animations + focus rings
│   └── main.tsx                    # React application entry point
├── fetch_hanzi.py                  # Python pipeline script for makemeahanzi enrichment
└── package.json                    # Dependencies & build/deploy scripts
```
