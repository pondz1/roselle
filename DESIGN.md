---
name: PinkBird-style Period Tracker
description: Warm, private, local-first mobile PWA for menstrual cycle tracking, ovulation predictions, and quick daily symptom logging.
colors:
  blush-canvas: "oklch(0.985 0.008 15)"
  warm-surface: "oklch(0.996 0.004 15)"
  tinted-subtle: "oklch(0.962 0.013 15)"
  rose-hairline: "oklch(0.912 0.015 15)"
  ink-primary: "oklch(0.24 0.022 15)"
  ink-secondary: "oklch(0.47 0.022 15)"
  ink-muted: "oklch(0.60 0.018 15)"
  coral-rose: "oklch(0.61 0.175 12)"
  coral-rose-hover: "oklch(0.55 0.18 12)"
  coral-rose-soft: "oklch(0.945 0.038 12)"
  coral-rose-ink: "oklch(0.45 0.155 12)"
  predicted-blush: "oklch(0.935 0.042 12)"
  fertile-sage: "oklch(0.54 0.115 168)"
  fertile-sage-soft: "oklch(0.935 0.034 168)"
  fertile-sage-ink: "oklch(0.39 0.095 168)"
  amber-late: "oklch(0.64 0.14 68)"
  amber-late-soft: "oklch(0.95 0.04 75)"
  danger-ink: "oklch(0.52 0.18 22)"
typography:
  display:
    fontFamily: "\"Noto Sans Thai\", \"Inter\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "\"Noto Sans Thai\", \"Inter\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "\"Noto Sans Thai\", \"Inter\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "\"Noto Sans Thai\", \"Inter\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "\"Noto Sans Thai\", \"Inter\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.35
rounded:
  sm: "8px"
  md: "14px"
  lg: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.coral-rose}"
    textColor: "{colors.warm-surface}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.coral-rose-hover}"
    textColor: "{colors.warm-surface}"
  button-secondary:
    backgroundColor: "{colors.coral-rose-soft}"
    textColor: "{colors.coral-rose-ink}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  chip-default:
    backgroundColor: "{colors.tinted-subtle}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  chip-selected:
    backgroundColor: "{colors.coral-rose-soft}"
    textColor: "{colors.coral-rose-ink}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  bottom-nav:
    backgroundColor: "{colors.warm-surface}"
    textColor: "{colors.ink-muted}"
    height: "68px"
---

# Design System: PinkBird-style Period Tracker

## 1. Overview

**Creative North Star: "The Morning Notebook"**

This interface is a calm, warm, tactile personal cycle companion designed for quick daily check-ins on a phone screen. Inspired by PinkBird's approachable warmth and clarity, it avoids both cold clinical portals and bloated content-feed apps. On mobile devices it runs full-bleed; on wider desktop viewports it centers within a clean 430px phone frame resting over a softly tinted blush backdrop.

Surfaces rely on quiet tonal shifts, hairline rose dividers, and intentional whitespace rhythm rather than wrapping every element in boxes. Motion stays crisp and informative (150 to 220ms exponential ease-out, zero bounce, zero decorative page-load choreography) and respects `prefers-reduced-motion`.

**Key Characteristics:**
- Warm blush-tinted alabaster light theme tuned for natural morning light and warm evening bedrooms.
- Clear semantic separation between logged period, predicted period, fertile window, and ovulation day using both color and visual pattern.
- Single cohesive Thai/Latin sans-serif system with tabular numbers for dates, countdowns, and cycle trends.
- Mobile-first bottom sheet logging and inline editing instead of intrusive centered modals.

## 2. Colors

A restrained warm-rose neutral foundation paired with deliberate semantic accents for cycle phases. Pure `#ffffff` and `#000000` are never used; every neutral is subtly tinted toward hue 15 in OKLCH.

### Primary
- **Coral Rose** (`coral-rose`): Primary actions (Start/End Period button, Save Log CTA), logged period day fills, and active cycle ring segments.
- **Coral Rose Soft** (`coral-rose-soft`) and **Coral Rose Ink** (`coral-rose-ink`): Selected filter chips, secondary rose action buttons, and soft active indicators.
- **Predicted Blush** (`predicted-blush`): Subtle background tint paired with a 1.5px dashed `coral-rose` border for predicted upcoming period days.

### Secondary
- **Fertile Sage** (`fertile-sage`), **Fertile Sage Soft** (`fertile-sage-soft`), and **Fertile Sage Ink** (`fertile-sage-ink`): Dedicated to fertility semantics (fertile window fills, solid ovulation day ring, and high/medium conception indicators) so fertility stands unmistakably apart from menstruation.

### Tertiary
- **Amber Late** (`amber-late`) and **Amber Late Soft** (`amber-late-soft`): Calm, non-alarmist indicator used exclusively when a period is past its predicted start date.
- **Danger Ink** (`danger-ink`): Destructive confirmation actions such as clearing all local data.

### Neutral
- **Blush Canvas** (`blush-canvas`): Base app canvas and desktop ambient surround.
- **Warm Surface** (`warm-surface`): Primary reading plane, calendar surface, bottom sheet, and bottom navigation bar.
- **Tinted Subtle** (`tinted-subtle`): Secondary control fills, unselected chips, skeleton placeholders, and grouped setting rows.
- **Rose Hairline** (`rose-hairline`): 1px structural dividers and subtle borders.
- **Ink Primary** (`ink-primary`), **Ink Secondary** (`ink-secondary`), and **Ink Muted** (`ink-muted`): Three-step text hierarchy calibrated for WCAG AA contrast.

### Named Rules
**The Quiet Canvas Rule.** Saturated colors belong strictly to active primary CTAs and cycle phase indicators. Inactive states, navigation chrome, and body layouts remain in tinted warm neutrals.

**The Dual-Cue Phase Rule.** Never rely on color hue alone to distinguish cycle phases. Logged periods use solid fills, predicted periods use dashed outlines, ovulation uses a ring plus center/bottom dot, and logged daily symptoms show a distinct micro-dot beneath the date number.

## 3. Typography

**Display & Body Font:** `"Noto Sans Thai", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif`

**Character:** One clean, friendly humanist sans-serif family handles both Thai and English with generous Thai diacritic clearance, consistent stroke weight, and zero display-font ornament in labels or buttons.

### Hierarchy
- **Display** (700, 2rem, line-height 1.2): Primary countdown number or active period day inside the Today cycle ring.
- **Headline** (600, 1.375rem, line-height 1.3): Screen titles, month headings in Calendar, and onboarding step prompts.
- **Title** (600, 1.0625rem, line-height 1.4): Section headers, bottom sheet titles, and key insight metric values.
- **Body** (400, 0.9375rem, line-height 1.6, max 65 to 75ch): Explanations, daily notes, empty-state guidance, and settings descriptions.
- **Label** (500, 0.8125rem, line-height 1.35): Chips, calendar weekday headers, navigation labels, and metadata badges.

### Named Rules
**The Tabular Numbers Rule.** Apply `font-variant-numeric: tabular-nums` to every countdown, cycle day number, calendar grid date, chart axis, and cycle history duration so numbers align cleanly without jitter.

## 4. Elevation

Tonal layering and 1px hairline borders (`rose-hairline`) define structure by default. Shadows are absent on static content surfaces and appear only on floating layers that detach from the page (the daily log bottom sheet and the sticky bottom navigation bar).

### Shadow Vocabulary
- **Bottom Sheet Lift** (`0 -8px 30px oklch(0.24 0.03 15 / 0.10)`): Applied only when the daily log bottom sheet or confirmation drawer rises over the page.
- **Bottom Nav Edge** (`0 -1px 0 oklch(0.912 0.015 15)`): Crisp hairline top separation for the fixed tab bar.

### Named Rules
**The Flat-By-Default Rule.** Content panels, metric rows, and list items never use drop shadows. Depth is communicated by stepping between `blush-canvas`, `warm-surface`, and `tinted-subtle`.

## 5. Components

Tactile, pill-friendly mobile controls with generous touch targets (minimum 44x44px) and complete interactive states (default, hover, focus-visible with 2px `coral-rose` offset ring, active scale 0.98, disabled at 45% opacity).

### Buttons
- **Shape:** Full pill (`9999px`) for primary and secondary actions; softly rounded (`14px`) for inline segmented controls.
- **Primary:** `coral-rose` fill with `warm-surface` text, 12px 24px padding, transitions to `coral-rose-hover` over 180ms ease-out.
- **Secondary:** `coral-rose-soft` fill with `coral-rose-ink` text for secondary triggers such as editing today's log.
- **Ghost / Subtle:** Transparent fill with `ink-secondary` text, shifting to `tinted-subtle` on hover/active.

### Chips (Daily Log Selectors)
- **Style:** Pill radius (`9999px`), 8px 14px padding, minimum 40px tap height, 1px transparent border when unselected (`tinted-subtle` fill, `ink-primary` text).
- **State:** Selected chips switch to `coral-rose-soft` fill, `coral-rose-ink` text, and 1.5px solid `coral-rose` border for immediate visual confirmation.

### Containers and Dividers
- **Strategy:** Group related settings or cycle history rows on a single `warm-surface` sheet with 20px outer radius and internal 1px `rose-hairline` dividers rather than separate stacked cards. Never nest containers inside containers.

### Inputs and Fields
- **Style:** 14px radius, `tinted-subtle` fill, 1px `rose-hairline` stroke, 12px 14px padding, `ink-primary` text.
- **Focus:** Smooth transition to `warm-surface` background with a 2px `coral-rose` ring.

### Navigation
- **Bottom Tab Bar:** Fixed 4-tab bar (Today, Calendar, Insights, Settings), 68px height plus safe-area bottom inset, `warm-surface` background, `ink-muted` inactive icons/labels, `coral-rose` active state with a subtle top pill indicator.

### Cycle Ring (Signature Component)
- **Structure:** Clean 240px SVG circular progress dial on the Today screen showing current cycle progress arc in soft `tinted-subtle` track with `coral-rose` (period), `fertile-sage` (fertile/ovulation), or `amber-late` (late) active arc. Inside sits the primary status headline, Display-scale countdown/day number, current cycle day, and a concise conception chance badge.

## 6. Do's and Don'ts

### Do:
- **Do** use OKLCH tinted neutrals (`blush-canvas`, `warm-surface`, `tinted-subtle`) for all backgrounds and dividers.
- **Do** pair color with shape or pattern on every calendar day marker (solid fill, dashed outline, ovulation ring, symptom dot).
- **Do** provide complete interactive states (hover, focus-visible, active, disabled, skeleton loading, instructive empty state) on every interactive control.
- **Do** keep animations between 150ms and 220ms using exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Do** keep UI copy concise in both Thai and English with zero em-dashes and zero redundant headings.

### Don't:
- **Don't** use pure `#ffffff`, pure `#000000`, or cold clinical hospital blues and sterile gray grids.
- **Don't** use side-stripe borders (`border-left` or `border-right` greater than 1px as a colored accent bar).
- **Don't** use gradient text (`background-clip: text`), decorative glassmorphism, or dark neon SaaS styling.
- **Don't** wrap every section in identical rounded cards or nest cards inside cards.
- **Don't** default to centered popup modals for daily logging; use the mobile bottom sheet or inline controls.
- **Don't** use bounce or elastic easing curves or decorative page-load stagger choreography.
- **Don't** clutter the interface with social feeds, paywall banners, or cartoon/emoji chrome.
