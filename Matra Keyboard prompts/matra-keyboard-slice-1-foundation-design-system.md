# Matra Keyboard — SLICE 1 of 6: Foundation & Design System

Paste `matra-keyboard-00-CORE-CONTEXT.md` immediately before this file in the same message/session.
This slice covers Sections 1, 2, 3, 21, 22 of the master spec only. Build only what's below, then
stop and report against Section 25's per-section checklist (Understand → Inspect design → Plan →
Build → Run → Verify functionality → Verify appearance → Review code → only then would you move on —
but do not move on; wait for confirmation before Slice 2.

---

# 1. Design Resource

The main design resource is:

`resources/stitch_modern_bengali_desktop_keyboard.zip`

Explore the ZIP thoroughly before implementation.

It contains the complete visual design for the application, including the different application screens and sections.

There is an HTML file inside the design package. Inspect it and the associated assets carefully to understand the complete design system, including exact pixel dimensions, spacing, and colors used (do not eyeball values — extract them from the HTML/CSS).

Use this design as the primary visual reference for the application.

The design includes the application's:

* main/front page
* typing interface
* suggestion popover
* System Care
* Display/Appearance
* Settings
* other application sections and states

Recreate the design as a real functional desktop application.

Do not simply embed the HTML or use it as a static page.

---

# 2. What the Application Is

Matra Keyboard is a modern Windows desktop Bengali keyboard and typing utility.

Its main purpose is to allow users to type Bengali naturally using phonetic English input.

For example:

`ami tomar sathe kotha bolbo`

should produce:

`আমি তোমার সাথে কথা বলবো`

The application should provide a polished desktop typing experience and system-wide Bengali typing functionality.

**Target environment:** Windows 10 and Windows 11, 64-bit. State clearly if 32-bit support is out of scope (recommended: out of scope unless otherwise needed).

Confirm from the design whether the application's own UI (menus, settings labels, buttons, tray labels) is in Bengali, English, or both — do not assume either without checking the design assets, since this affects every screen being built.

---

# 3. Core Technology

Build the application as a modern Windows desktop application using an appropriate Electron architecture.

Use:

* Electron (specify and pin an exact version in the implementation plan — do not float on "latest")
* Node.js (specify and pin the LTS version used)
* HTML/CSS/JavaScript or an appropriate frontend architecture
* Windows-native integration where required
* Clean separation between UI and application logic

Keep the architecture modular and maintainable.

Do not unnecessarily over-engineer the application.

**Known constraint — flag before implementation:** Electron's renderer/main process alone cannot perform system-wide keystroke capture or text injection into arbitrary foreground applications. This requires either a native Node addon (global low-level keyboard hook + `SendInput`) or a Windows Text Services Framework (TSF) IME. Before building Section 12's system-wide typing, the implementer must:
* State which approach will be used and why.
* Disclose known limitations of that approach (e.g., some hook-based approaches fail in certain elevated/admin applications, some games, or UWP apps; TSF IMEs are more robust but significantly more complex to build).
* Confirm whether the app will need to run elevated (as Administrator) to type into elevated windows, and how that is communicated to the user.
* Confirm the approach won't trigger false-positive antivirus/Windows Defender SmartScreen flags without a mitigation plan (e.g., code signing).
* Unless the resources/design indicate a full Windows IME (TSF) is required, default to a low-level keyboard hook plus `SendInput`-style text injection — this is the approach used by comparable Bengali typing tools and is far faster to build correctly than a TSF IME. State this decision explicitly in the implementation plan rather than leaving it open.
* Enforce a single running instance of the application (e.g. Electron's `requestSingleInstanceLock`) so the global hook and tray icon can never be registered twice.
* Guarantee the keyboard hook is released cleanly on normal exit, crash, or forced termination, so the app can never leave Windows in a broken input state (e.g., a stuck modifier key or an inability to type in other applications) after it closes unexpectedly.
* Keep the background footprint lightweight, since this runs continuously: near-zero CPU usage while idle, and a modest, stable memory footprint consistent with a background input utility, not a heavier app.
* Define coexistence behavior with other Bengali input tools the user may already have installed (e.g., Avro, Bijoy): at minimum, detect an obvious conflict (such as another tool also holding a global keyboard hook) and warn the user, rather than silently producing broken or double-processed input.
* If the chosen text-injection method ever relies on a clipboard-paste trick (a common workaround when direct Unicode `SendInput` isn't reliable in a given app), it must save and restore the user's existing clipboard content afterward — never leave the user's clipboard silently overwritten by something they didn't copy.

---

# 21. Main / Front Page

Build the application's main/front page according to the supplied design.

Follow the design for:

* layout
* spacing
* typography
* colors
* cards
* buttons
* icons
* navigation
* backgrounds
* borders
* shadows
* hierarchy
* interactions

The front page must be functional, not a static mockup.

Include a brief first-run experience explaining what the tray icon does and how to start typing. If setup ever needs to trigger a Windows permission prompt, precede it with a plain-language in-app explanation of why it's needed, rather than surfacing a raw system dialog with no context.

---

# 22. Design Fidelity

The supplied Stitch design is the visual source of truth.

Recreate its visual language faithfully.

Do not replace the design with a generic dashboard.

Do not introduce unrelated UI patterns.

Do not redesign sections unnecessarily.

Where functionality requires something that is not explicitly represented visually, add only the minimum UI necessary while preserving the existing design language, and flag each such addition explicitly for review (don't silently add UI the design never showed).