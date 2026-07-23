import React, { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import DecompositionView from './DecompositionView';
import type { EtymologyInfo } from '../utils/charLookup';

interface DecompositionCardProps {
  character: string;
  pinyin: string;
  meaning: string;
  radical?: string;
  decomposition?: string[] | string;
  etymology?: EtymologyInfo | null;
  onClose?: () => void;
}

export default function DecompositionCard({
  character,
  pinyin,
  meaning,
  radical,
  decomposition,
  etymology,
  onClose,
}: DecompositionCardProps) {
  const writerRef = useRef<HTMLDivElement>(null);
  const writerInstance = useRef<HanziWriter | null>(null);

  useEffect(() => {
    if (writerRef.current && character) {
      writerRef.current.innerHTML = '';
      writerInstance.current = HanziWriter.create(writerRef.current, character, {
        width: 140,
        height: 140,
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

  return (
    <div className="bg-surface border border-outline-variant p-5 rounded-2xl flex flex-col items-center relative w-full max-w-sm mx-auto shadow-sm gap-4">
      {onClose && (
        <button onClick={onClose} className="absolute top-3 right-3 z-30 text-outline hover:text-primary p-1 text-lg font-bold">
          ✕
        </button>
      )}
      
      {/* Interactive Tap-To-Decompose Card */}
      <DecompositionView 
        character={character}
        pinyin={pinyin}
        meaning={meaning}
        radical={radical}
        decomposition={decomposition}
        etymology={etymology}
        showAudio={true}
      />

      {/* Etymology Formation Panel (Makemeahanzi Data) */}
      {etymology && (etymology.type || etymology.hint) && (
        <div className="w-full border-t border-outline-variant pt-4 flex flex-col gap-2 bg-surface-container-low p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Character Formation</span>
            {etymology.type && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary-fixed text-primary border border-primary/20">
                {etymology.type}
              </span>
            )}
          </div>
          
          {etymology.hint && (
            <p className="text-xs text-on-surface-variant font-body-md leading-relaxed">
              {etymology.hint}
            </p>
          )}

          {etymology.type === 'pictophonetic' && (etymology.semantic || etymology.phonetic) && (
            <div className="flex gap-2 mt-1 text-[11px] font-label-pinyin">
              {etymology.semantic && (
                <span className="bg-surface border border-outline-variant px-2 py-0.5 rounded text-on-surface">
                  Semantic: <strong className="text-primary font-display-hanzi">{etymology.semantic}</strong>
                </span>
              )}
              {etymology.phonetic && (
                <span className="bg-surface border border-outline-variant px-2 py-0.5 rounded text-on-surface">
                  Phonetic: <strong className="text-primary font-display-hanzi">{etymology.phonetic}</strong>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stroke Animation Container */}
      <div className="w-full border-t border-outline-variant pt-4 flex flex-col items-center">
        <h4 className="text-xs uppercase tracking-wider text-outline font-bold mb-3">Stroke Order Practice</h4>
        <div 
          className="relative w-[150px] h-[150px] border border-outline-variant rounded-xl bg-surface-container-lowest flex items-center justify-center cursor-pointer shadow-xs"
          onClick={animate}
        >
          <div ref={writerRef}></div>
        </div>
        <button 
          onClick={animate} 
          className="mt-3 px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all w-full max-w-[200px]"
        >
          Play Animation
        </button>
      </div>
    </div>
  );
}
