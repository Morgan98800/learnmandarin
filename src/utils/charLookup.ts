export interface CharDetails {
  character: string;
  pinyin: string;
  meaning: string;
  radical?: string;
  decomposition?: string[];
}

let freqListCache: CharDetails[] | null = null;

export async function fetchCharDetails(char: string): Promise<CharDetails> {
  if (!freqListCache) {
    try {
      const res = await fetch('data/frequency-1000.json');
      const data = await res.json();
      freqListCache = Array.isArray(data) ? data : [];
    } catch (e) {
      freqListCache = [];
    }
  }

  const targetChar = char[0] || char;
  const list = Array.isArray(freqListCache) ? freqListCache : [];
  const found = list.find(c => c && c.character === targetChar);

  if (found) {
    return {
      character: found.character,
      pinyin: found.pinyin || '',
      meaning: found.meaning || '',
      radical: found.radical || '',
      decomposition: found.decomposition || []
    };
  }

  // Fallback if character not in 1000 frequency list
  return {
    character: targetChar,
    pinyin: '',
    meaning: '',
    radical: '',
    decomposition: []
  };
}
