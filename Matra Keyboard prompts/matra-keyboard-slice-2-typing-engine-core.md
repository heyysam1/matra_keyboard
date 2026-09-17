# Matra Keyboard — SLICE 2 of 6: Typing Engine Core

Paste `matra-keyboard-00-CORE-CONTEXT.md` immediately before this file in the same message/session.
This slice covers Sections 4, 5, 6, 7 of the master spec only. Build only what's below, then
stop and report against Section 25's per-section checklist (Understand → Inspect design → Plan →
Build → Run → Verify functionality → Verify appearance → Review code → only then would you move on —
but do not move on; wait for confirmation before Slice 3.

---

# 4. Bengali Phonetic Typing

The core feature is Bengali phonetic typing.

The typing engine should:

* accept English phonetic input
* convert it into Bengali
* provide Bengali word suggestions
* allow users to select candidates
* support continuous sentence typing
* support spaces and punctuation
* support backspace/editing
* work inside the application's typing interface
* support system-wide typing through Windows integration (see Section 3 constraint above)

The experience should feel natural and fast.

Define word-boundary rules explicitly: the suggestion popover should trigger and update per current word being typed, and commit on space, punctuation, Enter, or explicit selection — this must be specified in the implementation plan, not left to interpretation.

Also define, before implementation, two edge cases that materially affect correctness:

* **Digits:** decide and document whether number keys produce Bengali digits (১২৩...) or Latin digits (123) while in Bengali mode, and confirm number-key candidate selection in the popover only intercepts number keys while the popover is actually visible — normal digit typing must not break otherwise.
* **Mixed English content:** decide and document how proper nouns or English words typed while in Bengali mode are handled (e.g., an Avro-style convention such as capitalized-first-letter passthrough, or an explicit escape key), rather than leaving this undefined.

Target rough performance: online suggestions should appear within roughly 300ms of the debounce window under normal network conditions; the offline fallback should feel effectively instant.

The in-app typing interface and the system-wide typing path must be powered by the same underlying transliteration engine (the same code implementing Sections 4–6) — do not build two separate or divergent conversion implementations, since that would let the two typing experiences drift out of sync and double the surface area for bugs.

---

# 5. Online Transliteration

Use **Google Input Tools transliteration** as the primary online transliteration source.

Note: this is an unofficial/public endpoint, not an officially documented Google API. The implementer must:
* Confirm which endpoint/approach will be used.
* Design the integration so it fails gracefully and falls back to Section 6's offline engine if the endpoint changes, rate-limits, or becomes unavailable — this is not optional.
* Not require the end user to supply any API key for this feature.
* Abstract the transliteration call behind a single internal interface so the service can be patched or swapped without touching the rest of the app, and implement basic retry/backoff on failure before falling back to offline — don't fall back on the very first failed request.

The application should support:

* online transliteration
* multiple Bengali candidate results
* efficient request handling (debounced, not one request per keystroke)
* local caching where useful
* graceful handling when the online service is unavailable

---

# 6. Offline Transliteration

Provide an offline Bengali phonetic fallback.

The offline engine should follow a standard, well-established Bengali phonetic transliteration scheme (e.g., the Avro Phonetic ruleset) as its baseline, rather than a custom-invented rule set, so behavior is predictable and consistent with what Bengali typists already expect.

When the online transliteration service is unavailable, the application should still provide basic Bengali phonetic conversion locally.

The offline system should be part of the same typing experience — switching between online and offline must be automatic and invisible to the user, with no manual mode switch required.

Specify the source and approximate minimum size of the offline word list (a small hardcoded sample is not sufficient for daily use), and rank offline suggestions so common, everyday words surface before rare ones — an unranked or tiny offline dictionary will feel broken compared to the online engine even if it technically works.

---

# 7. Suggestion Popover

Implement the live Bengali suggestion popover shown in the supplied design.

It should appear naturally near the active typing/caret position.

The suggestion system should support:

* up to 5 candidates
* first candidate highlighted
* keyboard navigation
* number-key candidate selection
* Space/Enter to commit
* Arrow Up/Down navigation
* Backspace updates
* Escape closes the popover
* clicking outside closes the popover

### Important visual requirement

Measure the suggestion popover's actual width in the supplied design (from the HTML/CSS, not by estimation). The final suggestion popover should be approximately **20% narrower than that measured value**.

Keep the same visual language, hierarchy, typography, spacing style and overall appearance, but reduce its width by approximately 20% from the measured baseline.

Do not make it unnecessarily wide.

If reducing width by 20% causes candidate text to wrap or truncate awkwardly given real Bengali word lengths, adjust internal padding/font-size minimally to preserve readability — but do not exceed the 20% width reduction target without flagging the tradeoff.

The popover must position correctly near the caret across multi-monitor setups and different Windows display-scaling levels (100%–200%), and must reposition itself (e.g., flip above the caret, shift horizontally) when it would otherwise render off-screen or across a monitor edge.