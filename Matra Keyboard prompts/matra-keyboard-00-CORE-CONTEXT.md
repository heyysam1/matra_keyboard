# Matra Keyboard — CORE CONTEXT (paste this before every slice, every time)

This is a condensed, always-applies preamble. It is not the full spec — it exists so a coding
assistant with limited context still carries the non-negotiable rules even when given only one
slice of the build at a time. The full master spec (`matra-keyboard-build-spec-refined.md`) remains
the single source of truth if anything here and a slice ever seem to conflict — flag the conflict
rather than guessing.

## What this is
# Matra Keyboard — Fresh Build (Refined Spec)

Build a completely new Windows desktop Bengali keyboard application called **Matra Keyboard**.

This is a **completely fresh project**.

Do not use, restore, copy, reconstruct, or depend on any previous Matra Keyboard implementation.

Do not use any previous project files, previous conversations, previous Antigravity context, saved Antigravity memory, old architecture, old code, old implementation decisions, old bug fixes, or assumptions from previous development.

Start from a clean slate and build the application based only on:

1. This prompt
2. The resources provided inside the `resources` folder (path will be supplied at project start — confirm the exact folder path before beginning implementation)
3. The design contained in `stitch_modern_bengali_desktop_keyboard.zip`

The goal is to create the product itself, not to repair or continue an older version.

## How slices work
You will receive this build in ordered slices (Slice 1, Slice 2, ...). Each slice contains only the
sections relevant to that phase. Implement ONLY what is in the current slice. Do not start sections
that belong to a later slice, and do not silently redo work from an earlier slice — assume it exists
and integrate with it. When the current slice is fully done and verified, stop and report completion
against that slice's own checklist before continuing to the next one.

## Non-negotiable, applies to every slice
# 0. Completion Standard — Every Feature Must Fully Work

This is the standard the entire build is judged against, and it overrides any instinct to leave something partially done in order to move faster or finish sooner.

Every function, screen, control, section, and feature described anywhere in this document must be fully implemented and genuinely working — not a stub, not a mock, not hardcoded to look functional, and not left half-wired to real logic.

Concretely:

* If a button, toggle, or menu item exists in the UI, it must perform its real, described action — not a placeholder alert, a console log, or a no-op.
* If a section is listed in this spec (Settings, Dictionary, System Care, Display/Appearance, Bijoy/Unicode, System Tray, Keyboard Shortcuts, Logo System, etc.), it must be built to the same standard as every other section — no section is allowed to be a lower-effort "coming soon" version of itself.
* If real data or state is involved (settings, dictionary entries, logo choice, shortcuts, sounds), it must actually persist and actually affect app behavior — not just update visually in the moment and reset on restart.
* Do not simulate a working feature with fake/sample data where real logic was requested — for example, a suggestion popover that always shows the same canned candidates instead of actually calling the transliteration engine is not acceptable.
* If something genuinely cannot be completed to this standard (a real technical blocker, not a shortcut), it must be explicitly flagged and explained during that section's review — never shipped silently as if it were finished.

Sections 23 (Functional Application), 26 (Continuous Self-Review), 27 (Verification), and 28 (Deliverables & Acceptance) all exist to enforce this standard — treat this section as the underlying rule they are each checking the build against.

---

# 20. AI Integration — DISCONTINUED

The supplied design contains an **AI Integration** section.

Do not implement this feature.

AI Integration is permanently discontinued from the application.

Remove it completely from the product.

That means:

* no AI Integration page
* no AI Integration navigation item
* no AI Integration settings
* no AI Integration System Care section
* no AI Integration API
* no AI Integration backend
* no AI Integration configuration
* no placeholder for the feature

If removing this feature requires adjusting navigation, layout, application state or related architecture, make those changes logically so the final application behaves as though this feature never existed.

Before final delivery, search the full codebase for any leftover reference to "AI Integration" (strings, routes, component names, config keys, dead code) and confirm none remain.

---

# 23. Functional Application

Every function, feature, and interactive element described in this document must actually work end-to-end — see the Completion Standard in Section 0, which this section enforces.

Do not create:

* fake buttons
* decorative settings that do nothing
* placeholder functionality
* disconnected UI
* simulated system integrations

The final application should behave like a real Windows desktop product.

---

# 24. Privacy & Data Handling

Because this application performs system-wide keystroke capture, its privacy boundary must be explicit and documented:

* Keystrokes should only be intercepted/processed for transliteration purposes while Bengali mode is active; the app must not log, store, or transmit raw keystroke content beyond what's needed to run the current transliteration.
* State clearly what (if anything) is sent to the online transliteration service, and confirm no keystroke data is retained beyond the active session/cache needed for suggestions.
* No telemetry, analytics, or keystroke logging should be added unless explicitly requested separately from this spec.
* Only the current word/phrase actively being typed should be sent to the online transliteration service — never the full typing buffer or unrelated on-screen content.
* Decide and state explicitly whether the system-wide typing feature should skip processing input inside recognized password/secure fields. If reliably detecting this is out of scope for this build, say so explicitly rather than leaving it unaddressed.
