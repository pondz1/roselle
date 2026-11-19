# Product

## Register

product

## Users

Individuals tracking their menstrual cycle, daily symptoms, moods, and fertility windows on a smartphone or desktop browser. They typically open the app briefly in natural morning light or warm evening light before sleep, wanting an immediate, calm answer to "where am I in my cycle today?" and a five-second tap-to-log workflow without distractions or account friction.

## Product Purpose

Provide Roselle, a private, local-first menstrual cycle tracker PWA (Thai default with instant English toggle) that delivers accurate cycle predictions, ovulation and fertile window estimates, effortless daily health logging, and clear historical trends while keeping all personal data strictly on-device and architecturally ready for optional cloud sync later.

## Brand Personality

Warm, reassuring, and clear (3-word personality: Warm, Private, Effortless). The voice is gentle, supportive, and plainspoken in both Thai and English, avoiding cold clinical jargon while remaining medically honest that predictions are estimates.

## Anti-references

- Cold clinical hospital portals with stark `#ffffff` backgrounds, `#000000` text, and sterile blue-gray grids.
- Bloated social/content-feed period apps cluttered with paywalls, pop-up ads, noisy articles, and cartoon clutter.
- Generic AI SaaS dashboards with dark neon themes, glassmorphism cards, gradient text, side-stripe accent borders, and identical card grids.
- Overly childish or garish hot-pink interfaces that compromise legibility and calm.

## Design Principles

1. **Five-second daily check-in**: Core actions (checking today's cycle status, starting or ending a period, logging flow or symptoms) require minimal taps and zero typing.
2. **Earned familiarity over novelty**: Use predictable mobile navigation (4-tab bottom bar, monthly calendar grid, bottom sheet editor) so the tool disappears into the user's daily habit.
3. **Calm semantic clarity**: Distinguish logged period days, predicted period days, fertile windows, and ovulation days through both hue and visual treatment (solid fill, dashed outline, distinct sage-teal ring) rather than shouting with saturated fills everywhere.
4. **Private by default**: Local-first storage works immediately with zero login wall, transparent backup controls, and calm, non-alarmist copy.
5. **Honest states everywhere**: Never fabricate predictions when no history exists; guide the user cleanly through empty states, late-period states, and loading skeletons.

## Accessibility & Inclusion

- Target WCAG 2.1 AA contrast ratios across all text, chips, and calendar day markers.
- Pair color coding with shape and pattern cues (solid circle for logged period, dashed border for predicted period, dot/ring markers for ovulation and logged symptoms) so status never relies on color alone.
- Maintain at least 44x44px touch targets for calendar cells, log chips, and bottom navigation items.
- Respect `prefers-reduced-motion` across all transitions and ring animations.
- Support both Thai (`th`) and English (`en`) natively with proper Thai line height and `tabular-nums` alignment for cycle counts and dates.
