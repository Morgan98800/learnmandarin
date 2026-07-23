import React, { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

interface DecompositionCardProps {
  character: string;
  pinyin: string;
  meaning: string;
  radical?: string;
  decomposition?: string[];
  onClose?: () => void;
}

export default function DecompositionCard({ character, pinyin, meaning, radical, decomposition, onClose }: DecompositionCardProps) {
  const writerRef = useRef<HTMLDivElement>(null);
  const writerInstance = useRef<HanziWriter | null>(null);

  useEffect(() => {
    if (writerRef.current && character) {
      writerRef.current.innerHTML = '';
      writerInstance.current = HanziWriter.create(writerRef.current, character, {
        width: 150,
        height: 150,
        padding: 5,
        strokeColor: '#9e2016', // primary color
        outlineColor: '#e1bfb9', // outline variant
        drawingColor: '#006d37', // secondary
        showOutline: true,
      });
    }
  }, [character]);

  const animate = () => {
    if (writerInstance.current) {
      writerInstance.current.animateCharacter();
    }
  };

  const isIDC = (char: string) => {
    const code = char.charCodeAt(0);
    return code >= 0x2FF0 && code <= 0x2FFB;
  };

  const cleanDecomposition = decomposition
    ? decomposition.filter(char => char !== character && !isIDC(char))
    : [];

  return (
    <div className="bg-surface border border-outline-variant p-6 rounded-xl flex flex-col items-center relative w-full max-w-sm mx-auto shadow-sm">
      {onClose && (
        <button onClick={onClose} className="absolute top-3 right-3 text-outline hover:text-primary p-1">
          ✕
        </button>
      )}
      
      {/* Tian Zi Ge Background for character drawing */}
      <div className="relative w-[160px] h-[160px] border border-outline-variant rounded-lg bg-surface-container-lowest tian-zi-ge flex items-center justify-center cursor-pointer" onClick={animate}>
        <div ref={writerRef}></div>
      </div>
      
      <div className="mt-4 text-center">
        <h3 className="text-3xl font-display-hanzi text-on-surface">{character}</h3>
        <p className="font-label-pinyin text-primary text-sm font-semibold tracking-wider mt-1">{pinyin}</p>
        <p className="font-body-md text-on-surface-variant mt-2 text-sm max-w-[250px] mx-auto">{meaning}</p>
      </div>

      {/* Decomposition Info */}
      {(radical || cleanDecomposition.length > 0) && (
        <div className="mt-5 w-full border-t border-outline-variant pt-4">
          <h4 className="text-xs uppercase tracking-wider text-outline font-bold mb-2 text-center">Radicals & Components</h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {radical && (
              <div className="flex flex-col items-center bg-surface-container-low px-3 py-1.5 rounded border border-outline-variant">
                <span className="text-lg font-display-hanzi text-primary">{radical}</span>
                <span className="text-[10px] text-outline font-semibold uppercase">Radical</span>
              </div>
            )}
            {cleanDecomposition.map((comp, idx) => (
              <div key={idx} className="flex flex-col items-center bg-surface-container-low px-3 py-1.5 rounded border border-outline-variant">
                <span className="text-lg font-display-hanzi text-on-surface">{comp}</span>
                <span className="text-[10px] text-outline font-semibold uppercase">Part</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={animate} 
        className="mt-5 px-4 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all w-full"
      >
        Animate Strokes
      </button>
    </div>
  );
}
