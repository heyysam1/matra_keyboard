# Matra Keyboard — SLICE 3 of 6: Modes, Layout & Tray

Paste `matra-keyboard-00-CORE-CONTEXT.md` immediately before this file in the same message/session.
This slice covers Sections 8, 9, 12 of the master spec only. Build only what's below, then
stop and report against Section 25's per-section checklist (Understand → Inspect design → Plan →
Build → Run → Verify functionality → Verify appearance → Review code → only then would you move on —
but do not move on; wait for confirmation before Slice 4.

---

# 8. Bengali / English Modes

The application should support:

* Bengali mode
* English mode

Users should be able to switch between them through the application's controls and supported keyboard shortcuts.

---

# 9. Keyboard Layout

Include the keyboard layout functionality represented by the design.

Confirm exactly which layout(s) are required to match the design (e.g., phonetic/Avro-style, Probhat, National/Bijoy-classic, or a custom layout) before implementation — do not assume a layout that isn't explicitly shown or named in the design or resources.

Layout selection should be functional and connected to the actual keyboard/input system.

---

# 12. System Tray

Matra Keyboard should run as a Windows desktop utility with a system tray.

The tray interface should follow the supplied design.

It should provide access to relevant functions such as:

* Bengali / English
* Layout
* Open App
* Dictionary
* Sound
* Settings

Tray actions must control the actual application functionality.