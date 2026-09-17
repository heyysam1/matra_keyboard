# Matra Keyboard — মাত্রা কীবোর্ড

> **State-of-the-Art Modern Bengali Desktop Keyboard & Typing Environment for Windows**

Matra Keyboard is a native Windows desktop Bengali typing application built from the ground up to deliver a fluid, high-performance, and visually stunning typing experience. It combines modern translucent Obsidian glassmorphism design with a unified, resilient transliteration engine.

---

## 1. System Requirements & Technology Stack

- **Operating System:** Windows 10 / Windows 11 (64-bit architecture)
- **Runtime & Environment:**
  - **Node.js:** `>= 20.0.0` (LTS)
  - **Electron:** `34.2.0` (Pinned exact release)
  - **Vite:** `^6.2.0` (Fast ES Module bundler)
- **Frontend Architecture:** Vanilla HTML5, modern CSS3 (custom design system tokens, backdrop-filter glassmorphism, responsive flex/grid layouts), ES6+ JavaScript modules.
- **Audio Synthesis:** Native Web Audio API procedural acoustic synthesizer (zero external audio file dependencies).
- **Typography:** Bundled offline `Hind Siliguri` font family (SIL Open Font License 1.1).

---

## 2. Key Features & Subsystems

### Core Transliteration Engine (Sections 4–6)
- **Unified Dual-Engine Strategy:** Continuous typing with online transliteration via Google Input Tools API and immediate failover to an offline rule-based phonetic engine.
- **Phonetic Cache:** In-memory LRU cache preventing duplicate network roundtrips.
- **Candidate Suggestion Popover:** 5-candidate vertical popover calibrated to 230px (20% width reduction for optimal focus) with hotkey candidate bar (`[1]` to `[5]` selection, Space/Enter commit, ESC dismiss).
- **Punctuation & Dari Handling:** Intelligent automatic Dari (`।`) conversion for dot (`.`) with continuous sentence punctuation support.

### Modes, Layouts & Visualizer (Sections 7–9)
- **Dual Mode Switching:** Bengali (`bn`) and English (`en`) mode toggle via global hotkeys (`Ctrl+Space` or `F12`), System Tray, or UI header.
- **Multi-Layout Support:**
  - **Avro Phonetic:** Intuitive phonetic transliteration.
  - **Bijoy Classic / National:** Traditional layout mapping with full Shift state support.
  - **Probhat Layout:** National modern Bengali keyboard standard.
- **Virtual Keyboard Layout Viewer:** Full live keyboard matrix with real-time keypress illumination, interactive clickable keycaps, Shift toggle, and dual-glyph rendering.
- **Mechanical Sound Feedback:** Web Audio procedural sound synthesizer offering Tactile Mechanical, Classic Typewriter, and Cushioned Membrane audio profiles with adjustable volume and live auditioning.

### System Tray & Window Lifecycle (Sections 12–16)
- **Windows System Tray:** Complete native system tray menu with language mode indicator, layout selector, and window controls.
- **Restored Tray Popover:** In-app glassmorphic tray preview mimicking modern Windows 11 taskbar popovers.
- **Selectable Logo System:** 3 distinct application identities (Signature Orange, Obsidian Dark, Pure Ivory) with instant UI and tray synchronization.
- **Top Dock Variants:** 5 switchable top dock aesthetics (Slim Searchbar, OLED Nano Capsule, macOS Dynamic Island, Tactile Keypad, Floating Micro Badge).
- **Theme Palettes:** 6 curated themes (Default Orange, Pure OLED Dark, Nordic Light Blue, Warm Ivory, Sunset Amber, Emerald Neon) with custom accent picker, glass opacity, and blur sliders.

### Custom Dictionary & Autocorrect (Section 10)
- **Vocabulary CRUD:** Add, search, edit, and delete custom words with dedicated phonetic keys.
- **IPC Persistence:** Persisted in `%APPDATA%/matra-keyboard/matra_user_dictionary.json`.
- **Rank #1 Suggestion Boosting:** Custom user words are automatically injected at candidate index #0 (rank #1 priority) during live phonetic typing.

### Bijoy / Unicode Converter (Section 11)
- **Bidirectional Script Converter:** Live SutonnyMJ ANSI ↔ Unicode bidirectional conversion.
- **Complex Orthography Handling:** Pre-base Kar reordering (`w` i-kar, `‡` e-kar, `‰` oi-kar), split vowels (`ো`, `ৌ`), reph (`©`), and intricate Bengali conjuncts (`ক্ষ`, `জ্ঞ`, `স্ত`, `ন্ত`, `প্র`, `ক্র`, `ত্র`, `স্থ`, `ক্ত`, `স্ব`).
- **Productivity Tools:** One-click direction swap, clipboard copy with toast feedback, live character and word counters, and sample text loader.

### System Care & Diagnostics (Section 17)
- **Diagnostic Telemetry:** Real-time health metrics displaying lexicon index size, memory heap usage, application uptime, global shortcut hook state, and database file status.
- **API Latency Ping:** Live HTTP latency measurement to Google Input Tools API with offline fallback detection.
- **Memory & Buffer Optimizer:** One-click memory cache flush for ephemeral typing buffers.
- **Database Integrity Verifier:** Validates structural JSON syntax and file health of settings and user dictionary.
- **Engine Soft Reset:** Resets typing pipelines to a clean state while safeguarding user settings and dictionary data.

### Display & Typography (Section 18)
- **Offline Bundled Font:** Bundled all 4 weights of `Hind Siliguri` under SIL Open Font License 1.1 (`HindSiliguri-Regular.ttf`, `HindSiliguri-Medium.ttf`, `HindSiliguri-SemiBold.ttf`, `HindSiliguri-Bold.ttf`).
- **Standard Typography:** Fast switching between Hind Siliguri, Kalpurush, SolaimanLipi, Siyam Rupali, and Noto Sans Bengali.
- **Dynamic Custom Font Installer:** Drag-and-drop installer using native browser `FontFace` API supporting TTF, OTF, and WOFF2 with live CSS variable application.

### Settings, Auto-Startup & Privacy (Sections 19, 21–24)
- **Atomic Persistence:** Settings saved in `%APPDATA%/matra-keyboard/matra_settings.json` with automatic corrupted file backup and default recovery.
- **Backup & Restore:** Full settings export and import via JSON with schema validation.
- **Windows Auto Startup:** Configures per-user Windows Run registry (`HKCU\Software\Microsoft\Windows\CurrentVersion\Run`) with clean unregister on toggle.
- **Single-Instance Lock:** Enforced via Electron `app.requestSingleInstanceLock()`.
- **Zero Keystroke Logging:** 100% private. Raw keystrokes are never logged, stored, or transmitted. Diagnostic logging (`matra.log`) strictly logs application lifecycle and operational errors.

---

## 3. Installation, Build & Development Instructions

### Prerequisites
- Node.js 20.x LTS or higher
- npm 10.x or higher
- Windows 10 or Windows 11 (64-bit)

### Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd "Matra Keyboard"
npm install
```

### Running in Development Mode
To launch the development server with Vite hot-reloading and Electron:
```bash
npm run dev
```
Alternatively, on Windows you can double-click `start-matra-keyboard.bat`.

### Building Production Bundles
To compile and package the production application:
```bash
npm run build
```
This produces:
- `dist/`: Bundled web application assets, CSS tokens, and font files.
- `dist-electron/main/`: Transpiled Electron main process bundle.
- `dist-electron/preload/`: Transpiled context-isolated preload script.

### Running Built Production App
To execute the compiled production build locally:
```bash
npm start
```

### Distributable Installer (.exe via electron-builder / NSIS)
To compile the standalone Windows NSIS installer `.exe`:
```bash
npm run dist
```
This builds both the Vite application and the NSIS installer. The resulting standalone installer:
`release/Matra Keyboard Setup 1.0.0.exe` (87.7 MB)
features full desktop shortcut, Start Menu shortcut, and uninstaller support.

#### Code Signing & SmartScreen Notice
Unless signed with a valid Microsoft EV or standard Authenticode Code-Signing Certificate, the generated installer will trigger a Windows Defender SmartScreen warning (*"Windows protected your PC — Unknown Publisher"*) on first run. Users can proceed by clicking **"More info" -> "Run anyway"**. A production release should be signed using a corporate Authenticode certificate.

---

## 4. Technical Disclosures & Architecture Constraints

### 4.1 System-Wide Typing Architecture (Section 3)
- **Implementation Approach:** Matra Keyboard implements system-wide keyboard input via a native low-level Windows keyboard hook (`SetWindowsHookEx` with `WH_KEYBOARD_LL`) combined with Unicode virtual text injection (`SendInput`).
- **Known Limitations:**
  1. **Privilege Elevation (UIPI):** In accordance with Windows User Interface Privilege Isolation (UIPI), standard user processes cannot inject input into applications running with elevated Administrator privileges (e.g., Task Manager, Command Prompt run as admin). To type into elevated windows, Matra Keyboard must be launched as Administrator.
  2. **DirectX Fullscreen Games:** Some exclusive fullscreen games bypass Windows input queues; borderless windowed mode is recommended for these titles.
  3. **Secure Desktop & Password Fields:** In compliance with Section 24, Matra Keyboard does not attempt to intercept secure system password prompts (e.g., Windows UAC dialogs, Windows Login Lock screen).
  4. **Clipboard Integrity:** Any auxiliary paste fallbacks automatically preserve and restore the user's prior clipboard buffer to prevent silent overwrite.

### 4.2 Single Transliteration Engine Standard (Section 4)
Both the in-app Typing Studio and the system-wide typing path share the exact same underlying transliteration engine:
- `src/engine/TypingSession.js`
- `src/engine/TransliterationService.js`
- `src/engine/OfflinePhoneticEngine.js`
- `src/engine/LayoutManager.js`
- `src/engine/BengaliDictionary.js`
No separate or divergent transliteration code exists.

### 4.3 Auto-Update Mechanism Scope (Section 24A & Section 28)
- **Status:** **Out of Scope for Initial Standalone Build.**
- Matra Keyboard is packaged as an independent, offline-first portable installer. Background auto-update network daemons are omitted to maximize user privacy, eliminate background telemetry, and ensure zero unprompted network activity. Updates are delivered as standalone installer releases.

### 4.4 AI Integration Complete Absence (Section 20)
- Per specification Section 20, **AI Integration is permanently discontinued and 100% absent** from the application.
- There are zero AI pages, zero AI routes, zero AI navigation elements, zero AI configuration settings, zero AI backend services, and zero AI placeholders anywhere in the repository.

---

## 5. Licensing & Commercial Terms (Section 28A)

- **Source Code Ownership:** Full intellectual property ownership of the codebase transfers entirely upon final delivery and acceptance.
- **Third-Party Dependency Compliance:**
  - 100% of all npm dependencies in `package-lock.json` are licensed under permissive open-source licenses (MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, CC0-1.0).
  - **Zero copyleft / GPL / AGPL / LGPL dependencies.**
- **Typography License:** The bundled `Hind Siliguri` font family is licensed under the SIL Open Font License 1.1 (see `src/renderer/assets/fonts/OFL.txt`).
- **Post-Delivery Support:** A 30-day post-delivery warranty window covers defect fixes against the specification at no additional charge.
