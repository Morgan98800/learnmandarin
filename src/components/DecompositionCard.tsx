import React, { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import DecompositionView from './DecompositionView';

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
        showAudio={true}
      />

      {/* Stroke Animation Container */}
      <div className="w-full border-t border-outline-variant pt-4 flex flex-col items-center">
        <h4 className="text-xs uppercase tracking-wider text-outline font-bold mb-3">Stroke Order Practice</h4>
        <div 
          className="relative w-[150px] h-[150px] border border-outline-variant rounded-xl bg-surface-container-lowest tian-zi-ge flex items-center justify-center cursor-pointer shadow-xs"
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
