// Matra Keyboard — High-Precision Bijoy (ANSI / SutonnyMJ) ↔ Unicode Bengali Converter
// Implements canonical character mapping, conjunct ligatures, reph, and pre-base / post-base vowel reordering.

// -------------------------------------------------------------
// 1. BIJOY ANSI -> UNICODE CONVERSION TABLES
// -------------------------------------------------------------

const PRE_CONVERSION_REPLACEMENTS = [
  [/yy/g, 'y'],
  [/vv/g, 'v'],
  [/y&/g, 'y'],
  [/wu/g, 'uw'],
  [/[\u2021\u2020]u/g, 'u\u2021']
];

const MULTI_CHAR_CONJUNCTS = [
  ['i\u00E6', 'রু'],
  ['i\u201C', 'রু'],
  ['i\u0192', 'রূ'],
  ['M\u00F8', 'গ্ল'],
  ['\u201DQ\u00A6', 'চ্ছ্ব'],
  ['c\u00F8', 'প্ল'],
  ['e\u00F8', 'ব্ল'],
  ['k\u00F8', 'শ্ল'],
  ['\u00A4\u00F8', 'ম্ল'],
  ['\u00AF\u00F8', 'স্ল'],
  ['\u00E5\u201C', 'ভ্রু'],
  ['\u00AF\u00CD\u00A1', 'স্ত্ব'], // ¯Í¡ -> স্ত্ব
  ['\u0161\u00CD\u00A1', 'ন্ত্ব'], // šÍ¡ -> ন্ত্ব
  ['\u00AF\u00CD', 'স্ত'],       // ¯Í -> স্ত
  ['\u0161\u00CD', 'ন্ত'],       // šÍ -> ন্ত
  ['\u00CB\u00A1', 'ত্ত্ব'],       // Ë¡ -> ত্ত্ব
  ['\\\\\\\\', '॥'],
  ['kÖ', 'শ্র'],
  ['cÖ', 'প্র'],
  ['eª', 'ব্র'],
  ['åª', 'ভ্র'],
  ['gª', 'ম্র'],
  ['b¥', 'ন্ম'],
  ['šÍ', 'ন্ত'],
  ['š’', 'ন্থ'],
  ['¯’', 'স্থ'],
  ['¯‹', 'স্ক'],
  ['¯Œ', 'স্ক্র'],
  ['¯Í', 'স্ত'],
  ['¯œ', 'স্ন'],
  ['¯ú', 'স্প'],
  ['¯¢', 'স্ফ'],
  ['¯^', 'স্ব'],
  ['¯§', 'স্ম'],
  ['¯²', 'স্ত্ব']
];

const SINGLE_CHAR_CONJUNCTS = [
  ['^', '্ব'],
  ['\u2018', '্তু'],
  ['\u2019', '্থ'],
  ['\u2039', '্ক'],
  ['\u0152', '্ক্র'],
  ['\u201D', 'চ্'],
  ['\u2014', '্ত'],
  ['\u02DC', 'দ্'],
  ['\u2122', 'দ্'],
  ['\u0161', 'ন্'],
  ['\u203A', 'ন্'],
  ['\u0153', '্ন'],
  ['\u0178', '্ব'],
  ['\u00A1', '্ব'],
  ['\u00A2', '্ভ'],
  ['\u00A3', '্ভ্র'],
  ['\u00A4', 'ম্'],
  ['\u00A5', '্ম'],
  ['\u00A6', '্ব'],
  ['\u00A7', '্ম'],
  ['\u00A8', '্য'],
  ['\u00A9', 'র্'],
  ['\u00AA', '্র'],
  ['\u00AB', '্র'],
  ['\u00AC', '্ল'],
  ['\u00AD', '্ল'],
  ['\u00AE', 'ষ্'],
  ['\u00AF', 'স্'],
  ['\u00B0', 'ক্ক'],
  ['\u00B1', 'ক্ট'],
  ['\u00B2', 'ক্ষ্ণ'],
  ['\u00B3', 'ক্ত'],
  ['\u00B4', 'ক্ম'],
  ['\u00B5', 'ক্র'],
  ['\u00B6', 'ক্ষ'],
  ['\u00B7', 'ক্স'],
  ['\u00B8', 'গু'],
  ['\u00B9', 'জ্ঞ'],
  ['\u00BA', 'গ্দ'],
  ['\u00BB', 'গ্ধ'],
  ['\u00BC', 'ঙ্ক'],
  ['\u00BD', 'ঙ্গ'],
  ['\u00BE', 'জ্জ'],
  ['\u00BF', '্ত্র'],
  ['\u00C0', 'জ্ঝ'],
  ['\u00C1', 'জ্ঞ'],
  ['\u00C2', 'ঞ্চ'],
  ['\u00C3', 'ঞ্ছ'],
  ['\u00C4', 'ঞ্জ'],
  ['\u00C5', 'ঞ্ঝ'],
  ['\u00C6', 'ট্ট'],
  ['\u00C7', 'ড্ড'],
  ['\u00C8', 'ণ্ট'],
  ['\u00C9', 'ণ্ঠ'],
  ['\u00CA', 'ণ্ড'],
  ['\u00CB', 'ত্ত'],
  ['\u00CC', 'ত্থ'],
  ['\u00CD', 'ত্ম'],
  ['\u00CE', 'ত্র'],
  ['\u00CF', 'দ্দ'],
  ['\u00D6', '্র'],
  ['\u00D7', 'দ্ধ'],
  ['\u00D8', 'দ্ব'],
  ['\u00D9', 'দ্ম'],
  ['\u00DA', 'ন্ঠ'],
  ['\u00DB', 'ন্ড'],
  ['\u00DC', 'ন্ধ'],
  ['\u00DD', 'ন্স'],
  ['\u00DE', 'প্ট'],
  ['\u00DF', 'প্ত'],
  ['\u00E0', 'প্প'],
  ['\u00E1', 'প্স'],
  ['\u00E2', 'ব্জ'],
  ['\u00E3', 'ব্দ'],
  ['\u00E4', 'ব্ধ'],
  ['\u00E5', 'ভ্র'],
  ['\u00E6', 'ু'],
  ['\u00E7', 'ম্ফ'],
  ['\u00E8', '্ন'],
  ['\u00E9', 'ল্ক'],
  ['\u00EA', 'ল্গ'],
  ['\u00EB', 'ল্ট'],
  ['\u00EC', 'ল্ড'],
  ['\u00ED', 'ল্প'],
  ['\u00EE', 'ল্ফ'],
  ['\u00EF', 'শু'],
  ['\u00F0', 'শ্চ'],
  ['\u00F1', 'শ্ছ'],
  ['\u00F2', 'ষ্ণ'],
  ['\u00F3', 'ষ্ট'],
  ['\u00F4', 'ষ্ঠ'],
  ['\u00F5', 'ষ্ফ'],
  ['\u00F6', 'স্খ'],
  ['\u00F7', 'স্ট'],
  ['\u00F8', 'স্ন'],
  ['\u00F9', 'স্ফ'],
  ['\u00FA', '্প'],
  ['\u00FB', 'হু'],
  ['\u00FC', 'হৃ'],
  ['\u00FD', 'হ্ন'],
  ['\u00FE', 'হ্ম'],
  ['\u00FF', 'ক্ষ'],
  ['²', 'ক্ত'],
  ['³', 'ক্ত'],
  ['¶', 'ক্ষ'],
  ['Á', 'জ্ঞ'],
  ['ý', 'হ্ম'],
  ['þ', 'হ্ন'],
  ['ÿ', 'হ্ব'],
  ['µ', 'ক্র'],
  ['Î', 'ত্র'],
  ['›', 'ন্দ'],
  ['Ü', 'ন্ধ'],
  ['Ý', 'ন্ন'],
  ['Ë', 'ত্ত']
];

const BASIC_CHARS_MAP = {
  'Av': 'আ',
  'A': 'অ',
  'B': 'ই',
  'C': 'ঈ',
  'D': 'উ',
  'E': 'ঊ',
  'F': 'ঋ',
  'G': 'এ',
  'H': 'ঐ',
  'I': 'ও',
  'J': 'ঔ',

  'K': 'ক',
  'L': 'খ',
  'M': 'গ',
  'N': 'ঘ',
  'O': 'ঙ',
  'P': 'চ',
  'Q': 'ছ',
  'R': 'জ',
  'S': 'ঝ',
  'T': 'ঞ',
  'U': 'ট',
  'V': 'ঠ',
  'W': 'ড',
  'X': 'ঢ',
  'Y': 'ণ',
  'Z': 'ত',
  '_': 'থ',
  '`': 'দ',
  'a': 'ধ',
  'b': 'ন',
  'c': 'প',
  'd': 'ফ',
  'e': 'ব',
  'f': 'ভ',
  'g': 'ম',
  'h': 'য',
  'i': 'র',
  'j': 'ল',
  'k': 'শ',
  'l': 'ষ',
  'm': 'স',
  'n': 'হ',
  'o': 'ড়',
  'p': 'ঢ়',
  'q': 'য়',
  'r': 'ৎ',
  's': 'ং',
  't': 'ঃ',
  'u': 'ঁ',

  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',

  'v': 'া',
  'w': 'ি',
  'x': 'ী',
  'y': 'ু',
  'z': 'ু',
  '~': 'ূ',
  '\u0192': 'ূ',
  '\u201E': 'ৃ',
  '\u2026': 'ৃ',
  '\u2020': 'ে',
  '\u2021': 'ে',
  '\u02C6': 'ৈ',
  '\u2030': 'ৈ',
  '\u0160': 'ৗ',
  '|': '।',
  '&': '্'
};

const BANGLA_CONSONANTS = "কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহড়ঢ়য়ৎংঃঁ";
const BANGLA_PRE_KARS = ["ি", "ৈ", "ে"];
const BANGLA_POST_KARS = ["া", "ো", "ৌ", "ৗ", "ু", "ূ", "ী", "ৃ"];
const HALANT = "\u09CD";

function isBanjonborno(ch) {
  return Boolean(ch && BANGLA_CONSONANTS.includes(ch));
}

function isHalant(ch) {
  return ch === HALANT;
}

function isPreKar(ch) {
  return BANGLA_PRE_KARS.includes(ch);
}

function isPostKar(ch) {
  return BANGLA_POST_KARS.includes(ch);
}

function isKar(ch) {
  return isPreKar(ch) || isPostKar(ch);
}

/**
 * Converts Bijoy (ANSI/SutonnyMJ) text to Unicode Bengali
 * @param {string} text
 * @returns {string}
 */
export function bijoyToUnicode(text) {
  if (!text || typeof text !== 'string') return '';

  let str = text;

  // 1. Pre-conversion cleanup
  for (const [re, rep] of PRE_CONVERSION_REPLACEMENTS) {
    str = str.replace(re, rep);
  }

  // 2. Multi-char conjunct sequences
  for (const [bijoy, uni] of MULTI_CHAR_CONJUNCTS) {
    str = str.split(bijoy).join(uni);
  }

  // 3. Single-char conjuncts
  for (const [bijoy, uni] of SINGLE_CHAR_CONJUNCTS) {
    str = str.split(bijoy).join(uni);
  }

  // 4. Basic characters & vowels
  // Av must come before A
  str = str.replace(/Av/g, 'আ');
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    out += BASIC_CHARS_MAP[ch] !== undefined ? BASIC_CHARS_MAP[ch] : ch;
  }
  str = out;

  // 5. Syllable reordering (pre-kar, split-kar, reph)
  let i = 0;
  // Handle trailing Reph (consonant + র + ্ -> র + ্ + consonant)
  while (i < str.length - 1) {
    if (
      str[i] === 'র' &&
      isHalant(str[i + 1]) &&
      i > 0 &&
      isBanjonborno(str[i - 1]) &&
      !isHalant(str[i - 2]) &&
      !(isBanjonborno(str[i + 2]) && isHalant(str[i + 3]))
    ) {
      let j = 1;
      while (i - j - 1 >= 0 && isBanjonborno(str[i - j - 1]) && isHalant(str[i - j])) {
        j += 2;
      }
      str = str.slice(0, i - j) + str[i] + str[i + 1] + str.slice(i - j, i) + str.slice(i + 2);
      i += 2;
      continue;
    }
    i++;
  }

  // Shift pre-base vowel signs (ি, ে, ৈ) after the consonant cluster
  i = 0;
  while (i < str.length) {
    if (isPreKar(str[i]) && str[i + 1] && !/\s/.test(str[i + 1])) {
      let j = 1;
      while (i + j < str.length && isBanjonborno(str[i + j])) {
        if (i + j + 1 < str.length && isHalant(str[i + j + 1])) {
          j += 2;
        } else {
          break;
        }
      }

      let temp = str.slice(0, i);
      temp += str.slice(i + 1, i + j + 1);

      let l = 0;
      if (str[i] === 'ে' && str[i + j + 1] === 'া') {
        temp += 'ো';
        l = 1;
      } else if (str[i] === 'ে' && str[i + j + 1] === 'ৗ') {
        temp += 'ৌ';
        l = 1;
      } else {
        temp += str[i];
      }

      temp += str.slice(i + j + l + 1);
      str = temp;
      i += j;
    }
    i++;
  }

  // Post-conversion cleans
  str = str.replace(/্্/g, '্');
  str = str.replace(/অা/g, 'আ');

  return str;
}

// -------------------------------------------------------------
// 2. UNICODE -> BIJOY ANSI CONVERSION TABLES
// -------------------------------------------------------------

const UNICODE_TO_BIJOY_CONJUNCTS = [
  ['স্ত্ব', '\u00AF\u00CD\u00A1'],
  ['ন্ত্ব', '\u0161\u00CD\u00A1'],
  ['ত্ত্ব', '\u00CB\u00A1'],
  ['শ্র', 'kÖ'],
  ['প্র', 'cÖ'],
  ['প্ল', 'cø'],
  ['প্ন', 'cœ'],
  ['ব্র', 'eª'],
  ['ভ্র', 'åª'],
  ['ম্র', 'gª'],
  ['ন্ম', 'b¥'],
  ['ন্ত', 'šÍ'],
  ['ন্থ', 'š’'],
  ['স্থ', '¯’'],
  ['স্ক', '¯‹'],
  ['স্ক্র', '¯Œ'],
  ['স্ত', '¯Í'],
  ['স্ন', '¯œ'],
  ['স্প', '¯ú'],
  ['স্ফ', '¯¢'],
  ['স্ব', '¯^'],
  ['স্ম', '¯§'],
  ['ক্র', 'µ'],
  ['ত্র', 'Î'],
  ['ত্ব', 'Ï'],
  ['ত্ত', 'Ë'],
  ['ত্থ', 'Ì'],
  ['দ্দ', 'Ñ'],
  ['দ্ধ', 'Ò'],
  ['দ্ব', 'Ó'],
  ['দ্ম', 'Ô'],
  ['ধ্ব', 'Õ'],
  ['ন্ট', 'Ö'],
  ['ন্ঠ', '×'],
  ['ন্ড', 'Ø'],
  ['ক্ষ', '¶'],
  ['জ্ঞ', 'Á'],
  ['হ্ম', 'ý'],
  ['হ্ন', 'þ'],
  ['হ্ব', 'ÿ'],
  ['ক্ক', '°'],
  ['ক্ট', '±'],
  ['ক্ত', '³'],
  ['ঙ্ক', '¼'],
  ['ঙ্গ', '½'],
  ['ন্দ', '›'],
  ['ন্ধ', 'Ü'],
  ['ন্ন', 'Ý'],
  ['জ্জ', '¾'],
  ['ট্ট', 'Æ'],
  ['ড্ড', 'Ç'],
  ['ণ্ট', 'È'],
  ['ণ্ঠ', 'É'],
  ['ণ্ড', 'Ê'],
  ['প্প', 'à'],
  ['প্ত', 'á'],
  ['প্স', 'ã'],
  ['ব্দ', 'ã'],
  ['ব্ধ', 'ä'],
  ['ব্ব', 'å'],
  ['ভ্ব', 'æ'],
  ['ম্প', 'ç'],
  ['ম্ফ', 'è'],
  ['ম্ব', 'é'],
  ['ম্ভ', 'ê'],
  ['ম্ম', 'ë'],
  ['ল্ক', 'ì'],
  ['ল্ট', 'î'],
  ['ল্ড', 'ï'],
  ['ল্প', 'ð'],
  ['ল্ল', 'ô'],
  ['শ্চ', 'õ'],
  ['ষ্ট', 'û'],
  ['ষ্ঠ', 'ü'],
  ['ষ্ণ', 'ò'],
  ['রু', 'iæ'],
  ['রূ', 'i\u0192'],
  ['ভ্রু', '\u00E5\u201C']
];

const UNICODE_TO_BIJOY_CHARS = {
  'অ': 'A', 'আ': 'Av', 'ই': 'B', 'ঈ': 'C', 'উ': 'D', 'ঊ': 'E', 'ঋ': 'F',
  'এ': 'G', 'ঐ': 'H', 'ও': 'I', 'ঔ': 'J',
  'ক': 'K', 'খ': 'L', 'গ': 'M', 'ঘ': 'N', 'ঙ': 'O',
  'চ': 'P', 'ছ': 'Q', 'জ': 'R', 'ঝ': 'S', 'ঞ': 'T',
  'ট': 'U', 'ঠ': 'V', 'ড': 'W', 'ঢ': 'X', 'ণ': 'Y',
  'ত': 'Z', 'থ': '_', 'দ': '`', 'ধ': 'a', 'ন': 'b',
  'প': 'c', 'ফ': 'd', 'ব': 'e', 'ভ': 'f', 'ম': 'g',
  'য': 'h', 'র': 'i', 'ল': 'j', 'শ': 'k', 'ষ': 'l', 'স': 'm', 'হ': 'n',
  'ড়': 'o', 'ঢ়': 'p', 'য়': 'q', 'ৎ': 'r',
  'ং': 's', 'ঃ': 't', 'ঁ': 'u', '।': '|',
  'া': 'v', 'ী': 'x', 'ু': 'y', 'ূ': '~', 'ৃ': '\u201E',
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

/**
 * Converts Unicode Bengali text to Bijoy (ANSI / SutonnyMJ) encoding.
 * @param {string} text
 * @returns {string}
 */
export function unicodeToBijoy(text) {
  if (!text || typeof text !== 'string') return '';

  let res = text;

  // 1. Reph reorder: র + ্ + Consonant => Consonant + ©
  res = res.replace(/র\u09CD([\u0985-\u09B9])/g, '$1\u00A9');

  // 2. Pre-base vowel shifting (only applies to consonants, not independent vowels):
  // Split vowels: Consonant + ো => ‡ + Consonant + v
  res = res.replace(/([\u0995-\u09B9\u09CD]+)ো/g, '\u2021$1v');
  // Split vowels: Consonant + ৌ => ‡ + Consonant + Š
  res = res.replace(/([\u0995-\u09B9\u09CD]+)ৌ/g, '\u2021$1\u0160');

  // E-kar: Consonant + ে => ‡ + Consonant
  res = res.replace(/([\u0995-\u09B9\u09CD]+)ে/g, '\u2021$1');
  // Oi-kar: Consonant + ৈ => ‰ + Consonant
  res = res.replace(/([\u0995-\u09B9\u09CD]+)ৈ/g, '\u2030$1');
  // I-kar: Consonant + ি => w + Consonant
  res = res.replace(/([\u0995-\u09B9\u09CD]+)ি/g, 'w$1');

  // 3. Known conjunct ligatures
  for (const [uni, bijoy] of UNICODE_TO_BIJOY_CONJUNCTS) {
    res = res.split(uni).join(bijoy);
  }

  // 4. Character mappings
  let out = '';
  for (let i = 0; i < res.length; i++) {
    const ch = res[i];
    if (UNICODE_TO_BIJOY_CHARS[ch] !== undefined) {
      out += UNICODE_TO_BIJOY_CHARS[ch];
    } else {
      out += ch;
    }
  }

  return out;
}
