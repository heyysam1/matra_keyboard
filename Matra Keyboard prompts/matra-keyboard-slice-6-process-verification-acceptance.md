# Matra Keyboard — SLICE 6 of 6: Development Process, Verification & Acceptance

Paste `matra-keyboard-00-CORE-CONTEXT.md` immediately before this file in the same message/session.
This slice covers Sections 25, 26, 27, 28, 28A, 28B, 29 of the master spec only. Build only what's below, then
stop and report against Section 25's per-section checklist (Understand → Inspect design → Plan →
Build → Run → Verify functionality → Verify appearance → Review code → only then would you move on —
but do not move on; wait for confirmation before Slice (none — this is the last slice).

---

# 25. Development Process

Before writing the application, inspect the design resources and understand the complete product structure.

Create a clear internal implementation plan.

Then build the application **one major section at a time**.

For every section:

1. Understand the requirement.
2. Inspect its design.
3. Plan its implementation.
4. Build it.
5. Run it.
6. Verify its functionality.
7. Verify its visual appearance.
8. Review the code.
9. Only after it passes, continue to the next section.

Do not attempt to implement the entire application blindly in one pass.

Do not mix unrelated tasks together.

---

# 26. Continuous Self-Review

Throughout development, continuously review your own implementation.

Before moving forward, verify:

* the feature matches the product concept
* the UI matches the supplied design
* the functionality actually works
* state is persisted where required
* the feature integrates correctly with the rest of the application
* no unrelated functionality has been introduced
* the architecture remains clean
* the implementation remains understandable and maintainable

Use logical reasoning when connecting different parts of the application.

For example, removing a discontinued feature should not simply hide its card. Any navigation, state, settings, API or architectural dependency belonging exclusively to that feature should also be removed.

---

# 27. Verification

Do not assume that something works because the code compiles.

After each major section, verify it properly.

Verification should include the appropriate combination of:

* code verification
* runtime verification
* UI verification
* interaction verification
* persistence verification (settings/dictionary/logo survive an app restart)
* Windows integration verification (system-wide typing, tray, auto-startup, shortcuts — tested on a real Windows machine, not assumed from code review alone)

Treat the checklist in the Deliverables & Acceptance section below as the concrete, minimum definition of "properly verified" for the Windows-integration items in particular.

System-wide typing behaves differently across app types, so verify it against a named matrix, not just "a real Windows machine": Notepad (native Win32), Microsoft Word, a browser address bar and a web page text field (Chrome or Edge), an Electron-based app (e.g. Discord or Slack), and a UWP app. A pass in Notepad alone does not count as verified.

Also verify the application still works correctly when Windows' own display language is set to Bengali, not only under an English-locale Windows install, since locale can affect input handling.

Only pass a section forward after it has been verified.

---

# 28. Deliverables & Acceptance

Since this build is being purchased as code, the following must be delivered and confirmed before acceptance:

* Full, documented source code (clear comments where logic is non-obvious, especially the transliteration engine and Windows integration layer)
* A README with build/run instructions, required Node/Electron versions, and how to produce a distributable installer
* A working Windows installer (e.g., via `electron-builder`/NSIS) producing a `.exe`, plus confirmation of whether the build is code-signed. If unsigned, the installer will trigger Windows SmartScreen warnings on first run for every user — confirm this is acceptable, or that a code-signing certificate will be obtained, before final delivery
* Confirmation of which system-wide typing approach was used (per Section 3) and its known limitations, in writing
* A test pass on a clean Windows 10 and Windows 11 machine covering: install, first launch, typing (in-app and system-wide) verified against the named app matrix in Section 27, digit/number-key behavior, English-passthrough behavior, suggestion popover, mode switching, layout selection, dictionary, settings/dictionary backup-export and restore, Bijoy/Unicode conversion, tray actions, settings persistence, shortcuts, auto-startup, sounds, System Care, Display/Appearance, logo persistence after restart, single-instance enforcement, and full uninstall cleanup (registry entry and any registered hook/service removed)
* Confirmation that the in-app and system-wide typing paths share one transliteration engine (per Section 4), rather than two separate implementations
* Confirmation that the app version number is visible in-app (per Section 13)
* Written confirmation of whether an auto-update mechanism is in scope for this build (per Section 24A), so it isn't silently assumed either way
* Confirmation that no section, screen, or control was left partially implemented, stubbed, mocked, or hardcoded to merely look functional (per Section 0's Completion Standard)
* Confirmation that no AI Integration remnants exist anywhere in the codebase (per Section 20)

---

# 28A. Ownership, Licensing & Support Terms

Full intellectual property ownership of the delivered source code transfers entirely upon final payment. No license fee, usage restriction, recurring dependency, or retained access should remain with the seller after delivery.

Every third-party dependency (npm packages, native modules, bundled fonts/assets) must be checked for license compatibility with commercial, closed-source redistribution (MIT, Apache-2.0, BSD, and ISC are safe defaults). Flag and get explicit sign-off on any dependency under GPL, AGPL, LGPL, or another restrictive/copyleft license before it's used, since those can force parts of the app to be open-sourced or redistributed under matching terms — something to catch before it's built in, not after.

Source must be delivered as a git repository with its real commit history (not only a final zip snapshot), so the build process and authorship are verifiable rather than opaque.

The seller provides a defined post-delivery support window (e.g., 30 days from delivery) during which defects against this spec are fixed at no additional cost. New feature requests beyond this spec are separate from that window.

---

# 28B. Formal Acceptance Sign-off

Convert the Deliverables & Acceptance checklist (Section 28) together with the Completion Standard (Section 0) into a single written UAT (User Acceptance Testing) script, listing every feature/section as its own pass/fail row rather than one broad approval.

Both buyer and seller sign and date this script before final payment is released. Any row marked fail blocks acceptance until it is fixed and re-verified — acceptance is per completed checklist, not per developer assurance that "it's done."

---

# 29. Final Application

The final Matra Keyboard application should provide:

* modern Windows desktop UI
* Bengali phonetic typing
* Google Input Tools transliteration
* offline Bengali fallback
* live Bengali suggestions
* Bengali/English switching
* keyboard layouts
* Dictionary
* Bijoy/Unicode functionality
* system-wide keyboard integration
* system tray
* configurable shortcuts
* Windows Auto Startup
* keyboard sounds
* System Care
* Display/Appearance
* persistent settings
* three selectable logos
* polished UI based on the supplied Stitch design

The **AI Integration feature must not exist** in the final product.

Build this as a completely new application based on this specification and the supplied design resources.

Do not inherit assumptions from any previous project or development session.

Think through each section before implementing it, implement it independently, verify it, review it, and then move forward.