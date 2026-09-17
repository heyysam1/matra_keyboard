// Matra Keyboard — High-Frequency Bengali Dictionary & Frequency Lexicon
// Provides word ranking so natural, everyday words surface first in offline mode.

export const BENGALI_LEXICON = [
  // Pronouns & Basics
  { word: "আমি", key: "ami", freq: 100 },
  { word: "তুমি", key: "tumi", freq: 95 },
  { word: "সে", key: "se", freq: 90 },
  { word: "আমরা", key: "amra", freq: 88 },
  { word: "তোমরা", key: "tomra", freq: 85 },
  { word: "তারা", key: "tara", freq: 82 },
  { word: "তিনি", key: "tini", freq: 80 },
  { word: "আপনি", key: "apni", freq: 85 },
  { word: "আপনার", key: "apnar", freq: 84 },
  { word: "আমার", key: "amar", freq: 95 },
  { word: "তোমার", key: "tomar", freq: 92 },
  { word: "তার", key: "tar", freq: 88 },
  { word: "আমাদের", key: "amader", freq: 86 },
  { word: "তোমাদের", key: "tomader", freq: 84 },
  { word: "তাদের", key: "tader", freq: 82 },

  // Expressions & Sentiments (Matching Spec & Design)
  { word: "ভালোবাসি", key: "bhalobashi", freq: 98 },
  { word: "ভালবাসি", key: "bhalobashi", freq: 92 },
  { word: "ভালোবাসা", key: "bhalobasha", freq: 94 },
  { word: "ভালবাসা", key: "bhalobasha", freq: 90 },
  { word: "ভালো", key: "bhalo", freq: 96 },
  { word: "ভাল", key: "bhalo", freq: 85 },
  { word: "ভালোবাসী", key: "bhalobashi", freq: 60 },
  { word: "ভালো বাসি", key: "bhalobashi", freq: 50 },

  // Music, Speech & Culture (Matching spec sample)
  { word: "বাংলা", key: "bangla", freq: 95 },
  { word: "বাঙালি", key: "bangali", freq: 90 },
  { word: "বাংলাদেশ", key: "bangladesh", freq: 94 },
  { word: "বাংলায়", key: "banglay", freq: 92 },
  { word: "বাংলার", key: "banglar", freq: 91 },
  { word: "গান", key: "gaan", freq: 90 },
  { word: "গাই", key: "gai", freq: 88 },
  { word: "গাইতে", key: "gaite", freq: 82 },
  { word: "কথা", key: "kotha", freq: 95 },
  { word: "বলবো", key: "bolbo", freq: 92 },
  { word: "বলব", key: "bolbo", freq: 85 },
  { word: "বলি", key: "boli", freq: 86 },
  { word: "বলে", key: "bole", freq: 89 },
  { word: "বলেন", key: "bolen", freq: 85 },
  { word: "বলা", key: "bola", freq: 84 },
  { word: "ভাষা", key: "bhasha", freq: 90 },

  // Common Conversational Words & Questions
  { word: "কেমন", key: "kemon", freq: 95 },
  { word: "আছো", key: "acho", freq: 92 },
  { word: "আছেন", key: "achen", freq: 90 },
  { word: "আছি", key: "achi", freq: 88 },
  { word: "আছে", key: "ache", freq: 92 },
  { word: "কি", key: "ki", freq: 98 },
  { word: "কী", key: "ki", freq: 92 },
  { word: "কেন", key: "keno", freq: 94 },
  { word: "কোথায়", key: "kothay", freq: 92 },
  { word: "কখন", key: "kokhon", freq: 89 },
  { word: "কিভাবে", key: "kibhabe", freq: 90 },
  { word: "কে", key: "ke", freq: 92 },
  { word: "কাকে", key: "kake", freq: 85 },
  { word: "কার", key: "kar", freq: 86 },

  // Greetings, Courtesies & Relations
  { word: "ধন্যবাদ", key: "dhonnobad", freq: 95 },
  { word: "সালাম", key: "salam", freq: 90 },
  { word: "নমস্কার", key: "nomoshkar", freq: 88 },
  { word: "বন্ধু", key: "bondhu", freq: 92 },
  { word: "বন্ধুরা", key: "bondhura", freq: 85 },
  { word: "মানুষ", key: "manush", freq: 92 },
  { word: "সবাই", key: "shobai", freq: 90 },
  { word: "সবাইকে", key: "shobaike", freq: 88 },
  { word: "সুন্দর", key: "shundor", freq: 92 },
  { word: "ঠিক", key: "thik", freq: 94 },
  { word: "ভুল", key: "bhul", freq: 85 },
  { word: "সত্য", key: "shotto", freq: 86 },

  // Action Verbs
  { word: "করা", key: "kora", freq: 92 },
  { word: "করে", key: "kore", freq: 95 },
  { word: "করি", key: "kori", freq: 90 },
  { word: "করবো", key: "korbo", freq: 92 },
  { word: "করব", key: "korbo", freq: 85 },
  { word: "করছেন", key: "korchen", freq: 86 },
  { word: "করতে", key: "korte", freq: 88 },
  { word: "যাওয়া", key: "jawa", freq: 85 },
  { word: "যাই", key: "jai", freq: 88 },
  { word: "যাবো", key: "jabo", freq: 90 },
  { word: "যাব", key: "jabo", freq: 85 },
  { word: "যায়", key: "jay", freq: 89 },
  { word: "আসা", key: "asha", freq: 84 },
  { word: "আসি", key: "ashi", freq: 86 },
  { word: "আসবো", key: "ashbo", freq: 88 },
  { word: "দেখা", key: "dekha", freq: 88 },
  { word: "দেখি", key: "dekhi", freq: 87 },
  { word: "হওয়া", key: "howa", freq: 88 },
  { word: "হবে", key: "hobe", freq: 95 },
  { word: "হলো", key: "holo", freq: 90 },
  { word: "হচ্ছে", key: "hocche", freq: 92 },
  { word: "হয়েছে", key: "hoyeche", freq: 91 },

  // Time & Space
  { word: "আজ", key: "aaj", freq: 92 },
  { word: "আজকে", key: "aajke", freq: 90 },
  { word: "কাল", key: "kaal", freq: 89 },
  { word: "কালকে", key: "kaalke", freq: 87 },
  { word: "এখন", key: "ekhon", freq: 94 },
  { word: "তখন", key: "tokhon", freq: 88 },
  { word: "পরে", key: "pore", freq: 90 },
  { word: "আগে", key: "aage", freq: 89 },
  { word: "সময়", key: "shomoy", freq: 92 },
  { word: "দিন", key: "din", freq: 90 },
  { word: "রাত", key: "raat", freq: 88 },
  { word: "সকাল", key: "shokal", freq: 87 },
  { word: "সন্ধ্যা", key: "shondha", freq: 85 },
  { word: "বছর", key: "bochor", freq: 86 },

  // Qualifiers & Quantifiers
  { word: "অনেক", key: "onek", freq: 94 },
  { word: "একটু", key: "ektu", freq: 92 },
  { word: "খুব", key: "khub", freq: 95 },
  { word: "বেশি", key: "beshi", freq: 91 },
  { word: "কম", key: "kom", freq: 87 },
  { word: "একদম", key: "ekdom", freq: 89 },
  { word: "হয়তো", key: "hoyto", freq: 88 },
  { word: "অবশ্যই", key: "oboshshoi", freq: 89 },
  { word: "নিশ্চয়ই", key: "nishchoi", freq: 86 },

  // Connectives & Prepositions
  { word: "এবং", key: "ebong", freq: 92 },
  { word: "আর", key: "aar", freq: 94 },
  { word: "কিন্তু", key: "kintu", freq: 93 },
  { word: "অথবা", key: "othoba", freq: 87 },
  { word: "বা", key: "ba", freq: 91 },
  { word: "যদি", key: "jodi", freq: 92 },
  { word: "তবে", key: "tobe", freq: 89 },
  { word: "তাই", key: "tai", freq: 91 },
  { word: "কারণ", key: "karon", freq: 90 },
  { word: "যাতে", key: "jate", freq: 85 },
  { word: "নিয়ে", key: "niye", freq: 92 },
  { word: "দিয়ে", key: "diye", freq: 93 },
  { word: "থেকে", key: "theke", freq: 94 },
  { word: "পর্যন্ত", key: "porjonto", freq: 86 },
  { word: "মতো", key: "moto", freq: 90 },
  { word: "ইত্যাদি", key: "ittadi", freq: 85 }
];

// Pre-indexed map for high-speed offline lookup
const dictionaryMap = new Map();

for (const entry of BENGALI_LEXICON) {
  const normKey = entry.key.toLowerCase();
  if (!dictionaryMap.has(normKey)) {
    dictionaryMap.set(normKey, []);
  }
  dictionaryMap.get(normKey).push(entry);
}

// Sort entries in each key bucket by frequency descending
for (const [key, entries] of dictionaryMap.entries()) {
  entries.sort((a, b) => b.freq - a.freq);
}

// User-defined custom vocabulary storage
const userWords = [];
const userDictionaryMap = new Map();

export function loadUserWords(entries) {
  userWords.length = 0;
  userDictionaryMap.clear();

  if (Array.isArray(entries)) {
    for (const entry of entries) {
      if (entry && entry.word) {
        addUserWordToMap(entry.word, entry.key || generatePhoneticKey(entry.word), entry.createdAt);
      }
    }
  }
}

function addUserWordToMap(word, key, createdAt = new Date().toISOString()) {
  const normWord = word.trim();
  const normKey = (key || generatePhoneticKey(normWord)).trim().toLowerCase();
  if (!normWord) return null;

  const existingIdx = userWords.findIndex(w => w.word === normWord);
  const entry = { word: normWord, key: normKey, createdAt };

  if (existingIdx >= 0) {
    userWords[existingIdx] = entry;
  } else {
    userWords.unshift(entry); // Most recently added first
  }

  if (!userDictionaryMap.has(normKey)) {
    userDictionaryMap.set(normKey, []);
  }
  const bucket = userDictionaryMap.get(normKey);
  const inBucketIdx = bucket.findIndex(w => w.word === normWord);
  if (inBucketIdx >= 0) {
    bucket[inBucketIdx] = entry;
  } else {
    bucket.unshift(entry);
  }

  return entry;
}

export function addUserWord(word, key = '') {
  return addUserWordToMap(word, key);
}

export function updateUserWord(oldWord, newWord, newKey = '') {
  removeUserWord(oldWord);
  return addUserWord(newWord, newKey);
}

export function removeUserWord(word) {
  const target = (word || '').trim();
  const idx = userWords.findIndex(w => w.word === target);
  if (idx >= 0) {
    const entry = userWords[idx];
    userWords.splice(idx, 1);

    const bucket = userDictionaryMap.get(entry.key);
    if (bucket) {
      const bIdx = bucket.findIndex(w => w.word === target);
      if (bIdx >= 0) bucket.splice(bIdx, 1);
      if (bucket.length === 0) userDictionaryMap.delete(entry.key);
    }
    return true;
  }
  return false;
}

export function getUserWords() {
  return [...userWords];
}

// Simple heuristic fallback to generate a phonetic key from a Bengali word if omitted
export function generatePhoneticKey(bengaliWord) {
  if (!bengaliWord) return '';
  const bnToEnMap = {
    'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
    'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
    'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'ng',
    'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
    'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
    'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
    'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
    'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ং': 'ng', 'ঃ': '', 'ঁ': '',
    'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou', '্': ''
  };

  let key = '';
  for (const ch of bengaliWord) {
    if (bnToEnMap[ch]) {
      key += bnToEnMap[ch];
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      key += ch.toLowerCase();
    }
  }
  return key || bengaliWord.toLowerCase();
}

export function searchDictionary(token) {
  if (!token) return [];
  const norm = token.toLowerCase();
  const results = [];

  // 1. TOP PRIORITY: Search User-defined Custom Dictionary (Exact & Prefix matches)
  const userDirect = userDictionaryMap.get(norm) || [];
  for (const entry of userDirect) {
    if (!results.includes(entry.word)) {
      results.push(entry.word);
    }
  }

  // Check prefix matches in user dictionary
  if (results.length < 5) {
    for (const [key, entries] of userDictionaryMap.entries()) {
      if (key !== norm && key.startsWith(norm)) {
        for (const entry of entries) {
          if (!results.includes(entry.word)) {
            results.push(entry.word);
            if (results.length >= 5) break;
          }
        }
      }
      if (results.length >= 5) break;
    }
  }

  // 2. SECONDARY: Search Built-in Lexicon (Exact matches)
  const directMatches = dictionaryMap.get(norm) || [];
  for (const entry of directMatches) {
    if (!results.includes(entry.word)) {
      results.push(entry.word);
      if (results.length >= 5) break;
    }
  }
  
  // 3. TERTIARY: Partial/prefix matches in built-in lexicon
  if (results.length < 5) {
    for (const [key, entries] of dictionaryMap.entries()) {
      if (key !== norm && key.startsWith(norm)) {
        for (const entry of entries) {
          if (!results.includes(entry.word)) {
            results.push(entry.word);
            if (results.length >= 5) break;
          }
        }
      }
      if (results.length >= 5) break;
    }
  }

  return results.slice(0, 5);
}
