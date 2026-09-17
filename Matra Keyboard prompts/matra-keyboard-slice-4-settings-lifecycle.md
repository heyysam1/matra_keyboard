# Matra Keyboard — SLICE 4 of 6: Settings, Shortcuts, Startup, Sounds, Logo & Lifecycle

Paste `matra-keyboard-00-CORE-CONTEXT.md` immediately before this file in the same message/session.
This slice covers Sections 13, 14, 15, 16, 19, 24A of the master spec only. Build only what's below, then
stop and report against Section 25's per-section checklist (Understand → Inspect design → Plan →
Build → Run → Verify functionality → Verify appearance → Review code → only then would you move on —
but do not move on; wait for confirmation before Slice 5.

---

# 13. Settings

Build the Settings section according to the supplied design.

Include the relevant configuration options represented by the design, such as:

* language switching
* keyboard shortcuts
* Auto Startup
* keyboard sounds
* sound selection
* sound volume
* appearance/display
* logo selection
* other relevant application settings

Interactive controls must actually work.

Do not create fake settings.

Specify where settings are persisted (e.g., a local config file or `electron-store` in the app's user-data directory) and confirm settings survive an app reinstall vs. an app update (state the intended behavior for each case).

If the settings or dictionary file is missing, unreadable, or corrupted at launch, the app must fall back to safe defaults and continue starting normally — never crash or fail to launch because of a bad local data file.

Provide a simple way to back up/export and restore/import the user's settings and dictionary together (even if the supplied design doesn't explicitly show this) — this protects the user's customization from being lost on reinstall or a move to a new PC, and is cheap to include now versus after users start losing data.

Show the application's version number somewhere reachable (e.g., in Settings or an About area), so future support requests can reference exactly which build is installed.

---

# 14. Keyboard Shortcuts

Support configurable keyboard shortcuts where represented by the design.

Users should be able to configure relevant shortcuts and use them system-wide where appropriate.

Shortcut settings should persist between application restarts.

Define behavior for shortcut conflicts (e.g., a user assigns a shortcut already used by Windows or another app) — the app should detect and warn, not silently fail.

---

# 15. Auto Startup

Implement real Windows Auto Startup functionality.

When enabled, Matra Keyboard should actually register itself with Windows and start automatically with Windows.

This must not be only a visual toggle.

Confirm whether registration will use the standard per-user Registry Run key (no admin rights required) — this is the recommended default approach unless the design or system-wide typing implementation (Section 3) requires otherwise.

Install the application per-user (not machine-wide/all-users) by default, so no administrator rights are required at install time either — unless the Section 3 typing approach itself requires elevation, in which case state that clearly to the user rather than requiring it silently. Also confirm that launching via Auto Startup opens directly to the tray (recommended) rather than opening the main window on every boot.

---

# 16. Keyboard Sounds

Implement typing sounds.

The application should support:

* sound on/off
* sound selection
* volume control
* actual sound playback during typing

The default volume should be comfortable and subtle.

Specify where sound assets come from (bundled with the app vs. user-added) and confirm this against the design's sound selection options.

---

# 19. Logo System

Matra Keyboard has three logos:

1. Orange logo — primary/default logo
2. Black logo
3. White logo

The **orange logo must be the default**.

Add a logo selection section inside Settings.

Users should be able to select any of the three logos.

The selected logo must be saved persistently.

After restarting the application, the selected logo should remain active.

The selected logo should be used consistently throughout the application wherever the application logo appears — explicitly including: app window icon, system tray icon, taskbar icon, installer icon, and any in-app header/about-page logo. Confirm all logo touchpoints against the design before implementation, and supply/generate each logo in the sizes Windows requires (e.g., multi-resolution `.ico` for app/taskbar icons).

---

# 24A. Update Mechanism, Uninstall Behavior & Support Logging

Confirm whether an in-app auto-update mechanism (e.g. `electron-updater`) is in scope for this build. If it is not, state that explicitly so it isn't silently assumed — without one, every future fix or feature would require a full manual reinstall by each user.

Uninstalling the application must fully clean up what it registered: remove the Auto Startup registry entry and any native hook/service registered per Section 3. Confirm whether user data (settings, dictionary) is removed on uninstall or preserved for a future reinstall, and make that behavior explicit rather than incidental.

Add minimal local diagnostic logging (e.g. via `electron-log`), written to a local file only, to support troubleshooting. This is separate from, and must not become, telemetry or keystroke logging — see Section 24.