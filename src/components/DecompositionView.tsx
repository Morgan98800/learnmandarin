import React, { useState } from 'react';
import TTSButton from './TTSButton';
import { getComponentInfo, type ComponentInfo } from '../utils/radicalData';
import type { EtymologyInfo } from '../utils/charLookup';

interface DecompositionViewProps {
  character: string;
  pinyin?: string;
  meaning?: string;
  radical?: string;
  decomposition?: string[] | string;
  etymology?: EtymologyInfo | null;
  className?: string;
  showAudio?: boolean;
  initialDecomposed?: boolean;
}

export default function DecompositionView({
  character,
  pinyin,
  meaning,
  radical,
  decomposition,
  etymology,
  className = '',
  showAudio = true,
  initialDecomposed = true,
}: DecompositionViewProps) {
  const [isDecomposed, setIsDecomposed] = useState(initialDecomposed);

  // Helper to safely convert decomposition to character array
  const getDecompArray = (decomp: any): string[] => {
    if (!decomp) return [];
    if (Array.isArray(decomp)) return decomp;
    if (typeof decomp === 'string') return decomp.split('');
    return [];
  };

  const decompArray = getDecompArray(decomposition);

  // Helper to check if a character is an Ideographic Description Character (IDC)
  const isIDC = (char: string) => {
    if (!char || typeof char !== 'string') return false;
    const code = char.charCodeAt(0);
    return code >= 0x2FF0 && code <= 0x2FFB;
  };

  // Extract layout IDC if present
  const layoutIDC = decompArray.find(char => isIDC(char)) || '';

  // Extract component characters
  let cleanComponents = decompArray.filter(char => char !== character && !isIDC(char));

  // Fallback: if no decomposition array provided but radical exists, use radical
  if (cleanComponents.length === 0 && radical && radical !== character) {
    cleanComponents = [radical];
  }

  // Look up Pinyin & Meaning for each component
  const componentsInfo = cleanComponents.map(comp => getComponentInfo(comp));

  // Helper to render component description (no fake "(part)" labels)
  const renderComponentMeta = (compChar: string, compInfo: ComponentInfo) => {
    let roleLabel = '';
    if (etymology && etymology.type === 'pictophonetic') {
      if (compChar === etymology.semantic) roleLabel = 'Semantic';
      else if (compChar === etymology.phonetic) roleLabel = 'Phonetic';
    }
    
    if (!roleLabel && compChar === radical) {
      roleLabel = 'Radical';
    }

    const pinyinText = compInfo.pinyin ? compInfo.pinyin.toUpperCase() : '';
    const meaningText = compInfo.meaning ? `(${compInfo.meaning.split('/')[0].trim()})` : '';

    if (!pinyinText && !meaningText && !roleLabel) {
      return null; // Omit gloss entirely for unknown sub-components
    }

    return (
      <div className="flex flex-col items-center mt-0.5">
        {roleLabel && (
          <span className="text-[9px] font-bold text-outline uppercase tracking-widest bg-surface-container-high px-1.5 py-0.5 rounded mb-0.5">
            {roleLabel}
          </span>
        )}
        {(pinyinText || meaningText) && (
          <span className="font-label-pinyin text-[10px] sm:text-xs text-primary font-bold tracking-wider uppercase text-center max-w-[110px] break-words">
            {pinyinText} {meaningText}
          </span>
        )}
      </div>
    );
  };

  // Determine structural spatial layout
  const renderSpatialDecomposition = () => {
    if (componentsInfo.length === 0) {
      return (
        <div className="text-center p-4">
          <span className="font-display-hanzi text-5xl text-on-surface">{character}</span>
          <p className="text-xs text-outline italic mt-2">Single radical character</p>
        </div>
      );
    }

    // 3 components (e.g. 森 = 木 + 木 + 木)
    if (componentsInfo.length === 3 || layoutIDC === '⿳' || layoutIDC === '⿲') {
      const topComp = componentsInfo[0];
      const leftComp = componentsInfo[1] || topComp;
      const rightComp = componentsInfo[2] || topComp;

      return (
        <div className="flex flex-col items-center justify-center h-full w-full py-2">
          {/* Top Component */}
          <div className="flex flex-col items-center mb-1">
            <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{topComp.character}</span>
            {renderComponentMeta(topComp.character, topComp)}
          </div>

          {/* Bottom Row Components */}
          <div className="flex justify-around w-full px-2 mt-1">
            <div className="flex flex-col items-center">
              <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{leftComp.character}</span>
              {renderComponentMeta(leftComp.character, leftComp)}
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{rightComp.character}</span>
              {renderComponentMeta(rightComp.character, rightComp)}
            </div>
          </div>
        </div>
      );
    }

    // 2 components (Left-Right or Top-Bottom)
    if (componentsInfo.length === 2 || layoutIDC === '⿰' || layoutIDC === '⿱') {
      const isTopBottom = layoutIDC === '⿱';
      const c1 = componentsInfo[0];
      const c2 = componentsInfo[1];

      if (isTopBottom) {
        return (
          <div className="flex flex-col items-center justify-around h-full w-full py-2">
            <div className="flex flex-col items-center">
              <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{c1.character}</span>
              {renderComponentMeta(c1.character, c1)}
            </div>
            <div className="flex flex-col items-center mt-2">
              <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{c2.character}</span>
              {renderComponentMeta(c2.character, c2)}
            </div>
          </div>
        );
      }

      // Default Left - Right layout
      return (
        <div className="flex items-center justify-around h-full w-full px-2 py-2">
          <div className="flex flex-col items-center">
            <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{c1.character}</span>
            {renderComponentMeta(c1.character, c1)}
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{c2.character}</span>
            {renderComponentMeta(c2.character, c2)}
          </div>
        </div>
      );
    }

    // Generic list layout
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 p-3 h-full w-full">
        {componentsInfo.map((comp, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="font-display-hanzi text-2xl sm:text-3xl text-on-surface leading-none">{comp.character}</span>
            {renderComponentMeta(comp.character, comp)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={() => setIsDecomposed(!isDecomposed)}
      className={`relative aspect-square w-full max-w-[280px] sm:max-w-[320px] mx-auto bg-surface border border-outline-variant rounded-2xl p-4 shadow-sm flex flex-col items-center justify-between cursor-pointer select-none tian-zi-ge transition-all duration-200 hover:border-primary active:scale-[0.98] ${className}`}
    >
      {/* Audio Button */}
      {showAudio && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="absolute top-3 right-3 z-20"
        >
          <TTSButton text={character} size={18} />
        </div>
      )}

      {/* Main Content View (Toggles between Character and Spatial Decomposition) */}
      <div className="flex-1 flex items-center justify-center w-full my-auto">
        {!isDecomposed ? (
          <div className="text-center flex flex-col items-center justify-center">
            <span className="font-display-hanzi text-7xl sm:text-8xl text-on-surface leading-none">{character}</span>
            {pinyin && <span className="font-label-pinyin text-primary text-base font-semibold mt-3">{pinyin}</span>}
            {meaning && <span className="font-body-md text-on-surface-variant text-xs mt-1 max-w-[200px] truncate">{meaning}</span>}
          </div>
        ) : (
          renderSpatialDecomposition()
        )}
      </div>

      {/* Bottom Hint */}
      <div className="text-[11px] text-outline italic font-body-md tracking-wide mt-2">
        {isDecomposed ? 'Tap to show full character' : 'Tap to decompose'}
      </div>
    </div>
  );
}
