import React, { useState } from 'react';
import TTSButton from './TTSButton';
import { getComponentInfo } from '../utils/radicalData';

interface DecompositionViewProps {
  character: string;
  pinyin?: string;
  meaning?: string;
  radical?: string;
  decomposition?: string[];
  className?: string;
  showAudio?: boolean;
}

export default function DecompositionView({
  character,
  pinyin,
  meaning,
  radical,
  decomposition,
  className = '',
  showAudio = true,
}: DecompositionViewProps) {
  const [isDecomposed, setIsDecomposed] = useState(false);

  // Helper to check if a character is an Ideographic Description Character (IDC)
  const isIDC = (char: string) => {
    if (!char) return false;
    const code = char.charCodeAt(0);
    return code >= 0x2FF0 && code <= 0x2FFB;
  };

  // Extract layout IDC if present
  const layoutIDC = decomposition ? decomposition.find(char => isIDC(char)) || '' : '';

  // Extract component characters
  let cleanComponents = decomposition
    ? decomposition.filter(char => char !== character && !isIDC(char))
    : [];

  // Fallback: if no decomposition array provided but radical exists, use radical
  if (cleanComponents.length === 0 && radical && radical !== character) {
    cleanComponents = [radical];
  }

  // Look up Pinyin & Meaning for each component
  const componentsInfo = cleanComponents.map(comp => getComponentInfo(comp));

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
          <div className="flex flex-col items-center mb-2">
            <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{topComp.character}</span>
            <span className="font-label-pinyin text-[10px] sm:text-xs text-primary font-bold tracking-wider mt-0.5 uppercase">
              {topComp.pinyin} ({topComp.meaning.split('/')[0].trim()})
            </span>
          </div>

          {/* Bottom Row Components */}
          <div className="flex justify-around w-full px-2 mt-1">
            <div className="flex flex-col items-center">
              <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{leftComp.character}</span>
              <span className="font-label-pinyin text-[10px] sm:text-xs text-primary font-bold tracking-wider mt-0.5 uppercase">
                {leftComp.pinyin} ({leftComp.meaning.split('/')[0].trim()})
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{rightComp.character}</span>
              <span className="font-label-pinyin text-[10px] sm:text-xs text-primary font-bold tracking-wider mt-0.5 uppercase">
                {rightComp.pinyin} ({rightComp.meaning.split('/')[0].trim()})
              </span>
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
              <span className="font-label-pinyin text-[10px] sm:text-xs text-primary font-bold tracking-wider mt-0.5 uppercase">
                {c1.pinyin} ({c1.meaning.split('/')[0].trim()})
              </span>
            </div>
            <div className="flex flex-col items-center mt-2">
              <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{c2.character}</span>
              <span className="font-label-pinyin text-[10px] sm:text-xs text-primary font-bold tracking-wider mt-0.5 uppercase">
                {c2.pinyin} ({c2.meaning.split('/')[0].trim()})
              </span>
            </div>
          </div>
        );
      }

      // Default Left - Right layout
      return (
        <div className="flex items-center justify-around h-full w-full px-2 py-2">
          <div className="flex flex-col items-center">
            <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{c1.character}</span>
            <span className="font-label-pinyin text-[10px] sm:text-xs text-primary font-bold tracking-wider mt-1 uppercase text-center max-w-[100px] break-words">
              {c1.pinyin} ({c1.meaning.split('/')[0].trim()})
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display-hanzi text-3xl sm:text-4xl text-on-surface leading-none">{c2.character}</span>
            <span className="font-label-pinyin text-[10px] sm:text-xs text-primary font-bold tracking-wider mt-1 uppercase text-center max-w-[100px] break-words">
              {c2.pinyin} ({c2.meaning.split('/')[0].trim()})
            </span>
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
            <span className="font-label-pinyin text-[10px] text-primary font-bold tracking-wider mt-0.5 uppercase">
              {comp.pinyin} ({comp.meaning.split('/')[0].trim()})
            </span>
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
        {isDecomposed ? 'Tap to show character' : 'Tap to decompose'}
      </div>
    </div>
  );
}
