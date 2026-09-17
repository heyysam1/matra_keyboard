// Matra Keyboard — Custom Dictionary Manager
// Handles custom vocabulary CRUD, persistence via IPC, search filtering, and typing engine integration.

import { loadUserWords, addUserWord, updateUserWord, removeUserWord, getUserWords, generatePhoneticKey } from '../../engine/BengaliDictionary.js';
import { showSettingsToast } from './settingsManager.js';

let localUserDictionary = [];
let searchQuery = '';

export async function initDictionaryManager() {
  await loadDictionaryFromStorage();
  setupDictionaryUI();
}

async function loadDictionaryFromStorage() {
  if (window.matraAPI && window.matraAPI.getUserDictionary) {
    try {
      const stored = await window.matraAPI.getUserDictionary();
      if (Array.isArray(stored)) {
        localUserDictionary = stored;
      }
    } catch (err) {
      console.warn('[DictionaryManager] Failed to load user dictionary from IPC, using localStorage fallback:', err);
      localUserDictionary = loadLocalFallback();
    }
  } else {
    localUserDictionary = loadLocalFallback();
  }

  // Load into engine's BengaliDictionary map for live typing suggestions
  loadUserWords(localUserDictionary);
  renderDictionaryList();
}

function loadLocalFallback() {
  try {
    const raw = localStorage.getItem('matra_user_dictionary');
    return raw ? JSON.parse(raw) : [];
  } catch (_e) {
    return [];
  }
}

function saveLocalFallback(entries) {
  try {
    localStorage.setItem('matra_user_dictionary', JSON.stringify(entries));
  } catch (_e) {}
}

function setupDictionaryUI() {
  const addBtn = document.getElementById('btn-add-dict-word');
  const wordInput = document.getElementById('dict-word-input');
  const keyInput = document.getElementById('dict-key-input');
  const searchInput = document.getElementById('dict-search-input');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      handleAddWord();
    });
  }

  if (wordInput) {
    wordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAddWord();
    });
  }

  if (keyInput) {
    keyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAddWord();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target.value || '').trim().toLowerCase();
      renderDictionaryList();
    });
  }
}

async function handleAddWord() {
  const wordInput = document.getElementById('dict-word-input');
  const keyInput = document.getElementById('dict-key-input');
  if (!wordInput) return;

  const rawWord = (wordInput.value || '').trim();
  if (!rawWord) {
    showSettingsToast('অনুগ্রহ করে একটি বাংলা শব্দ লিখুন', 'error');
    wordInput.focus();
    return;
  }

  const rawKey = (keyInput && keyInput.value ? keyInput.value : generatePhoneticKey(rawWord)).trim().toLowerCase();

  // 1. Update engine memory
  addUserWord(rawWord, rawKey);

  // 2. Persist via IPC or fallback
  if (window.matraAPI && window.matraAPI.addUserWord) {
    try {
      await window.matraAPI.addUserWord(rawWord, rawKey);
    } catch (err) {
      console.error('[DictionaryManager] Failed to add via IPC:', err);
    }
  }

  // Update local list
  const existingIdx = localUserDictionary.findIndex(e => e.word === rawWord);
  const newEntry = { word: rawWord, key: rawKey, createdAt: new Date().toISOString() };
  if (existingIdx >= 0) {
    localUserDictionary[existingIdx] = newEntry;
  } else {
    localUserDictionary.unshift(newEntry);
  }
  saveLocalFallback(localUserDictionary);

  // Clear inputs and re-render
  wordInput.value = '';
  if (keyInput) keyInput.value = '';
  renderDictionaryList();

  showSettingsToast(`'${rawWord}' শব্দটি ডিকশনারিতে যুক্ত করা হয়েছে`, 'success');
  wordInput.focus();
}

export async function deleteWord(word) {
  if (!word) return;

  // 1. Remove from engine
  removeUserWord(word);

  // 2. Persist via IPC
  if (window.matraAPI && window.matraAPI.deleteUserWord) {
    try {
      await window.matraAPI.deleteUserWord(word);
    } catch (err) {
      console.error('[DictionaryManager] Failed to delete via IPC:', err);
    }
  }

  localUserDictionary = localUserDictionary.filter(e => e.word !== word);
  saveLocalFallback(localUserDictionary);

  renderDictionaryList();
  showSettingsToast(`'${word}' শব্দটি মুছে ফেলা হয়েছে`, 'info');
}

export async function promptEditWord(word) {
  const item = localUserDictionary.find(e => e.word === word);
  if (!item) return;

  const newWord = prompt('সম্পাদিত বাংলা শব্দ লিখুন:', item.word);
  if (newWord === null) return;
  const cleanNewWord = newWord.trim();
  if (!cleanNewWord) {
    showSettingsToast('শব্দ খালি রাখা যাবে না', 'error');
    return;
  }

  const newKey = prompt('ফোনেটিক শর্টকাট কি লিখুন (ইংরেজি):', item.key || generatePhoneticKey(cleanNewWord));
  if (newKey === null) return;
  const cleanNewKey = (newKey.trim() || generatePhoneticKey(cleanNewWord)).toLowerCase();

  // Update engine
  updateUserWord(word, cleanNewWord, cleanNewKey);

  // Update IPC
  if (window.matraAPI && window.matraAPI.updateUserWord) {
    try {
      await window.matraAPI.updateUserWord(word, cleanNewWord, cleanNewKey);
    } catch (err) {
      console.error('[DictionaryManager] Failed to update via IPC:', err);
    }
  }

  const idx = localUserDictionary.findIndex(e => e.word === word);
  const updatedEntry = {
    word: cleanNewWord,
    key: cleanNewKey,
    createdAt: idx >= 0 ? localUserDictionary[idx].createdAt : new Date().toISOString()
  };

  if (idx >= 0) {
    localUserDictionary[idx] = updatedEntry;
  } else {
    localUserDictionary.unshift(updatedEntry);
  }
  saveLocalFallback(localUserDictionary);

  renderDictionaryList();
  showSettingsToast(`'${cleanNewWord}' শব্দটি হালনাগাদ করা হয়েছে`, 'success');
}

export function renderDictionaryList() {
  const container = document.getElementById('dict-entries-list');
  const countBadge = document.getElementById('dict-words-count-badge');
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${localUserDictionary.length} টি শব্দ`;
  }

  const filtered = localUserDictionary.filter(item => {
    if (!searchQuery) return true;
    return item.word.toLowerCase().includes(searchQuery) || item.key.toLowerCase().includes(searchQuery);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glass-input" style="padding: 2.5rem; text-align: center; border-radius: var(--radius-xl); color: #71717a;">
        <svg width="36" height="36" style="margin: 0 auto 0.75rem; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path></svg>
        <div class="font-bengali" style="font-size: 0.875rem; color: #d4d4d8;">${searchQuery ? 'খোঁজ করা শব্দের কোনো মিল পাওয়া যায়নি' : 'কাস্টম ডিকশনারিতে এখনও কোনো শব্দ যুক্ত করা হয়নি'}</div>
        <div class="font-bengali" style="font-size: 0.75rem; color: #71717a; margin-top: 0.25rem;">উপরে নতুন শব্দ ও ফোনেটিক শর্টকাট লিখে যোগ করুন</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="glass-pill dict-entry-card" data-word="${escapeHtml(item.word)}">
      <div style="display: flex; align-items: center; gap: 0.85rem;">
        <div class="dict-word-badge font-bengali">${escapeHtml(item.word)}</div>
        <div style="display: flex; flex-direction: column;">
          <span class="font-mono dict-key-label">${escapeHtml(item.key)}</span>
          <span class="dict-date-label font-mono">${formatDate(item.createdAt)}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button class="dict-action-btn edit-btn" onclick="promptEditWord('${escapeJsString(item.word)}')" title="Edit Word">
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
        </button>
        <button class="dict-action-btn delete-btn" onclick="deleteWord('${escapeJsString(item.word)}')" title="Delete Word">
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJsString(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (_e) {
    return '';
  }
}
