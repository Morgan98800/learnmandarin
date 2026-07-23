import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface TTSButtonProps {
  text: string;
  className?: string;
  size?: number;
}

export default function TTSButton({ text, className = '', size = 20 }: TTSButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert("TTS not supported in this browser");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // cancel any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85; // slightly slower for learners

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={speak}
      type="button"
      className={`min-w-[44px] min-h-[44px] p-2.5 rounded-full hover:bg-surface-container active:scale-95 transition-all text-primary flex items-center justify-center ${className}`}
      aria-label="Speak pronunciation aloud"
      title="Speak pronunciation"
    >
      {speaking ? <VolumeX size={size} /> : <Volume2 size={size} />}
    </button>
  );
}
