# Matra Keyboard — SLICE 5 of 6: Dictionary, Bijoy/Unicode, System Care & Display/Appearance

Paste `matra-keyboard-00-CORE-CONTEXT.md` immediately before this file in the same message/session.
This slice covers Sections 10, 11, 17, 18 of the master spec only. Build only what's below, then
stop and report against Section 25's per-section checklist (Understand → Inspect design → Plan →
Build → Run → Verify functionality → Verify appearance → Review code → only then would you move on —
but do not move on; wait for confirmation before Slice 6.

---

# 10. Dictionary

Include a Dictionary section.

Users should be able to manage custom Bengali vocabulary according to the application's design (add, edit, delete entries at minimum, matching whatever the design shows).

Specify the storage format and location (e.g., local JSON/SQLite file in the app's user-data directory) and whether import/export is required — confirm against the design; do not add import/export if the design doesn't show it.

The dictionary should integrate with the typing system where appropriate (custom entries should appear as/boost suggestion candidates).

---

# 11. Bijoy / Unicode

Include the application's Bijoy and Unicode functionality.

Confirm the exact scope from the design: typically this means converting text between the legacy Bijoy (ANSI, non-Unicode Bengali font encoding) and standard Unicode Bengali. Provide the appropriate conversion tools and UI represented by the design.

These should be real working features, not placeholders.

---

# 17. System Care

Implement the **System Care** section shown in the design.

Follow the functionality represented by the supplied design exactly — before implementation, list out precisely what actions/checks this section performs according to the design (e.g., checking input service health, clearing typing cache, verifying keyboard driver/hook status), since "System Care" is not a self-explanatory feature name.

System Care should be a real functional section, not merely a visual page.

Do not invent unrelated system-cleaning features (e.g., do not add generic Windows junk-file/registry cleaning — this section is scoped only to Matra Keyboard's own health/functionality, not general PC optimization, unless the design explicitly shows otherwise).

---

# 18. Display / Appearance

Implement the Display/Appearance functionality represented in the design.

Follow the supplied design for:

* themes
* appearance
* fonts
* display preferences
* supported visual customization

Only include functionality that belongs to Matra Keyboard.

Name and bundle a specific Bengali Unicode font (confirm the one shown in the design, e.g. via its CSS) that correctly renders Bengali conjuncts (যুক্তাক্ষর) — do not rely on whatever default Bengali font happens to be installed on the user's system, since rendering quality varies widely. Confirm the font's license permits bundling and redistribution inside a commercial desktop app.

Confirm dark/light theming (if shown in the design) and icon crispness hold up across the *entire* application — not just the suggestion popover (already covered in Section 7) — at Windows display-scaling levels from 100% to 200%.