// Matra Keyboard — Unified Transliteration Service Orchestrator
// Coordinates online suggestions (Google Input Tools) with offline rule-based fallback and caching.

import { fetchOnlineSuggestions } from './OnlineTransliterationService.js';
import { transliterateOffline } from './OfflinePhoneticEngine.js';

class TransliterationService {
  constructor() {
    this.isOnlineAvailable = true;
  }

  /**
   * Get candidates for a given phonetic token.
   * Returns up to 5 ranked candidates.
   * Seamlessly fails over to offline engine on network errors or timeouts.
   * @param {string} token
   * @returns {Promise<string[]>}
   */
  async getCandidates(token) {
    if (!token || typeof token !== 'string') return [];
    const clean = token.trim();
    if (!clean) return [];

    // Attempt online transliteration
    try {
      const onlineResults = await fetchOnlineSuggestions(clean);
      if (onlineResults && onlineResults.length > 0) {
        this.isOnlineAvailable = true;
        return onlineResults;
      }
    } catch (_err) {
      // Network failure, rate limit, or timeout -> seamless offline fallback
      this.isOnlineAvailable = false;
    }

    // Fallback: Offline Rule-Based + Dictionary Engine
    return transliterateOffline(clean);
  }

  /**
   * Synchronous instant preliminary candidates (used to update UI immediately while online queries resolve)
   * @param {string} token
   * @returns {string[]}
   */
  getCandidatesSync(token) {
    if (!token) return [];
    return transliterateOffline(token);
  }
}

export const transliterationService = new TransliterationService();
