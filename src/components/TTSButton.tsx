import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface TTSButtonProps {
  text: string;
  className?: string;
  size?: number;
}

export default function TTSButton({ text, className = '', size = 20 }: TTSButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const getBestChineseVoice = (): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;
    
    // Preferred natural Chinese voices across browsers/OS
    const preferredNames = ['Ting-Ting', 'Mei-Jia', 'Sin-Ji', 'Xiaoxiao', 'Yunxi', 'HiuGaai', 'Google 普通话'];
    for (const name of preferredNames) {
      const match = voices.find(v => v.name.includes(name));
      if (match) return match;
    }

    // Fallback: any zh-CN or zh voice
    const zhCN = voices.find(v => v.lang === 'zh-CN');
    if (zhCN) return zhCN;

    const anyZh = voices.find(v => v.lang.startsWith('zh'));
    return anyZh || null;
  };

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

    const chosenVoice = getBestChineseVoice();
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={speak}
      type="button"
      className={`relative min-w-[44px] min-h-[44px] p-2.5 rounded-full hover:bg-surface-container active:scale-95 transition-all text-primary flex items-center justify-center ${
        speaking ? 'bg-primary/10 ring-2 ring-primary/40 animate-pulse' : ''
      } ${className}`}
      aria-label="Speak pronunciation aloud"
      title="Speak Chinese pronunciation"
    >
      {speaking ? (
        <div className="flex items-center gap-0.5 h-4">
          <span className="w-0.5 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-0.5 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-0.5 h-2.5 bg-primary rounded-full animate-bounce" />
        </div>
      ) : (
        <Volume2 size={size} />
      )}
    </button>
  );
}
