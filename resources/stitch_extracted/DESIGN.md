---
name: Bengali Mica Input Interface
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#e0c0b1'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#a78b7d'
  outline-variant: '#584237'
  surface-tint: '#ffb690'
  primary: '#ffb690'
  on-primary: '#552100'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#9d4300'
  secondary: '#ffb77d'
  on-secondary: '#4d2600'
  secondary-container: '#d97707'
  on-secondary-container: '#432100'
  tertiary: '#b9c8de'
  on-tertiary: '#233143'
  tertiary-container: '#8d9cb1'
  on-tertiary-container: '#253445'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.875rem
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 0.625rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
  script-primary:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '500'
    lineHeight: 1.75rem
    letterSpacing: 0em
  script-secondary:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '400'
    lineHeight: 0.875rem
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.375rem
  margin: 0.75rem
  space-xs: 0.125rem
  space-sm: 0.25rem
  space-md: 0.5rem
  space-lg: 0.75rem
  space-xl: 1rem
---

## Brand & Style

The design system embodies an ultra-focused, whisper-quiet companion tool for desktop writing. It brings together the acoustic depth of dark slate glassmorphism with the fluid material elegance of macOS Vibrant / Windows 11 Mica. Designed for writers, journalists, developers, and bilingual professionals switching effortlessly between English and Bengali, the interface avoids the visual weight of conventional software keyboards. Instead, it hovers over the desktop as an ambient, translucent bar with quiet confidence.

The emotional signature is precise, grounded, and luminous. Interactions do not snap loudly; they glow with a warm ember light. The visual treatment avoids neon saturation in favor of a soft, incandescent amber that feels tactile, like a backlit precision instrument. Form follows language: Bengali typography requires vertical rhythm, open counters, and pristine vowel-sign (matra) clearance, demanding generous internal breathability despite compact desktop dimensions.

## Colors

The color architecture is built around an atmospheric dark slate glass substrate offset by a warm incandescent amber accent.

- **Primary Accent (`#F97316`)**: An amber-orange calibrated for micro-glows, selected prediction highlights, and active state indicators. It emits low-intensity luminescence without blinding night-adapted eyes.
- **Secondary Accent (`#D97706`)**: Deep honey amber for secondary hotkeys, phonetic rule hints, and pressed states.
- **Tertiary Neutral (`#94A3B8`)**: Slate-400 used for contextual auxiliary text, hotkey labels, and keyboard layout toggles.
- **Neutral Canvas (`#0F172A`)**: Base slate deep-black tone. Applied with opacity stops (from 80% down to 30%) across backdrops and layered containers.

### Surface Color Logic
- **Mica Canvas Base**: `rgba(15, 23, 42, 0.72)` combined with `backdrop-filter: blur(28px) saturate(180%)`.
- **Keycap Default Surface**: `rgba(255, 255, 255, 0.04)` over slate.
- **Keycap Hover Surface**: `rgba(255, 255, 255, 0.08)`.
- **Keycap Active / Pressed**: `rgba(249, 115, 22, 0.16)`.
- **Subtle Outline / Rim**: `rgba(255, 255, 255, 0.08)` on ambient edges; `rgba(249, 115, 22, 0.35)` on focused keys.

## Typography

Typography balances Latin glyphs with Bengali script rendering. When rendering Bengali glyphs, the font stack falls back to Hind Siliguri, Nirob, or Tiro Bangla.

- **Plus Jakarta Sans**: Handles primary UI labels, prediction strips, and mode selectors. Its open apertures mirror modern Bengali font mechanics.
- **Inter**: Handles secondary metadata, modifier glyphs (⌘, ⌥, ⇧, Ctrl), and shortcut helpers due to its neutral proportions and tabular alignment.
- **Vertical Metrics & Matra Compensation**: Bengali script contains ascenders (matra line decorations) and conjuncts that drop below the baseline (e.g., ৃ, ু, ূ, ক্ত). All line heights for candidate prediction tokens require 1.35x to 1.5x of the font size to prevent glyph clipping. Never set line-height to `1` or `tight` on Bengali text containers.
- **Keycap Dual Glyphs**: The primary Bengali glyph sits centered (`script-primary`), while the English transliteration or QWERTY anchor rests pinned in the top-right corner at reduced opacity (`script-secondary`).

## Layout & Spacing

The layout operates under a fixed micro-spacing discipline tailored to floating, overlay, and dock states. 

- **Floating Palette Frame**: The keyboard palette uses a 4px base grid rhythm (`space-xs` = 2px, `space-sm` = 4px, `space-md` = 8px, `space-lg` = 12px, `space-xl` = 16px).
- **Candidate Prediction Ribbon**: An anchored or floating pill stack directly above the keys or alongside the cursor. Candidate words are arranged with uniform `space-sm` gaps and padded horizontally with `space-lg`.
- **Keyboard Matrix**: Rows are arranged via CSS flex/grid using `gutter: 0.375rem` (6px) uniformly. Keycap inner padding conforms strictly to `space-sm` vertically and `space-md` horizontally, preserving maximum strike zone while preventing boundary overlap.
- **Density Adaptation**:
  - *Compact Dock Mode (Mini Toolbar)*: Height locked to 44px; displays live suggestion chips, active script toggle, and quick settings.
  - *Full Virtual Floating Board*: Width fixed between 620px to 740px. Height self-contained to maintain minimal vertical screen footprint.

## Elevation & Depth

Visual hierarchy uses Mica-inspired material layering rather than traditional drop shadows. Depth is communicated via frosted optical boundaries, subtle reflections, and background diffusion.

1. **Backdrop & Window Shell**:
   - Background: `rgba(15, 23, 42, 0.75)`
   - Filter: `backdrop-filter: blur(32px) saturate(190%)`
   - Outer Rim: 1px continuous solid border with color `rgba(255, 255, 255, 0.09)`.
   - Ambient Cast: `box-shadow: 0 20px 48px -10px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.05) inset`.

2. **Keycaps & Action Tiles**:
   - Default: `rgba(255, 255, 255, 0.035)` with an inner top hairline reflection `inset 0 1px 0 0 rgba(255, 255, 255, 0.07)`.
   - Hovered: `rgba(255, 255, 255, 0.07)` with a perimeter stroke of `rgba(255, 255, 255, 0.14)`.
   - Active (Pressed): `background: rgba(249, 115, 22, 0.12)`, stroke `rgba(249, 115, 22, 0.40)`, with a faint diffused floor glow `box-shadow: 0 0 12px rgba(249, 115, 22, 0.25)`.

3. **Floating Predictive Bar**:
   - Elevated one layer above the key matrix. Uses `rgba(30, 41, 59, 0.85)` with `backdrop-filter: blur(16px)` and a continuous separator line of `rgba(255, 255, 255, 0.06)` along the bottom edge.

## Shapes

The interface employs smooth squircle and rounded geometry to avoid visual friction while maintaining high hit-accuracy.

- **Window Container**: Curved with `rounded-xl` (1.5rem / 24px) to blend into macOS and Windows 11 desktop shells.
- **Keycaps**: Engineered with `rounded` (0.5rem / 8px). This allows crisp physical differentiation between closely spaced interactive targets.
- **Candidate Suggestion Chips & Modifiers**: Formed with full pills (`9999px`) or `rounded-lg` (1rem / 16px) to communicate immediate one-tap selection.
- **Stroke Weights**: All icon strokes (feather/lucide style) must be precisely 1.25px or 1.5px with rounded caps and joins, matching the visual weight of the Inter sub-labels.

## Components

### 1. Keycap (Standard & Modifier)
- **Geometry**: Height 42px standard, width variable by layout (1x, 1.25x, 1.5x, 2x, Spacebar 5.5x). Corner radius `0.5rem`.
- **Layout**: Relative container. Bengali main glyph set to `script-primary` centered. Transliteration Latin glyph set to `script-secondary` at top-right (opacity 0.45).
- **Feedback**: Immediate background shift to `rgba(249, 115, 22, 0.15)` on mousedown / keydown, with a subtle 0.98 scale transition over 80ms.

### 2. Intelligent Prediction Ribbon & Word Chips
- **Ribbon**: Sits at the top of the interface, 36px tall, flex layout with `space-sm` gap.
- **Word Chips**: Pill buttons featuring the Bengali candidate word in `body-md` (weight 500). The top-ranked prediction features a subtle amber underline bar (2px height, `#F97316`) or soft glowing ambient rim.
- **Transliteration Tag**: Displays numeric hotkey index (`1`, `2`, `3`) rendered in `label-sm` with slate-400 tint.

### 3. Floating Quick-Mode Toggle (Bijoy / Avro Phonetic / English)
- **Surface**: Segmented pill switch with frosted container background (`rgba(0, 0, 0, 0.25)`).
- **Active Item**: Elevated thumb pill using `rgba(255, 255, 255, 0.1)` with 1px top highlight. Text color transitions to pure white `#FFFFFF` with an active dot indicator in `#F97316`.

### 4. Input Assist & Conjunct (Juktakkhor) Flyout
- **Flyout Card**: Popover appearing on long-press or vowel assist. Translucent Mica pane (`rgba(15, 23, 42, 0.90)`).
- **Grid**: 4x2 matrix of possible conjunct completions (e.g., ক্ + ষ = ক্ষ), framed with minimal 1px dividing borders.

### 5. Settings & Status Indicators
- **Minimalist Icon Buttons**: Feather-style 16px icons with 1.25px stroke, no fill. Slate-400 default, changing to white with soft amber halo on hover.
- **Script Status Pin**: Micro indicator dot (6px) that pulses gently (`#F97316`) during real-time phonetic parsing.