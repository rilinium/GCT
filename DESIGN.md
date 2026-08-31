---
name: Global Contract Tracker
description: A signals-intelligence console for watching government contract money move across a live 3D globe.
colors:
  signal-green: "#00ff88"
  void-navy: "rgb(0, 4, 18)"
  void-navy-deep: "rgb(0, 2, 12)"
  alert-red: "#ff4444"
  amber-flag: "#ffcc00"
  recon-cyan: "#00aaff"
  intel-violet: "#c060ff"
  mint-readout: "#aaffcc"
typography:
  display:
    fontFamily: "'Orbitron', monospace"
    fontWeight: 900
    letterSpacing: "2px"
  label:
    fontFamily: "'Orbitron', monospace"
    fontWeight: 700
    letterSpacing: "2px"
  body:
    fontFamily: "'Share Tech Mono', 'Courier New', monospace"
    fontWeight: 400
    letterSpacing: "normal"
rounded:
  flat: "0px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "rgba(0,255,136,.06)"
    textColor: "{colors.signal-green}"
    typography: "{typography.label}"
    rounded: "{rounded.flat}"
    padding: "5px 13px"
  button-primary-hover:
    backgroundColor: "rgba(0,255,136,.15)"
    textColor: "{colors.signal-green}"
  badge-live:
    backgroundColor: "rgba(255,68,68,.08)"
    textColor: "{colors.alert-red}"
    rounded: "{rounded.flat}"
    padding: "3px 10px"
  stat-card:
    backgroundColor: "rgba(0,4,18,.9)"
    textColor: "{colors.signal-green}"
    rounded: "{rounded.flat}"
    padding: "8px 16px"
  contract-card:
    backgroundColor: "transparent"
    textColor: "{colors.mint-readout}"
    rounded: "{rounded.flat}"
    padding: "9px 14px"
  input-field:
    backgroundColor: "rgba(255,255,255,.04)"
    textColor: "{colors.mint-readout}"
    rounded: "{rounded.flat}"
    padding: "6px 10px"
---

# Design System: Global Contract Tracker

## Overview

**Creative North Star: "The Signals Intelligence Console"**

This is not a dashboard for browsing data — it's a listening post. The interface reads as a covert monitoring console watching contract money move across the globe in real time: a black void background, a glowing green cursor-language, hairline instrument borders, and a persistent CRT scanline texture that never lets the surface feel soft or consumer-grade. The mood is covert, charged, and precise — every readout looks calibrated, every panel looks like it's actively receiving a live feed, and nothing about it should read as a friendly SaaS analytics dashboard. There is no ornament that isn't also a signal.

The globe itself is the sensor feed; every UI panel (header, stat cards, sidebar, detail panel) is a floating overlay of glass and hairline borders that never competes with it for visual weight. Glow is functional, not decorative: dim and flat means "at rest," a lit glow means "this is live, focused, or drawing your attention right now." Corners are sharp everywhere except the handful of elements that are literally round objects (status dots, a spinner) — nothing is rounded for softness's sake.

**Key Characteristics:**
- Near-black void background (`rgb(0,4,18)`) with a single reserved signal-green accent (`#00ff88`)
- Persistent CRT scanline overlay across the full viewport (toggleable, not decoration you'd notice being asked for)
- Orbitron for display/label chrome, Share Tech Mono for body and data — both monospace-derived, console-native
- Glow (colored box-shadow/text-shadow) carries meaning; there are no neutral drop shadows anywhere in the system
- Hard rectilinear geometry everywhere except literal circles (live-indicator dots, the loading spinner)
- A reserved secondary palette (red / amber / cyan / violet) exists strictly for semantic categories — never used decoratively, never substituted for the primary accent

## Colors

The palette is a near-black void carrying one disciplined signal color, plus a small reserved set of categorical hues used only for their assigned meaning.

### Primary
- **Signal Green** (`#00ff88`): The one accent. Reserved for the "this is live / this is primary" role — header title glow, live stat values, focused inputs, the primary button family, the globe's own contract-point glow. Its rarity is what makes it read as a signal rather than a color choice.

### Secondary (semantic reserve — not decorative)
- **Alert Red** (`#ff4444` / `#ff4455`): Live indicator, danger/destructive actions (admin delete), the "Contract" detail-type badge, close/dismiss hover states.
- **Amber Flag** (`#ffcc00` / `#ffc800`): Keyword-type search matches, cautionary states.
- **Recon Cyan** (`#00aaff` / `#00b4ff` / `#00d4ff`): Agency filter control, location-type search matches, the "Agency Hub" detail-type badge.
- **Intel Violet** (`#c060ff` / `#cc44ff`): Agency-type search matches, admin metadata tags.

### Neutral
- **Void Navy** (`rgb(0, 4, 18)`, exposed as `--bg-base`): The base panel/background tone; nearly all glass panels are this value at high opacity with backdrop blur.
- **Void Navy Deep** (`rgb(0, 2, 12)`, exposed as `--bg-deep`): A darker layer used for panel gradients and deep-recessed surfaces (detail panel, admin modal).
- **Mint Readout** (`#aaffcc`): Body/data text color inside inputs and tooltips — a desaturated echo of the signal green that reads as "readout text," not "call to action."

### Named Rules
**The One Signal Rule.** Signal Green is the only color that means "primary / live / focus." The reserved secondary hues (red, amber, cyan, violet) are categorical labels, not alternate accents — a component never borrows one of them to mean "important," only to mean its one assigned category.

**The Light-Mode Inversion.** A `body.theme-light` variant exists: it swaps `--bg-base`/`--bg-deep` to near-white values and remaps text neutrals to dark navy, while every accent and semantic hue stays exactly the same. Theming inverts the void, never the signal palette.

## Typography

**Display/Label Font:** Orbitron (with monospace fallback)
**Body/Data Font:** Share Tech Mono (with 'Courier New', monospace fallback)

**Character:** Orbitron is the console's chrome voice — geometric, wide, slightly futuristic, used only for short uppercase labels and headline numerals. Share Tech Mono is the instrument's data voice — narrow, typewriter-flat, used for everything read as live text (body copy, inputs, tooltips, list rows). The pairing keeps "labels the machine prints" visually distinct from "data the machine reports."

### Hierarchy
- **Display** (Orbitron, 900, 11–12px, uppercase, 2px letter-spacing): Header title (`#header-top h1`), panel titles (`#sidebar-header h2`, `#admin-panel h2`) — always paired with a signal-green text-shadow glow.
- **Headline / Stat** (Orbitron, 700, 16px): Stat-bar values (`.stat-value`) — the number the console wants you to read first, with a slow flicker animation and glow.
- **Label** (Orbitron, 900, 7–10px, uppercase, 1–3px letter-spacing): Section labels, badge text, button text (`.header-btn`, `.stat-label`, `.admin-section-title`).
- **Body** (Share Tech Mono, 400, 9–11px): List rows, tooltip values, input text, detail-panel prose.

### Named Rules
**The Uppercase Chrome Rule.** Any Orbitron text in the interface is UI chrome (labels, titles, badges), always uppercase, always letter-spaced. Orbitron never appears as sentence-case prose; that job belongs to Share Tech Mono.

## Layout

The globe is a full-viewport canvas layer (`#cesiumContainer`, `position: absolute; inset: 0`); every other element is a floating overlay panel on top of it — nothing pushes the globe into a constrained region. Desktop: a fixed 320px sidebar on the right, a top header band with gradient fade-to-transparent, floating stat cards below it, and a bottom-anchored detail panel (`right: 320px` to avoid the sidebar) that slides up on selection.

Mobile (≤640px) restructures rather than just shrinking: the sidebar becomes a fixed bottom sheet at 38vh (collapsible to a 36px drag handle) that floats *over* the still-full-screen globe rather than sharing space with it, the footer disappears, and the detail panel goes full width. Safe-area insets (`env(safe-area-inset-top/bottom)`) are respected throughout for notch/home-indicator clearance.

Spacing is tight and console-dense: most internal padding sits in the 6–16px range, gaps between controls 5–10px. There is no generous whitespace anywhere — density signals "instrument," not "editorial."

## Elevation & Depth

This system uses **glow, not shadow, as its depth and state language**. Neutral gray drop-shadows do not appear anywhere; instead, panels sit on translucent glass (`backdrop-filter: blur()`, 14–20px) over the void background, separated from each other by hairline accent-tinted borders (1px, 10–35% opacity) rather than elevation. Colored box-shadow "glow" is applied purely as a state signal: a resting stat card pulses a faint ambient glow to read as "receiving," a focused input snaps to a tighter, brighter glow, an active/hover button gains glow to confirm the interaction registered. The brighter and tighter the glow, the more "live" that element currently is.

### Shadow Vocabulary
- **Ambient pulse** (`box-shadow: 0 0 6px rgba(var(--accent-rgb),.3), inset 0 0 6px rgba(var(--accent-rgb),.05)` animating to `0 0 18px …,.55`): Resting-state cards and panels — a slow 4s breathing glow that says "this panel is alive."
- **Focus glow** (`box-shadow: 0 0 10–12px rgba(var(--accent-rgb),.2–.3)`): Inputs and interactive controls on focus/hover — sharper and more immediate than ambient pulse.
- **Alert glow** (`box-shadow: 0 0 6–12px <semantic-color>`): Live-indicator dot, danger buttons, category badges — glow rendered in the element's own semantic hue, never green.
- **Panel-lift glow** (`box-shadow: 0 -8px 40px rgba(0,0,0,.7)` or accent-tinted equivalent): Bottom sheets and slide-up panels (mobile sidebar, detail panel) — the one place a neutral dark shadow is used, to separate a panel physically lifting off the base layer.

### Named Rules
**The Glow-Not-Shadow Rule.** Depth and emphasis are conveyed by colored glow intensity, never by a neutral gray drop-shadow (the one exception is the physical "lift" shadow under sheets/panels that slide up over content). If something needs to look important, it gets brighter — it does not get a shadow.

## Shapes

**The Sharp-Edge Rule (hard invariant).** A global rule forces `border-radius: 0 !important` on every element and pseudo-element in the system. The only exceptions, carved out explicitly, are literal round objects: the live-indicator dot (`.live-dot`), legend dots (`.leg-dot`), the range-slider thumb, and the loading spinner. Any component's CSS may still *declare* a small radius (2–6px) as a legacy value, but it renders flat regardless — corners are never softened for comfort, only true circles are allowed to be round.

A secondary signature form is the **HUD corner bracket**: small L-shaped accent-colored strokes (`::before`/`::after`, 6×6px, 1px border on two sides) placed at opposing corners of a panel (seen on `.stat-card`), pulsing independently of the panel's own glow. It's a viewfinder/targeting-reticle motif, used sparingly on cards that represent a live-reading instrument, not on every container.

## Components

Every interactive surface reads as instrumented hardware: thin borders, low-opacity fills that only intensify on interaction, uppercase mono labels, and glow instead of shadow. Nothing has a soft, high-contrast "card" feel — surfaces sit at 4–9% background opacity so the void behind them stays visible.

### Buttons
- **Shape:** Flat rectangle (0px, forced by the Sharp-Edge Rule) with a 1px accent-tinted border.
- **Primary** (`.header-btn`): `rgba(accent,.06)` background, accent-colored uppercase Orbitron/Share Tech Mono label, 2px letter-spacing, 5px 13px padding.
- **Hover:** Background steps to `rgba(accent,.15)` and gains a `0 0 10px` accent glow — no scale or transform, the feedback is purely luminance.
- **Danger variant** (`#spin-btn.paused`, `.admin-btn.danger`): Same shape/border language, recolored into Alert Red instead of Signal Green — the category swap is the only difference.

### Badges / Pills
- **Style:** Flat rectangle (declared `border-radius` overridden to 0, even on the nominally "pill"-shaped `.live-pill`), low-opacity tinted background + matching border + matching text, all in one reserved semantic hue.
- **State:** Category is encoded entirely by color swap (location = cyan, keyword = amber, agency = violet, contract-type = red, agency-hub-type = cyan) — shape and typography never change between categories.

### Cards / Containers
- **Corner Style:** Flat (0px).
- **Background:** `rgba(void-navy, .9)` for stat cards; near-transparent with a bottom hairline divider for contract-list rows; a top-to-bottom void gradient with `backdrop-filter: blur(18px)` for the sidebar.
- **Shadow Strategy:** Ambient pulse glow (see Elevation & Depth) on stat cards; a top edge "sweep" gradient line animates across the sidebar's top border as a persistent live-feed cue.
- **Border:** 1px, accent or semantic color at 10–35% opacity.
- **Internal Padding:** 8–16px depending on density (stat card 8px 16px, contract row 9px 14px, admin panel 22px 20px).

### Inputs / Fields
- **Style:** `rgba(255,255,255,.04)` background, 1px accent-tinted border, flat corners, Mint Readout text.
- **Focus:** Border shifts to full-opacity accent and a tight `0 0 10–12px` accent glow appears — the same "focus glow" state as buttons.
- **Select controls** (agency filter): recolored into Recon Cyan instead of Signal Green to mark it as a data-scope control rather than a primary action.

### Navigation / Header
- Fixed top band with a gradient fade to transparent (`rgba(0,0,0,.92)` → transparent) so the globe reads through underneath. Title uses Display type with a slow 8s glitch animation and constant signal-green text-shadow glow. Header buttons and the data-source picker sit right-aligned; collapses to a shortened title and denser button sizing at ≤960px / ≤640px.

### Detail Panel & Admin Modal (signature components)
Slide-up glass panels (`cubic-bezier(.22,.68,0,1.1)` transform, giving a slight overshoot "snap into place" feel) anchored to the bottom or center of the viewport, `backdrop-filter: blur(20px)` over `void-navy-deep`, with a colored type badge (red = Contract, cyan = Agency Hub) identifying what kind of record is being inspected. These are the system's only panels that intentionally interrupt — everything else stays a passive overlay.

## Do's and Don'ts

### Do:
- **Do** keep Signal Green reserved for "primary / live / focused" — if a new element needs emphasis and isn't literally live data, reach for glow intensity or letter-spacing before reaching for a new color.
- **Do** use glow (colored box-shadow / text-shadow) to signal state changes; scale it up for focus/hover, down for rest.
- **Do** keep corners flat everywhere; a literal circle is only correct for a status dot, a slider thumb, or a spinner.
- **Do** assign new categorical data types to a hue from the existing reserved set (red/amber/cyan/violet) rather than inventing a new one, unless a genuinely new category is needed.
- **Do** keep panel backgrounds translucent (4–9% for surfaces, up to ~98% for slide-up sheets) so the globe stays visible through the UI chrome wherever possible.

### Don't:
- **Don't** round a corner for comfort or softness — the Sharp-Edge Rule has no "friendly" exception.
- **Don't** add a neutral gray drop-shadow for elevation; depth comes from blur + glow, not shadow, except the physical lift-shadow under a sheet that's sliding up.
- **Don't** use Orbitron for sentence-case prose, and don't use Share Tech Mono for short uppercase chrome labels — the two fonts mark two different kinds of text.
- **Don't** let this drift toward a soft, rounded, pastel consumer-SaaS dashboard look (Stripe/Notion-style) — the console-instrument identity is the whole point.
- **Don't** borrow a semantic hue (red/amber/cyan/violet) to add visual variety to something that isn't that category — every non-green color on screen is a label, not a decoration.
