// Matra Keyboard — Offline Rule-Based Phonetic Engine
// Implements standard Avro-compatible phonetic transliteration rules and combines with frequency ranking.

import { searchDictionary } from './BengaliDictionary.js';

// Bengali Unicode constants
const HASANTA = '\u09CD'; // ্
const DARI = '।';

// Ruleset for consonants and special characters (longer patterns first)
const CONSONANT_RULES = [
  // Triple/Quad conjunct special cases
  { pattern: 'kkh', bengali: 'ক্ষ' },
  { pattern: 'kkt', bengali: 'ক্ত' },
  { pattern: 'ggy', bengali: 'জ্ঞ' },
  { pattern: 'jng', bengali: 'জ্ঞ' },
  { pattern: 'ngk', bengali: 'ঙ্ক' },
  { pattern: 'ngg', bengali: 'ঙ্গ' },
  { pattern: 'nch', bengali: 'ঞ্চ' },
  { pattern: 'nj', bengali: 'ঞ্জ' },
  { pattern: 'nt', bengali: 'ন্ত' },
  { pattern: 'nth', bengali: 'ন্থ' },
  { pattern: 'nd', bengali: 'ন্দ' },
  { pattern: 'ndh', bengali: 'ন্ধ' },
  { pattern: 'mp', bengali: 'ম্প' },
  { pattern: 'mb', bengali: 'ম্ব' },
  { pattern: 'mbh', bengali: 'ম্ভ' },
  { pattern: 'st', bengali: 'স্ত' },
  { pattern: 'sth', bengali: 'স্থ' },
  { pattern: 'sp', bengali: 'স্প' },
  { pattern: 'sph', bengali: 'স্ফ' },
  { pattern: 'sk', bengali: 'স্ক' },
  { pattern: 'skh', bengali: 'স্খ' },
  { pattern: 'shc', bengali: 'শ্চ' },
  { pattern: 'sht', bengali: 'ষ্ট' },
  { pattern: 'shTh', bengali: 'ষ্ঠ' },
  { pattern: 'shN', bengali: 'ষ্ণ' },

  // Apirated & Multi-char consonants
  { pattern: 'kh', bengali: 'খ' },
  { pattern: 'gh', bengali: 'ঘ' },
  { pattern: 'ng', bengali: 'ং' },
  { pattern: 'Ng', bengali: 'ঙ' },
  { pattern: 'ch', bengali: 'চ' },
  { pattern: 'Ch', bengali: 'ছ' },
  { pattern: 'jh', bengali: 'ঝ' },
  { pattern: 'Th', bengali: 'ঠ' },
  { pattern: 'Dh', bengali: 'ঢ' },
  { pattern: 'th', bengali: 'থ' },
  { pattern: 'dh', bengali: 'ধ' },
  { pattern: 'ph', bengali: 'ফ' },
  { pattern: 'bh', bengali: 'ভ' },
  { pattern: 'sh', bengali: 'শ' },
  { pattern: 'Sh', bengali: 'ষ' },
  { pattern: 'Rh', bengali: 'ঢ়' },

  // Single consonants
  { pattern: 'k', bengali: 'ক' },
  { pattern: 'g', bengali: 'গ' },
  { pattern: 'c', bengali: 'চ' },
  { pattern: 'j', bengali: 'জ' },
  { pattern: 'T', bengali: 'ট' },
  { pattern: 'D', bengali: 'ড' },
  { pattern: 'N', bengali: 'ণ' },
  { pattern: 't', bengali: 'ত' },
  { pattern: 'd', bengali: 'দ' },
  { pattern: 'n', bengali: 'ন' },
  { pattern: 'p', bengali: 'প' },
  { pattern: 'f', bengali: 'ফ' },
  { pattern: 'b', bengali: 'ব' },
  { pattern: 'v', bengali: 'ভ' },
  { pattern: 'm', bengali: 'ম' },
  { pattern: 'z', bengali: 'য' },
  { pattern: 'Z', bengali: 'য' },
  { pattern: 'r', bengali: 'র' },
  { pattern: 'l', bengali: 'ল' },
  { pattern: 's', bengali: 'স' },
  { pattern: 'S', bengali: 'ষ' },
  { pattern: 'h', bengali: 'হ' },
  { pattern: 'R', bengali: 'ড়' },
  { pattern: 'y', bengali: 'য়' },
  { pattern: 'Y', bengali: 'য়' },
  { pattern: 'w', bengali: 'ও' }
];

// Vowel rules: Independent vs Dependent (Kar)
const VOWEL_RULES = [
  { pattern: 'aa', independent: 'আ', kar: 'া' },
  { pattern: 'oi', independent: 'ঐ', kar: 'ৈ' },
  { pattern: 'ou', independent: 'ঔ', kar: 'ৌ' },
  { pattern: 'ee', independent: 'ঈ', kar: 'ী' },
  { pattern: 'oo', independent: 'ঊ', kar: 'ূ' },
  { pattern: 'rri', independent: 'ঋ', kar: 'ৃ' },
  { pattern: 'a', independent: 'অ', kar: '' },
  { pattern: 'i', independent: 'ই', kar: 'ি' },
  { pattern: 'u', independent: 'উ', kar: 'ু' },
  { pattern: 'e', independent: 'এ', kar: 'ে' },
  { pattern: 'o', independent: 'ও', kar: 'ো' },
  { pattern: 'A', independent: 'আ', kar: 'া' },
  { pattern: 'I', independent: 'ঈ', kar: 'ী' },
  { pattern: 'U', independent: 'ঊ', kar: 'ূ' },
  { pattern: 'E', independent: 'এ', kar: 'ে' },
  { pattern: 'O', independent: 'ও', kar: 'ো' }
];

export function transliterateOffline(input) {
  if (!input) return [];

  const raw = transliteratePhoneticRaw(input);
  const dictMatches = searchDictionary(input);

  const candidates = [];

  // 1. High-frequency dictionary matches take top priority
  for (const match of dictMatches) {
    if (!candidates.includes(match)) {
      candidates.push(match);
    }
  }

  // 2. Direct algorithmic rule output
  if (raw && !candidates.includes(raw)) {
    candidates.push(raw);
  }

  // 3. Fallbacks and common phonetic variants if fewer than 5
  if (candidates.length < 5 && raw) {
    const variant1 = raw.replace(/ি/g, 'ী');
    if (variant1 !== raw && !candidates.includes(variant1)) candidates.push(variant1);

    const variant2 = raw.replace(/শ/g, 'স');
    if (variant2 !== raw && !candidates.includes(variant2)) candidates.push(variant2);

    const variant3 = raw.replace(/^অ/, 'আ');
    if (variant3 !== raw && !candidates.includes(variant3)) candidates.push(variant3);
  }

  return candidates.slice(0, 5);
}

// Core rule-based single-pass transliteration
export function transliteratePhoneticRaw(text) {
  if (!text) return '';

  let result = '';
  let i = 0;
  let prevIsConsonant = false;

  while (i < text.length) {
    // Special punctuation
    if (text[i] === '|' || text[i] === '.') {
      result += DARI;
      prevIsConsonant = false;
      i++;
      continue;
    }

    // Check for Vowels
    let matchedVowel = null;
    for (const v of VOWEL_RULES) {
      if (text.startsWith(v.pattern, i)) {
        matchedVowel = v;
        break;
      }
    }

    if (matchedVowel) {
      if (prevIsConsonant) {
        if (matchedVowel.pattern === 'a') {
          // In Bengali phonetics, terminal 'a' after a consonant represents A-kar 'া' (e.g. kotha -> কথা, bangla -> বাংলা)
          if (i + 1 === text.length) {
            result += 'া';
          }
        } else {
          result += matchedVowel.kar;
        }
      } else {
        result += matchedVowel.independent;
      }
      prevIsConsonant = false;
      i += matchedVowel.pattern.length;
      continue;
    }

    // Check for Consonants
    let matchedConsonant = null;
    for (const c of CONSONANT_RULES) {
      if (text.startsWith(c.pattern, i)) {
        matchedConsonant = c;
        break;
      }
    }

    if (matchedConsonant) {
      if (prevIsConsonant) {
        // If consecutive consonants without intervening vowel, insert hasanta
        result += HASANTA + matchedConsonant.bengali;
      } else {
        result += matchedConsonant.bengali;
      }
      prevIsConsonant = true;
      i += matchedConsonant.pattern.length;
      continue;
    }

    // Non-alphabetical passthrough (numbers, symbols, spaces)
    result += text[i];
    prevIsConsonant = false;
    i++;
  }

  return result;
}
