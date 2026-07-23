import React, { useEffect, useState } from 'react';
import DecompositionCard from './DecompositionCard';
import { fetchCharDetails, type CharDetails } from '../utils/charLookup';

interface DecompositionModalProps {
  character: string | null;
  onClose: () => void;
}

export default function DecompositionModal({ character, onClose }: DecompositionModalProps) {
  const [details, setDetails] = useState<CharDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (character) {
      setLoading(true);
      fetchCharDetails(character).then(res => {
        setDetails(res);
        setLoading(false);
      });
    } else {
      setDetails(null);
    }
  }, [character]);

  if (!character) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-surface rounded-2xl p-4 shadow-xl border border-outline-variant max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : details ? (
          <DecompositionCard 
            character={details.character}
            pinyin={details.pinyin}
            meaning={details.meaning}
            radical={details.radical}
            decomposition={details.decomposition}
            etymology={details.etymology}
            onClose={onClose}
          />
        ) : null}
      </div>
    </div>
  );
}
