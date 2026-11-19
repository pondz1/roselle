# PinkBird-style Period Tracker PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, local-first, bilingual (TH/EN) PinkBird-inspired menstrual cycle tracker PWA with cycle/ovulation prediction, quick daily logging, monthly calendar with multi-day period editing, insights trends, and sync-ready IndexedDB persistence.

**Architecture:** Pure TypeScript domain layer (`src/domain/`) computes period episodes, weighted cycle predictions, fertile/ovulation windows, and insights from local calendar dates (`YYYY-MM-DD`). A decoupled `CycleRepository` interface (`src/data/`) wraps Dexie IndexedDB with sync metadata (`updatedAt`, `deletedAt`, `syncStatus`) and strict JSON backup validation. React 19 + Tailwind CSS v4 mobile-first UI (`src/features/`, `src/components/`) consumes derived state via `CycleProvider` and `I18nProvider`, styled strictly with OKLCH tokens from `DESIGN.md`.

**Tech Stack:** Vite 8, React 19, TypeScript 7, Tailwind CSS 4 (`@tailwindcss/vite`), Dexie 4, `vite-plugin-pwa` 2, `lucide-react`, Vitest 5, React Testing Library, `fake-indexeddb`.

**Spec:** `docs/superpowers/specs/2026-11-19-period-tracker-design.md` (with `PRODUCT.md` and `DESIGN.md` at project root)

## Global Constraints

- Follow `PRODUCT.md` (`register: product`) and `DESIGN.md` strictly: OKLCH tinted neutrals only, never pure `#ffffff` or `#000000`, never side-stripe borders (>1px `border-left`/`border-right` accent), never gradient text, never decorative glassmorphism, never nested cards, never bounce/elastic animations (use 150-220ms `cubic-bezier(0.16, 1, 0.3, 1)`), never centered modal popups for daily logging (use BottomSheet or inline controls).
- No emojis and no em-dashes (`—` or `--`) anywhere in UI copy, code comments, or commit messages.
- All calendar date math uses `ISODate` (`YYYY-MM-DD`) via UTC midnight arithmetic (`Date.UTC`) with zero local timezone drift.
- Bilingual Thai (`th`, default) and English (`en`) copy via `src/i18n/translations.ts`, with `tabular-nums` on all dates, counts, and stats.
- All shell commands use `rtk` prefix where applicable, and never push directly to `main`/`master`.

---

## File Structure Overview

- `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`: Build, PWA, TypeScript, and test configuration.
- `public/icons/icon-192.svg`, `public/icons/icon-512.svg`: Minimal coral-rose PWA icons.
- `src/styles/tokens.css`, `src/styles/globals.css`: OKLCH CSS custom properties and Tailwind v4 `@theme` wiring.
- `src/domain/types.ts`: Core domain types (`ISODate`, `FlowLevel`, `DailyLog`, `UserSettings`, `PeriodEpisode`, `CycleSummary`, `DayCalendarInfo`, `CycleInsights`).
- `src/domain/date-utils.ts`: Pure UTC-safe `YYYY-MM-DD` date utilities and month calendar grid builder.
- `src/domain/cycle-engine.ts`: Pure cycle episode grouping, weighted prediction, ovulation/fertile/conception calculator, calendar projection, and insights aggregation.
- `src/data/repository.ts`: `CycleRepository` and `BackupSnapshot` interfaces.
- `src/data/db.ts`: Dexie database schema (`PinkBirdCycleDB`).
- `src/data/dexie-repository.ts`: IndexedDB implementation of `CycleRepository` with tombstone soft deletes and sync metadata.
- `src/data/backup.ts`: Pure strict validator `parseBackupSnapshot`.
- `src/i18n/translations.ts`, `src/i18n/I18nProvider.tsx`: Complete TH/EN translation catalog and context hook.
- `src/state/CycleProvider.tsx`: Repository-backed React state provider + derived engine memoization + storage error handling.
- `src/components/ui/`: `Button.tsx`, `Chip.tsx`, `BottomSheet.tsx`, `Skeleton.tsx`, `EmptyState.tsx`.
- `src/components/layout/`: `AppShell.tsx`, `BottomNav.tsx`.
- `src/features/onboarding/OnboardingFlow.tsx`: 3-step first-run onboarding.
- `src/features/daily-log/DailyLogSheet.tsx`: Mobile bottom sheet for flow, symptoms, moods, activities, and note.
- `src/features/today/`: `CycleRing.tsx`, `TodayLogSummary.tsx`, `TodayView.tsx`.
- `src/features/calendar/`: `CalendarLegend.tsx`, `PeriodEditBanner.tsx`, `MonthGrid.tsx`, `CalendarView.tsx`.
- `src/features/insights/`: `CycleTrendChart.tsx`, `CycleHistoryList.tsx`, `TopPatternsList.tsx`, `InsightsView.tsx`.
- `src/features/settings/`: `BackupControls.tsx`, `SettingsView.tsx`.
- `src/App.tsx`, `src/main.tsx`: Root providers, tab routing, and global DailyLogSheet controller.

---

### Task 1: Project Scaffold, PWA Config, OKLCH Design Tokens & Test Harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `.gitignore`
- Create: `public/icons/icon-192.svg`, `public/icons/icon-512.svg`
- Create: `src/styles/tokens.css`, `src/styles/globals.css`
- Create: `src/test/setup.ts`, `src/main.tsx`, `src/App.tsx`
- Test: `src/App.smoke.test.tsx`

**Interfaces:**
- Produces: Buildable Vite 8 + React 19 + Tailwind CSS v4 + `vite-plugin-pwa` project, CSS custom properties matching `DESIGN.md` (`--color-blush-canvas`, `--color-warm-surface`, `--color-coral-rose`, `--color-fertile-sage`, etc.), and Vitest + jsdom + Testing Library harness.

- [ ] **Step 1: Create `.gitignore`, `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, and `index.html`**

Create `.gitignore`:
```gitignore
node_modules
dist
dev-dist
.vite
coverage
.DS_Store
```

Create `package.json`:
```json
{
  "name": "pinkbird-period-tracker",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest"
  },
  "dependencies": {
    "dexie": "^4.4.7",
    "lucide-react": "^1.76.0",
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.5",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.3",
    "@testing-library/user-event": "^14.6.13",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^6.3.0",
    "fake-indexeddb": "^6.2.8",
    "jsdom": "^31.0.1",
    "tailwindcss": "^4.3.5",
    "typescript": "^7.0.2",
    "vite": "^8.3.8",
    "vite-plugin-pwa": "^2.0.0",
    "vitest": "^5.1.1"
  }
}
```

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

Create `vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: 'PinkBird Cycle Tracker',
        short_name: 'PinkBird',
        description: 'Private local-first menstrual cycle and daily health tracker',
        theme_color: '#fcf7f8',
        background_color: '#fcf7f8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
});
```

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
```

Create `index.html`:
```html
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#fcf7f8" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <link rel="icon" type="image/svg+xml" href="/icons/icon-192.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>PinkBird</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create PWA SVG icons, OKLCH design tokens (`src/styles/tokens.css`, `src/styles/globals.css`), test setup, and initial `App.tsx`**

Create `public/icons/icon-192.svg` and `public/icons/icon-512.svg` (clean minimal geometric rose-blush cycle ring emblem):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" fill="none">
  <rect width="192" height="192" rx="44" fill="#FCF6F7"/>
  <circle cx="96" cy="96" r="54" stroke="#F4D7DD" stroke-width="14"/>
  <path d="M96 42 A54 54 0 0 1 150 96" stroke="#DF5E74" stroke-width="14" stroke-linecap="round"/>
  <circle cx="96" cy="96" r="14" fill="#DF5E74"/>
</svg>
```
(Same geometry scaled to `viewBox="0 0 512 512"` in `public/icons/icon-512.svg`.)

Create `src/styles/tokens.css`:
```css
:root {
  --color-blush-canvas: oklch(0.985 0.008 15);
  --color-warm-surface: oklch(0.996 0.004 15);
  --color-tinted-subtle: oklch(0.962 0.013 15);
  --color-rose-hairline: oklch(0.912 0.015 15);
  --color-ink-primary: oklch(0.24 0.022 15);
  --color-ink-secondary: oklch(0.47 0.022 15);
  --color-ink-muted: oklch(0.60 0.018 15);

  --color-coral-rose: oklch(0.61 0.175 12);
  --color-coral-rose-hover: oklch(0.55 0.18 12);
  --color-coral-rose-soft: oklch(0.945 0.038 12);
  --color-coral-rose-ink: oklch(0.45 0.155 12);
  --color-predicted-blush: oklch(0.935 0.042 12);

  --color-fertile-sage: oklch(0.54 0.115 168);
  --color-fertile-sage-soft: oklch(0.935 0.034 168);
  --color-fertile-sage-ink: oklch(0.39 0.095 168);

  --color-amber-late: oklch(0.64 0.14 68);
  --color-amber-late-soft: oklch(0.95 0.04 75);
  --color-danger-ink: oklch(0.52 0.18 22);
  --color-danger-soft: oklch(0.95 0.035 22);

  --font-sans: "Noto Sans Thai", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 160ms;
  --duration-base: 210ms;
  --shadow-sheet: 0 -8px 30px oklch(0.24 0.03 15 / 0.10);
}
```

Create `src/styles/globals.css`:
```css
@import "tailwindcss";
@import "./tokens.css";

@theme inline {
  --color-blush-canvas: var(--color-blush-canvas);
  --color-warm-surface: var(--color-warm-surface);
  --color-tinted-subtle: var(--color-tinted-subtle);
  --color-rose-hairline: var(--color-rose-hairline);
  --color-ink-primary: var(--color-ink-primary);
  --color-ink-secondary: var(--color-ink-secondary);
  --color-ink-muted: var(--color-ink-muted);
  --color-coral-rose: var(--color-coral-rose);
  --color-coral-rose-hover: var(--color-coral-rose-hover);
  --color-coral-rose-soft: var(--color-coral-rose-soft);
  --color-coral-rose-ink: var(--color-coral-rose-ink);
  --color-predicted-blush: var(--color-predicted-blush);
  --color-fertile-sage: var(--color-fertile-sage);
  --color-fertile-sage-soft: var(--color-fertile-sage-soft);
  --color-fertile-sage-ink: var(--color-fertile-sage-ink);
  --color-amber-late: var(--color-amber-late);
  --color-amber-late-soft: var(--color-amber-late-soft);
  --color-danger-ink: var(--color-danger-ink);
  --color-danger-soft: var(--color-danger-soft);
  --font-sans: var(--font-sans);
}

@layer base {
  html,
  body {
    background-color: var(--color-blush-canvas);
    color: var(--color-ink-primary);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    margin: 0;
    padding: 0;
  }

  button,
  [role="button"] {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--color-coral-rose);
    outline-offset: 2px;
  }
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Create `src/test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
```

Create `src/App.tsx`:
```tsx
export function App() {
  return (
    <main className="min-h-dvh bg-blush-canvas text-ink-primary">
      <h1>PinkBird</h1>
    </main>
  );
}
```

Create `src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create `src/App.smoke.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App scaffold', () => {
  it('renders PinkBird title', () => {
    render(<App />);
    expect(screen.getByText('PinkBird')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Install dependencies and verify typecheck, tests, and build**

Run:
```bash
rtk npm install
rtk npm run typecheck
rtk npm run test -- --run
rtk npm run build
```
Expected: All commands exit 0; smoke test passes; `dist/` includes PWA manifest and service worker.

- [ ] **Step 4: Commit scaffold**

```bash
rtk git add .
rtk git commit -m "chore: scaffold Vite React Tailwind v4 PWA with OKLCH tokens"
```

---

### Task 2: Domain Types & Pure Date Utilities

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/date-utils.ts`
- Test: `src/domain/date-utils.test.ts`

**Interfaces:**
- Produces `src/domain/types.ts`:
  - `ISODate`, `FlowLevel`, `Locale`, `SyncStatus`, `ConceptionChance`, `CycleStatus`, `SymptomId`, `MoodId`, `ActivityId`
  - Constant arrays: `FLOW_LEVELS`, `SYMPTOM_IDS`, `MOOD_IDS`, `ACTIVITY_IDS`
  - Interfaces: `DailyLog`, `DailyLogInput`, `UserSettings`, `PeriodEpisode`, `CycleProjection`, `CycleSummary`, `DayCalendarInfo`, `CycleHistoryItem`, `PatternCount`, `CycleInsights`
  - Constant `DEFAULT_USER_SETTINGS: Omit<UserSettings, 'updatedAt'>`
- Produces `src/domain/date-utils.ts`:
  - `isValidISODate(value: string): boolean`
  - `parseISODate(date: ISODate): { year: number; month: number; day: number }`
  - `formatISODate(year: number, month: number, day: number): ISODate`
  - `addDays(date: ISODate, days: number): ISODate`
  - `diffDays(from: ISODate, to: ISODate): number`
  - `compareDates(a: ISODate, b: ISODate): number`
  - `todayISO(now?: Date): ISODate`
  - `addMonths(year: number, month: number, delta: number): { year: number; month: number }`
  - `getMonthGrid(year: number, month: number): Array<{ date: ISODate; inCurrentMonth: boolean }>`
  - `formatMonthYear(year: number, month: number, locale: Locale): string`
  - `formatFullDate(date: ISODate, locale: Locale): string`
  - `formatShortDate(date: ISODate, locale: Locale): string`

- [ ] **Step 1: Write `src/domain/types.ts`**

```ts
export type ISODate = string;

export const FLOW_LEVELS = ['none', 'spotting', 'light', 'medium', 'heavy'] as const;
export type FlowLevel = (typeof FLOW_LEVELS)[number];

export type Locale = 'th' | 'en';
export type SyncStatus = 'local' | 'pending' | 'synced';
export type ConceptionChance = 'low' | 'medium' | 'high';

export const SYMPTOM_IDS = [
  'cramps',
  'backache',
  'headache',
  'tender_breasts',
  'bloating',
  'fatigue',
  'acne',
  'nausea',
] as const;
export type SymptomId = (typeof SYMPTOM_IDS)[number];

export const MOOD_IDS = [
  'calm',
  'happy',
  'sensitive',
  'irritable',
  'sad',
  'anxious',
  'tired',
] as const;
export type MoodId = (typeof MOOD_IDS)[number];

export const ACTIVITY_IDS = ['protected_sex', 'unprotected_sex', 'exercise'] as const;
export type ActivityId = (typeof ACTIVITY_IDS)[number];

export interface DailyLog {
  date: ISODate;
  flow: FlowLevel;
  symptoms: SymptomId[];
  moods: MoodId[];
  activities: ActivityId[];
  note: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
}

export type DailyLogInput = Omit<DailyLog, 'updatedAt' | 'deletedAt' | 'syncStatus'>;

export interface UserSettings {
  id: 'default';
  defaultCycleLength: number;
  defaultPeriodLength: number;
  lutealPhaseLength: number;
  locale: Locale;
  onboardingCompleted: boolean;
  updatedAt: string;
}

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'updatedAt'> = {
  id: 'default',
  defaultCycleLength: 28,
  defaultPeriodLength: 5,
  lutealPhaseLength: 14,
  locale: 'th',
  onboardingCompleted: false,
};

export interface PeriodEpisode {
  startDate: ISODate;
  endDate: ISODate;
  loggedDays: ISODate[];
  lengthDays: number;
}

export type CycleStatus =
  | 'no_data'
  | 'period'
  | 'period_due_today'
  | 'late'
  | 'ovulation'
  | 'fertile'
  | 'follicular'
  | 'luteal';

export interface CycleProjection {
  cycleStart: ISODate;
  predictedPeriodEnd: ISODate;
  ovulationDate: ISODate;
  fertileStart: ISODate;
  fertileEnd: ISODate;
}

export interface CycleSummary {
  status: CycleStatus;
  today: ISODate;
  predictedCycleLength: number;
  predictedPeriodLength: number;
  currentCycleDay: number | null;
  periodDay: number | null;
  daysUntilNextPeriod: number | null;
  daysLate: number;
  nextPeriodStart: ISODate | null;
  ovulationDate: ISODate | null;
  fertileStart: ISODate | null;
  fertileEnd: ISODate | null;
  conceptionChance: ConceptionChance;
  latestEpisode: PeriodEpisode | null;
  progressRatio: number;
}

export interface DayCalendarInfo {
  date: ISODate;
  isLoggedPeriod: boolean;
  flow: FlowLevel;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  conceptionChance: ConceptionChance;
  hasOtherLogs: boolean;
  cycleDay: number | null;
}

export interface CycleHistoryItem {
  startDate: ISODate;
  endDate: ISODate;
  periodLength: number;
  cycleLength: number | null;
  isOutlier: boolean;
}

export interface PatternCount<T extends string> {
  id: T;
  count: number;
  percentage: number;
}

export interface CycleInsights {
  averageCycleLength: number | null;
  averagePeriodLength: number | null;
  shortestCycle: number | null;
  longestCycle: number | null;
  cycleVariation: number | null;
  completedCycleCount: number;
  totalLoggedDays: number;
  cycleHistory: CycleHistoryItem[];
  topSymptoms: PatternCount<SymptomId>[];
  topMoods: PatternCount<MoodId>[];
}
```

- [ ] **Step 2: Write failing tests in `src/domain/date-utils.test.ts`**

```ts
import {
  addDays,
  addMonths,
  compareDates,
  diffDays,
  formatFullDate,
  formatISODate,
  formatMonthYear,
  formatShortDate,
  getMonthGrid,
  isValidISODate,
  parseISODate,
  todayISO,
} from './date-utils';

describe('date-utils', () => {
  it('validates real calendar ISO dates and rejects invalid ones', () => {
    expect(isValidISODate('2026-11-19')).toBe(true);
    expect(isValidISODate('2024-02-29')).toBe(true);
    expect(isValidISODate('2025-02-29')).toBe(false);
    expect(isValidISODate('2026-13-01')).toBe(false);
    expect(isValidISODate('2026-04-31')).toBe(false);
    expect(isValidISODate('2026-1-5')).toBe(false);
    expect(isValidISODate('not-a-date')).toBe(false);
  });

  it('adds and diffs days accurately across leap years and year boundaries', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2027-01-02', -3)).toBe('2026-12-30');
    expect(diffDays('2026-11-01', '2026-11-19')).toBe(18);
    expect(diffDays('2026-11-19', '2026-11-01')).toBe(-18);
    expect(diffDays('2024-02-28', '2024-03-01')).toBe(2);
  });

  it('compares and formats dates cleanly', () => {
    expect(compareDates('2026-11-01', '2026-11-02')).toBe(-1);
    expect(compareDates('2026-11-02', '2026-11-02')).toBe(0);
    expect(compareDates('2026-11-03', '2026-11-02')).toBe(1);
    expect(parseISODate('2026-11-19')).toEqual({ year: 2026, month: 11, day: 19 });
    expect(formatISODate(2026, 3, 5)).toBe('2026-03-05');
    expect(todayISO(new Date(2026, 10, 19, 23, 59))).toBe('2026-11-19');
  });

  it('navigates months across year boundaries', () => {
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });

  it('builds a complete 42-cell Sunday-first month grid', () => {
    const grid = getMonthGrid(2026, 11);
    expect(grid).toHaveLength(42);
    expect(grid[0]).toEqual({ date: '2026-11-01', inCurrentMonth: true });
    expect(grid[29]).toEqual({ date: '2026-11-30', inCurrentMonth: true });
    expect(grid[30]).toEqual({ date: '2026-12-01', inCurrentMonth: false });
  });

  it('formats localized Thai and English labels without throwing', () => {
    expect(formatMonthYear(2026, 11, 'en')).toContain('2026');
    expect(formatMonthYear(2026, 11, 'th')).toContain('2569');
    expect(formatFullDate('2026-11-19', 'en')).toContain('19');
    expect(formatShortDate('2026-11-19', 'th')).toContain('19');
  });
});
```

- [ ] **Step 3: Run test to verify failure**

Run: `rtk npx vitest run src/domain/date-utils.test.ts`
Expected: FAIL because `./date-utils` does not exist yet.

- [ ] **Step 4: Implement `src/domain/date-utils.ts`**

```ts
import type { ISODate, Locale } from './types';

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

export function isValidISODate(value: string): boolean {
  const match = ISO_DATE_RE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

export function parseISODate(date: ISODate): { year: number; month: number; day: number } {
  const match = ISO_DATE_RE.exec(date);
  if (!match) {
    throw new Error(`Invalid ISO date: ${date}`);
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function formatISODate(year: number, month: number, day: number): ISODate {
  const y = String(year).padStart(4, '0');
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toUTCTimestamp(date: ISODate): number {
  const { year, month, day } = parseISODate(date);
  return Date.UTC(year, month - 1, day);
}

export function addDays(date: ISODate, days: number): ISODate {
  const dt = new Date(toUTCTimestamp(date) + days * MS_PER_DAY);
  return formatISODate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function diffDays(from: ISODate, to: ISODate): number {
  return Math.round((toUTCTimestamp(to) - toUTCTimestamp(from)) / MS_PER_DAY);
}

export function compareDates(a: ISODate, b: ISODate): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function todayISO(now: Date = new Date()): ISODate {
  return formatISODate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  const nextYear = Math.floor(total / 12);
  const nextMonth = ((total % 12) + 12) % 12 + 1;
  return { year: nextYear, month: nextMonth };
}

export function getMonthGrid(
  year: number,
  month: number,
): Array<{ date: ISODate; inCurrentMonth: boolean }> {
  const firstOfMonth = formatISODate(year, month, 1);
  const firstDayOfWeek = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const gridStart = addDays(firstOfMonth, -firstDayOfWeek);
  const cells: Array<{ date: ISODate; inCurrentMonth: boolean }> = [];
  for (let i = 0; i < 42; i += 1) {
    const date = addDays(gridStart, i);
    const parsed = parseISODate(date);
    cells.push({
      date,
      inCurrentMonth: parsed.year === year && parsed.month === month,
    });
  }
  return cells;
}

function toNoonUTCDate(date: ISODate): Date {
  const { year, month, day } = parseISODate(date);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function formatMonthYear(year: number, month: number, locale: Locale): string {
  const dt = new Date(Date.UTC(year, month - 1, 15, 12, 0, 0));
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dt);
}

export function formatFullDate(date: ISODate, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(toNoonUTCDate(date));
}

export function formatShortDate(date: ISODate, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(toNoonUTCDate(date));
}
```

- [ ] **Step 5: Run tests and commit**

Run: `rtk npx vitest run src/domain/date-utils.test.ts`
Expected: PASS (6 tests).

```bash
rtk git add src/domain/types.ts src/domain/date-utils.ts src/domain/date-utils.test.ts
rtk git commit -m "feat(domain): add core types and UTC-safe ISO date utilities"
```

---

### Task 3: Cycle Prediction & Insights Engine

**Files:**
- Create: `src/domain/cycle-engine.ts`
- Test: `src/domain/cycle-engine.test.ts`

**Interfaces:**
- Consumes: `src/domain/types.ts`, `src/domain/date-utils.ts`
- Produces:
  - `extractPeriodEpisodes(logs: DailyLog[]): PeriodEpisode[]`
  - `computePredictedLengths(episodes: PeriodEpisode[], settings: UserSettings, today: ISODate): { predictedCycleLength: number; predictedPeriodLength: number }`
  - `computeConceptionChance(date: ISODate, ovulationDate: ISODate, isLoggedPeriod: boolean): ConceptionChance`
  - `computeCycleSummary(logs: DailyLog[], settings: UserSettings, today: ISODate): CycleSummary`
  - `buildCalendarMap(logs: DailyLog[], settings: UserSettings, today: ISODate, futureCycles?: number): Map<ISODate, DayCalendarInfo>`
  - `computeInsights(logs: DailyLog[], today: ISODate): CycleInsights`

- [ ] **Step 1: Write failing tests in `src/domain/cycle-engine.test.ts`**

```ts
import {
  buildCalendarMap,
  computeCycleSummary,
  computeInsights,
  extractPeriodEpisodes,
} from './cycle-engine';
import { DEFAULT_USER_SETTINGS, type DailyLog, type FlowLevel, type UserSettings } from './types';

function makeLog(
  date: string,
  flow: FlowLevel = 'medium',
  extra: Partial<DailyLog> = {},
): DailyLog {
  return {
    date,
    flow,
    symptoms: [],
    moods: [],
    activities: [],
    note: '',
    updatedAt: '2026-11-19T00:00:00.000Z',
    deletedAt: null,
    syncStatus: 'local',
    ...extra,
  };
}

const baseSettings: UserSettings = {
  ...DEFAULT_USER_SETTINGS,
  updatedAt: '2026-11-19T00:00:00.000Z',
};

describe('cycle-engine', () => {
  it('returns no_data with no fabricated predictions when logs are empty', () => {
    const summary = computeCycleSummary([], baseSettings, '2026-11-19');
    expect(summary.status).toBe('no_data');
    expect(summary.nextPeriodStart).toBeNull();
    expect(summary.ovulationDate).toBeNull();
    expect(summary.currentCycleDay).toBeNull();
    expect(summary.conceptionChance).toBe('low');
  });

  it('merges 1-2 day gaps within the same period episode and splits >= 14 day starts', () => {
    const logs = [
      makeLog('2026-10-01', 'medium'),
      makeLog('2026-10-02', 'heavy'),
      // 1-day pause on Oct 3
      makeLog('2026-10-04', 'light'),
      makeLog('2026-10-29', 'medium'),
      makeLog('2026-10-30', 'medium'),
    ];
    const episodes = extractPeriodEpisodes(logs);
    expect(episodes).toHaveLength(2);
    expect(episodes[0]).toMatchObject({
      startDate: '2026-10-01',
      endDate: '2026-10-04',
      lengthDays: 4,
    });
    expect(episodes[1]).toMatchObject({
      startDate: '2026-10-29',
      endDate: '2026-10-30',
      lengthDays: 2,
    });
  });

  it('ignores soft-deleted logs and flow=none entries when building episodes', () => {
    const logs = [
      makeLog('2026-11-01', 'medium'),
      makeLog('2026-11-02', 'medium', { deletedAt: '2026-11-03T00:00:00.000Z' }),
      makeLog('2026-11-03', 'none', { symptoms: ['cramps'] }),
    ];
    const episodes = extractPeriodEpisodes(logs);
    expect(episodes).toHaveLength(1);
    expect(episodes[0].loggedDays).toEqual(['2026-11-01']);
  });

  it('computes weighted cycle length favoring recent cycles and excluding outliers', () => {
    // Starts: Jan 1 -> Jan 29 (28d) -> Feb 28 (30d) -> May 10 (71d outlier!) -> Jun 9 (30d) -> Jul 11 (32d)
    const starts = ['2026-01-01', '2026-01-29', '2026-02-28', '2026-05-10', '2026-06-09', '2026-07-11'];
    const logs = starts.flatMap((d) => [makeLog(d, 'medium')]);
    const summary = computeCycleSummary(logs, baseSettings, '2026-07-15');
    // Valid completed cycles in order: [28, 30, 30, 32]
    // Weights 1,2,3,4 => (28*1 + 30*2 + 30*3 + 32*4) / 10 = (28+60+90+128)/10 = 30.6 => 31
    expect(summary.predictedCycleLength).toBe(31);
    expect(summary.nextPeriodStart).toBe('2026-08-11');
  });

  it('identifies active period, ovulation, fertile window, and conception chances accurately', () => {
    const logs = [
      makeLog('2026-11-01', 'medium'),
      makeLog('2026-11-02', 'heavy'),
      makeLog('2026-11-03', 'medium'),
    ];
    // 28d cycle => nextPeriodStart = 2026-11-29, ovulation = 2026-11-15, fertile = Nov 10..Nov 16
    const periodSummary = computeCycleSummary(logs, baseSettings, '2026-11-02');
    expect(periodSummary.status).toBe('period');
    expect(periodSummary.periodDay).toBe(2);
    expect(periodSummary.conceptionChance).toBe('low');

    const fertileMedium = computeCycleSummary(logs, baseSettings, '2026-11-11');
    expect(fertileMedium.status).toBe('fertile');
    expect(fertileMedium.conceptionChance).toBe('medium');

    const fertileHigh = computeCycleSummary(logs, baseSettings, '2026-11-13');
    expect(fertileHigh.status).toBe('fertile');
    expect(fertileHigh.conceptionChance).toBe('high');

    const ovulationSummary = computeCycleSummary(logs, baseSettings, '2026-11-15');
    expect(ovulationSummary.status).toBe('ovulation');
    expect(ovulationSummary.conceptionChance).toBe('high');

    const lutealSummary = computeCycleSummary(logs, baseSettings, '2026-11-20');
    expect(lutealSummary.status).toBe('luteal');
    expect(lutealSummary.daysUntilNextPeriod).toBe(9);
    expect(lutealSummary.conceptionChance).toBe('low');
  });

  it('detects period_due_today and late periods without painting past predicted periods', () => {
    const logs = [makeLog('2026-10-15', 'medium')];
    // nextPeriodStart = 2026-11-12
    const due = computeCycleSummary(logs, baseSettings, '2026-11-12');
    expect(due.status).toBe('period_due_today');
    expect(due.daysLate).toBe(0);

    const late = computeCycleSummary(logs, baseSettings, '2026-11-16');
    expect(late.status).toBe('late');
    expect(late.daysLate).toBe(4);

    const map = buildCalendarMap(logs, baseSettings, '2026-11-16', 6);
    expect(map.get('2026-11-12')?.isPredictedPeriod ?? false).toBe(false);
    expect(map.get('2026-12-10')?.isPredictedPeriod).toBe(true);
  });

  it('projects remaining days of current episode and 6 upcoming cycles onto calendar map', () => {
    const logs = [
      makeLog('2026-11-01', 'medium', { symptoms: ['cramps'], moods: ['tired'] }),
      makeLog('2026-11-02', 'heavy'),
    ];
    const map = buildCalendarMap(logs, baseSettings, '2026-11-02', 6);
    expect(map.get('2026-11-01')?.isLoggedPeriod).toBe(true);
    expect(map.get('2026-11-01')?.hasOtherLogs).toBe(true);
    // Remaining days 3..5 predicted
    expect(map.get('2026-11-03')?.isPredictedPeriod).toBe(true);
    expect(map.get('2026-11-05')?.isPredictedPeriod).toBe(true);
    expect(map.get('2026-11-06')?.isPredictedPeriod ?? false).toBe(false);
    // Current ovulation & fertile
    expect(map.get('2026-11-15')?.isOvulation).toBe(true);
    expect(map.get('2026-11-12')?.isFertile).toBe(true);
    // Next predicted period start Nov 29
    expect(map.get('2026-11-29')?.isPredictedPeriod).toBe(true);
  });

  it('computes insights averages, variation, history, and top symptoms/moods', () => {
    const logs = [
      makeLog('2026-09-01', 'medium', { symptoms: ['cramps', 'fatigue'], moods: ['tired'] }),
      makeLog('2026-09-02', 'heavy', { symptoms: ['cramps'], moods: ['tired'] }),
      makeLog('2026-09-29', 'medium', { symptoms: ['headache'], moods: ['calm'] }),
      makeLog('2026-09-30', 'light'),
      makeLog('2026-10-29', 'medium', { symptoms: ['cramps'], moods: ['irritable'] }),
    ];
    // Cycles: 28, 30
    const insights = computeInsights(logs, '2026-11-10');
    expect(insights.completedCycleCount).toBe(2);
    expect(insights.averageCycleLength).toBe(29);
    expect(insights.shortestCycle).toBe(28);
    expect(insights.longestCycle).toBe(30);
    expect(insights.cycleVariation).toBe(2);
    expect(insights.cycleHistory).toHaveLength(3);
    expect(insights.cycleHistory[0].startDate).toBe('2026-10-29');
    expect(insights.cycleHistory[0].cycleLength).toBeNull();
    expect(insights.cycleHistory[1].cycleLength).toBe(30);
    expect(insights.topSymptoms[0]).toMatchObject({ id: 'cramps', count: 3 });
    expect(insights.topMoods[0]).toMatchObject({ id: 'tired', count: 2 });
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npx vitest run src/domain/cycle-engine.test.ts`
Expected: FAIL because `./cycle-engine` does not exist.

- [ ] **Step 3: Implement `src/domain/cycle-engine.ts`**

```ts
import { addDays, compareDates, diffDays } from './date-utils';
import type {
  ConceptionChance,
  CycleHistoryItem,
  CycleInsights,
  CycleProjection,
  CycleStatus,
  CycleSummary,
  DailyLog,
  DayCalendarInfo,
  ISODate,
  MoodId,
  PatternCount,
  PeriodEpisode,
  SymptomId,
  UserSettings,
} from './types';

const MIN_VALID_CYCLE_DAYS = 15;
const MAX_VALID_CYCLE_DAYS = 60;
const MIN_NEW_CYCLE_GAP_FROM_START = 14;
const MAX_IN_EPISODE_GAP_DAYS = 2;
const RECENT_CYCLES_WINDOW = 6;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hasNonFlowLogs(log: DailyLog): boolean {
  return (
    log.symptoms.length > 0 ||
    log.moods.length > 0 ||
    log.activities.length > 0 ||
    log.note.trim().length > 0
  );
}

export function extractPeriodEpisodes(logs: DailyLog[]): PeriodEpisode[] {
  const periodDates = logs
    .filter((log) => log.deletedAt === null && log.flow !== 'none')
    .map((log) => log.date)
    .sort(compareDates);

  const uniqueDates = Array.from(new Set(periodDates));
  if (uniqueDates.length === 0) return [];

  const episodes: PeriodEpisode[] = [];
  let current: PeriodEpisode = {
    startDate: uniqueDates[0],
    endDate: uniqueDates[0],
    loggedDays: [uniqueDates[0]],
    lengthDays: 1,
  };

  for (let i = 1; i < uniqueDates.length; i += 1) {
    const date = uniqueDates[i];
    const gapFromPrev = diffDays(current.endDate, date);
    const gapFromStart = diffDays(current.startDate, date);

    if (gapFromPrev <= MAX_IN_EPISODE_GAP_DAYS && gapFromStart < MIN_NEW_CYCLE_GAP_FROM_START) {
      current.endDate = date;
      current.loggedDays.push(date);
      current.lengthDays = diffDays(current.startDate, current.endDate) + 1;
    } else {
      episodes.push(current);
      current = {
        startDate: date,
        endDate: date,
        loggedDays: [date],
        lengthDays: 1,
      };
    }
  }
  episodes.push(current);
  return episodes;
}

export function computePredictedLengths(
  episodes: PeriodEpisode[],
  settings: UserSettings,
  today: ISODate,
): { predictedCycleLength: number; predictedPeriodLength: number } {
  const validCycleLengths: number[] = [];
  for (let i = 0; i < episodes.length - 1; i += 1) {
    const length = diffDays(episodes[i].startDate, episodes[i + 1].startDate);
    if (length >= MIN_VALID_CYCLE_DAYS && length <= MAX_VALID_CYCLE_DAYS) {
      validCycleLengths.push(length);
    }
  }

  let predictedCycleLength = settings.defaultCycleLength;
  const recentCycles = validCycleLengths.slice(-RECENT_CYCLES_WINDOW);
  if (recentCycles.length > 0) {
    let weightedSum = 0;
    let weightTotal = 0;
    recentCycles.forEach((len, idx) => {
      const weight = idx + 1;
      weightedSum += len * weight;
      weightTotal += weight;
    });
    predictedCycleLength = clamp(Math.round(weightedSum / weightTotal), 18, 45);
  }

  const completedEpisodes = episodes.filter((ep, idx) => {
    const isLatest = idx === episodes.length - 1;
    if (!isLatest) return true;
    return diffDays(ep.startDate, today) >= settings.defaultPeriodLength;
  });

  let predictedPeriodLength = settings.defaultPeriodLength;
  const recentPeriods = completedEpisodes.slice(-RECENT_CYCLES_WINDOW);
  if (recentPeriods.length > 0) {
    const avg =
      recentPeriods.reduce((acc, ep) => acc + ep.lengthDays, 0) / recentPeriods.length;
    predictedPeriodLength = clamp(Math.round(avg), 2, 10);
  }

  return { predictedCycleLength, predictedPeriodLength };
}

export function computeConceptionChance(
  date: ISODate,
  ovulationDate: ISODate,
  isLoggedPeriod: boolean,
): ConceptionChance {
  if (isLoggedPeriod) return 'low';
  const offset = diffDays(ovulationDate, date);
  if (offset >= -2 && offset <= 0) return 'high';
  if ((offset >= -5 && offset <= -3) || offset === 1) return 'medium';
  return 'low';
}

function buildCycleProjection(
  cycleStart: ISODate,
  cycleLength: number,
  periodLength: number,
  lutealPhaseLength: number,
): CycleProjection {
  const nextStart = addDays(cycleStart, cycleLength);
  const ovulationDate = addDays(nextStart, -lutealPhaseLength);
  return {
    cycleStart,
    predictedPeriodEnd: addDays(cycleStart, periodLength - 1),
    ovulationDate,
    fertileStart: addDays(ovulationDate, -5),
    fertileEnd: addDays(ovulationDate, 1),
  };
}

export function computeCycleSummary(
  logs: DailyLog[],
  settings: UserSettings,
  today: ISODate,
): CycleSummary {
  const activeLogs = logs.filter((log) => log.deletedAt === null);
  const episodes = extractPeriodEpisodes(activeLogs);

  if (episodes.length === 0) {
    return {
      status: 'no_data',
      today,
      predictedCycleLength: settings.defaultCycleLength,
      predictedPeriodLength: settings.defaultPeriodLength,
      currentCycleDay: null,
      periodDay: null,
      daysUntilNextPeriod: null,
      daysLate: 0,
      nextPeriodStart: null,
      ovulationDate: null,
      fertileStart: null,
      fertileEnd: null,
      conceptionChance: 'low',
      latestEpisode: null,
      progressRatio: 0,
    };
  }

  const { predictedCycleLength, predictedPeriodLength } = computePredictedLengths(
    episodes,
    settings,
    today,
  );

  // Anchor to the most recent episode that starts on or before today (or latest if all future)
  const pastOrTodayEpisodes = episodes.filter((ep) => compareDates(ep.startDate, today) <= 0);
  const latest =
    pastOrTodayEpisodes.length > 0
      ? pastOrTodayEpisodes[pastOrTodayEpisodes.length - 1]
      : episodes[episodes.length - 1];

  const todayLog = activeLogs.find((log) => log.date === today);
  const isTodayLoggedPeriod = Boolean(todayLog && todayLog.flow !== 'none');
  const isInsideLatestEpisode =
    compareDates(today, latest.startDate) >= 0 && compareDates(today, latest.endDate) <= 0;

  const currentCycleDay =
    compareDates(today, latest.startDate) >= 0 ? diffDays(latest.startDate, today) + 1 : 1;
  const nextPeriodStart = addDays(latest.startDate, predictedCycleLength);
  const daysUntilNextPeriod = diffDays(today, nextPeriodStart);
  const currentProjection = buildCycleProjection(
    latest.startDate,
    predictedCycleLength,
    predictedPeriodLength,
    settings.lutealPhaseLength,
  );

  const conceptionChance = computeConceptionChance(
    today,
    currentProjection.ovulationDate,
    isTodayLoggedPeriod || isInsideLatestEpisode,
  );

  let status: CycleStatus;
  let periodDay: number | null = null;
  let daysLate = 0;

  if (isTodayLoggedPeriod || isInsideLatestEpisode) {
    status = 'period';
    periodDay = diffDays(latest.startDate, today) + 1;
  } else if (daysUntilNextPeriod === 0) {
    status = 'period_due_today';
  } else if (daysUntilNextPeriod < 0) {
    status = 'late';
    daysLate = Math.abs(daysUntilNextPeriod);
  } else if (today === currentProjection.ovulationDate) {
    status = 'ovulation';
  } else if (
    compareDates(today, currentProjection.fertileStart) >= 0 &&
    compareDates(today, currentProjection.fertileEnd) <= 0
  ) {
    status = 'fertile';
  } else if (compareDates(today, currentProjection.ovulationDate) < 0) {
    status = 'follicular';
  } else {
    status = 'luteal';
  }

  const progressRatio = clamp(currentCycleDay / predictedCycleLength, 0, 1);

  return {
    status,
    today,
    predictedCycleLength,
    predictedPeriodLength,
    currentCycleDay,
    periodDay,
    daysUntilNextPeriod,
    daysLate,
    nextPeriodStart,
    ovulationDate: currentProjection.ovulationDate,
    fertileStart: currentProjection.fertileStart,
    fertileEnd: currentProjection.fertileEnd,
    conceptionChance,
    latestEpisode: latest,
    progressRatio,
  };
}

export function buildCalendarMap(
  logs: DailyLog[],
  settings: UserSettings,
  today: ISODate,
  futureCycles = 6,
): Map<ISODate, DayCalendarInfo> {
  const map = new Map<ISODate, DayCalendarInfo>();
  const activeLogs = logs.filter((log) => log.deletedAt === null);

  const ensureDay = (date: ISODate): DayCalendarInfo => {
    let info = map.get(date);
    if (!info) {
      info = {
        date,
        isLoggedPeriod: false,
        flow: 'none',
        isPredictedPeriod: false,
        isFertile: false,
        isOvulation: false,
        conceptionChance: 'low',
        hasOtherLogs: false,
        cycleDay: null,
      };
      map.set(date, info);
    }
    return info;
  };

  for (const log of activeLogs) {
    const info = ensureDay(log.date);
    info.flow = log.flow;
    info.isLoggedPeriod = log.flow !== 'none';
    info.hasOtherLogs = hasNonFlowLogs(log);
  }

  const episodes = extractPeriodEpisodes(activeLogs);
  if (episodes.length === 0) {
    return map;
  }

  const { predictedCycleLength, predictedPeriodLength } = computePredictedLengths(
    episodes,
    settings,
    today,
  );

  // Mark cycle days and historical ovulation/fertile for completed cycles
  for (let i = 0; i < episodes.length; i += 1) {
    const ep = episodes[i];
    const nextEp = episodes[i + 1];
    if (nextEp) {
      const actualCycleLength = diffDays(ep.startDate, nextEp.startDate);
      if (actualCycleLength >= MIN_VALID_CYCLE_DAYS && actualCycleLength <= MAX_VALID_CYCLE_DAYS) {
        const proj = buildCycleProjection(
          ep.startDate,
          actualCycleLength,
          ep.lengthDays,
          settings.lutealPhaseLength,
        );
        applyFertilityWindow(map, ensureDay, proj);
      }
      for (let d = 0; d < actualCycleLength; d += 1) {
        const date = addDays(ep.startDate, d);
        const info = map.get(date);
        if (info) info.cycleDay = d + 1;
      }
    }
  }

  const latest = episodes[episodes.length - 1];
  const currentProj = buildCycleProjection(
    latest.startDate,
    predictedCycleLength,
    predictedPeriodLength,
    settings.lutealPhaseLength,
  );

  // Remaining predicted period days of ongoing latest episode (only unlogged days >= today)
  for (let d = 0; d < predictedPeriodLength; d += 1) {
    const date = addDays(latest.startDate, d);
    const info = ensureDay(date);
    info.cycleDay = d + 1;
    if (!info.isLoggedPeriod && compareDates(date, today) >= 0) {
      info.isPredictedPeriod = true;
    }
  }

  applyFertilityWindow(map, ensureDay, currentProj);

  // Future cycles strictly starting after today
  let projectedCount = 0;
  let step = 1;
  while (projectedCount < futureCycles && step <= futureCycles + 24) {
    const cycleStart = addDays(latest.startDate, predictedCycleLength * step);
    step += 1;
    if (compareDates(cycleStart, today) <= 0) {
      continue;
    }
    const proj = buildCycleProjection(
      cycleStart,
      predictedCycleLength,
      predictedPeriodLength,
      settings.lutealPhaseLength,
    );
    for (let d = 0; d < predictedPeriodLength; d += 1) {
      const date = addDays(proj.cycleStart, d);
      const info = ensureDay(date);
      if (!info.isLoggedPeriod) {
        info.isPredictedPeriod = true;
      }
      info.cycleDay = d + 1;
    }
    applyFertilityWindow(map, ensureDay, proj);
    projectedCount += 1;
  }

  return map;
}

function applyFertilityWindow(
  _map: Map<ISODate, DayCalendarInfo>,
  ensureDay: (date: ISODate) => DayCalendarInfo,
  proj: CycleProjection,
): void {
  const span = diffDays(proj.fertileStart, proj.fertileEnd);
  for (let offset = 0; offset <= span; offset += 1) {
    const date = addDays(proj.fertileStart, offset);
    const info = ensureDay(date);
    if (info.isLoggedPeriod || info.isPredictedPeriod) {
      continue;
    }
    info.isFertile = true;
    if (date === proj.ovulationDate) {
      info.isOvulation = true;
    }
    info.conceptionChance = computeConceptionChance(date, proj.ovulationDate, false);
  }
}

export function computeInsights(logs: DailyLog[], _today: ISODate): CycleInsights {
  const activeLogs = logs.filter((log) => log.deletedAt === null);
  const episodes = extractPeriodEpisodes(activeLogs);

  const cycleHistory: CycleHistoryItem[] = [];
  const validCycleLengths: number[] = [];

  for (let i = 0; i < episodes.length; i += 1) {
    const ep = episodes[i];
    const nextEp = episodes[i + 1];
    const cycleLength = nextEp ? diffDays(ep.startDate, nextEp.startDate) : null;
    const isOutlier =
      cycleLength !== null &&
      (cycleLength < MIN_VALID_CYCLE_DAYS || cycleLength > MAX_VALID_CYCLE_DAYS);

    if (cycleLength !== null && !isOutlier) {
      validCycleLengths.push(cycleLength);
    }

    cycleHistory.push({
      startDate: ep.startDate,
      endDate: ep.endDate,
      periodLength: ep.lengthDays,
      cycleLength,
      isOutlier,
    });
  }

  cycleHistory.reverse();

  const averageCycleLength =
    validCycleLengths.length > 0
      ? Math.round(validCycleLengths.reduce((a, b) => a + b, 0) / validCycleLengths.length)
      : null;

  const averagePeriodLength =
    episodes.length > 0
      ? Math.round(episodes.reduce((a, ep) => a + ep.lengthDays, 0) / episodes.length)
      : null;

  const shortestCycle = validCycleLengths.length > 0 ? Math.min(...validCycleLengths) : null;
  const longestCycle = validCycleLengths.length > 0 ? Math.max(...validCycleLengths) : null;
  const cycleVariation =
    shortestCycle !== null && longestCycle !== null ? longestCycle - shortestCycle : null;

  const totalLoggedDays = activeLogs.length;

  const symptomCounts = new Map<SymptomId, number>();
  const moodCounts = new Map<MoodId, number>();

  for (const log of activeLogs) {
    for (const symptom of log.symptoms) {
      symptomCounts.set(symptom, (symptomCounts.get(symptom) ?? 0) + 1);
    }
    for (const mood of log.moods) {
      moodCounts.set(mood, (moodCounts.get(mood) ?? 0) + 1);
    }
  }

  const toSortedPatterns = <T extends string>(
    counts: Map<T, number>,
  ): PatternCount<T>[] => {
    const denom = Math.max(1, totalLoggedDays);
    return Array.from(counts.entries())
      .map(([id, count]) => ({
        id,
        count,
        percentage: Math.round((count / denom) * 100),
      }))
      .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
  };

  return {
    averageCycleLength,
    averagePeriodLength,
    shortestCycle,
    longestCycle,
    cycleVariation,
    completedCycleCount: validCycleLengths.length,
    totalLoggedDays,
    cycleHistory,
    topSymptoms: toSortedPatterns(symptomCounts),
    topMoods: toSortedPatterns(moodCounts),
  };
}
```

- [ ] **Step 4: Run tests and commit**

Run: `rtk npx vitest run src/domain/cycle-engine.test.ts`
Expected: PASS (all 7 tests).

```bash
rtk git add src/domain/cycle-engine.ts src/domain/cycle-engine.test.ts
rtk git commit -m "feat(domain): implement cycle prediction and insights engine"
```

---

### Task 4: Sync-Ready Data Layer, Dexie Repository & Backup Validator

**Files:**
- Create: `src/data/repository.ts`
- Create: `src/data/db.ts`
- Create: `src/data/dexie-repository.ts`
- Create: `src/data/backup.ts`
- Test: `src/data/backup.test.ts`
- Test: `src/data/dexie-repository.test.ts`

**Interfaces:**
- Consumes: `src/domain/types.ts`, `src/domain/date-utils.ts`
- Produces:
  - `BackupSnapshot`, `CycleRepository` (`src/data/repository.ts`)
  - `PinkBirdDatabase` (`src/data/db.ts`)
  - `DexieCycleRepository` (`src/data/dexie-repository.ts`)
  - `BackupErrorCode`, `ParseBackupResult`, `parseBackupSnapshot(raw: unknown): ParseBackupResult` (`src/data/backup.ts`)

- [ ] **Step 1: Create `src/data/repository.ts` and `src/data/db.ts`**

Create `src/data/repository.ts`:
```ts
import type { DailyLog, DailyLogInput, FlowLevel, ISODate, UserSettings } from '../domain/types';

export interface BackupSnapshot {
  version: 1;
  exportedAt: string;
  settings: UserSettings;
  logs: DailyLog[];
}

export interface CycleRepository {
  getAllLogs(): Promise<DailyLog[]>;
  getLogByDate(date: ISODate): Promise<DailyLog | undefined>;
  upsertLog(input: DailyLogInput): Promise<DailyLog>;
  bulkSetPeriodDays(updates: Array<{ date: ISODate; flow: FlowLevel }>): Promise<void>;
  softDeleteLog(date: ISODate): Promise<void>;
  getSettings(): Promise<UserSettings>;
  updateSettings(patch: Partial<Omit<UserSettings, 'id' | 'updatedAt'>>): Promise<UserSettings>;
  exportSnapshot(): Promise<BackupSnapshot>;
  importSnapshot(snapshot: BackupSnapshot): Promise<void>;
  clearAll(): Promise<void>;
}
```

Create `src/data/db.ts`:
```ts
import Dexie, { type EntityTable } from 'dexie';
import type { DailyLog, UserSettings } from '../domain/types';

export class PinkBirdDatabase extends Dexie {
  logs!: EntityTable<DailyLog, 'date'>;
  settings!: EntityTable<UserSettings, 'id'>;

  constructor(name = 'PinkBirdCycleDB') {
    super(name);
    this.version(1).stores({
      logs: '&date, updatedAt, syncStatus',
      settings: '&id',
    });
  }
}
```

- [ ] **Step 2: Write failing tests in `src/data/backup.test.ts` and `src/data/dexie-repository.test.ts`**

Create `src/data/backup.test.ts`:
```ts
import { parseBackupSnapshot } from './backup';

const validSnapshot = {
  version: 1,
  exportedAt: '2026-11-19T10:00:00.000Z',
  settings: {
    id: 'default',
    defaultCycleLength: 28,
    defaultPeriodLength: 5,
    lutealPhaseLength: 14,
    locale: 'th',
    onboardingCompleted: true,
    updatedAt: '2026-11-19T10:00:00.000Z',
  },
  logs: [
    {
      date: '2026-11-01',
      flow: 'medium',
      symptoms: ['cramps'],
      moods: ['tired'],
      activities: ['exercise'],
      note: 'Rested well',
      updatedAt: '2026-11-01T08:00:00.000Z',
      deletedAt: null,
      syncStatus: 'local',
    },
  ],
};

describe('parseBackupSnapshot', () => {
  it('accepts a valid backup snapshot', () => {
    const result = parseBackupSnapshot(validSnapshot);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.logs).toHaveLength(1);
      expect(result.data.settings.locale).toBe('th');
    }
  });

  it('rejects unsupported versions or non-objects', () => {
    expect(parseBackupSnapshot(null)).toEqual({ ok: false, errorCode: 'INVALID_FORMAT' });
    expect(parseBackupSnapshot({ ...validSnapshot, version: 2 })).toEqual({
      ok: false,
      errorCode: 'UNSUPPORTED_VERSION',
    });
  });

  it('rejects out-of-range settings', () => {
    const bad = {
      ...validSnapshot,
      settings: { ...validSnapshot.settings, defaultCycleLength: 99 },
    };
    expect(parseBackupSnapshot(bad)).toEqual({ ok: false, errorCode: 'INVALID_SETTINGS' });
  });

  it('rejects invalid dates and unknown symptom or flow enums', () => {
    const badDate = {
      ...validSnapshot,
      logs: [{ ...validSnapshot.logs[0], date: '2026-02-30' }],
    };
    expect(parseBackupSnapshot(badDate)).toEqual({ ok: false, errorCode: 'INVALID_LOGS' });

    const badSymptom = {
      ...validSnapshot,
      logs: [{ ...validSnapshot.logs[0], symptoms: ['unknown_symptom'] }],
    };
    expect(parseBackupSnapshot(badSymptom)).toEqual({ ok: false, errorCode: 'INVALID_LOGS' });
  });
});
```

Create `src/data/dexie-repository.test.ts`:
```ts
import { PinkBirdDatabase } from './db';
import { DexieCycleRepository } from './dexie-repository';

describe('DexieCycleRepository', () => {
  let db: PinkBirdDatabase;
  let repo: DexieCycleRepository;

  beforeEach(() => {
    db = new PinkBirdDatabase(`TestDB_${Math.random().toString(36).slice(2)}`);
    repo = new DexieCycleRepository(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  it('returns default settings and persists updates', async () => {
    const initial = await repo.getSettings();
    expect(initial.defaultCycleLength).toBe(28);
    expect(initial.locale).toBe('th');
    expect(initial.onboardingCompleted).toBe(false);

    const updated = await repo.updateSettings({
      defaultCycleLength: 30,
      locale: 'en',
      onboardingCompleted: true,
    });
    expect(updated.defaultCycleLength).toBe(30);
    expect(updated.locale).toBe('en');
    expect(updated.onboardingCompleted).toBe(true);
  });

  it('upserts daily logs with sync metadata and soft-deletes when emptied', async () => {
    const saved = await repo.upsertLog({
      date: '2026-11-10',
      flow: 'medium',
      symptoms: ['cramps'],
      moods: ['tired'],
      activities: [],
      note: 'Day 1',
    });
    expect(saved.syncStatus).toBe('pending');
    expect(saved.deletedAt).toBeNull();

    // Emptying all fields creates a tombstone soft delete
    await repo.upsertLog({
      date: '2026-11-10',
      flow: 'none',
      symptoms: [],
      moods: [],
      activities: [],
      note: '',
    });

    const activeLogs = await repo.getAllLogs();
    expect(activeLogs).toHaveLength(0);

    const raw = await db.logs.get('2026-11-10');
    expect(raw?.deletedAt).not.toBeNull();
  });

  it('supports bulkSetPeriodDays while preserving existing symptoms on those dates', async () => {
    await repo.upsertLog({
      date: '2026-11-01',
      flow: 'none',
      symptoms: ['headache'],
      moods: [],
      activities: [],
      note: 'Keep me',
    });

    await repo.bulkSetPeriodDays([
      { date: '2026-11-01', flow: 'medium' },
      { date: '2026-11-02', flow: 'medium' },
    ]);

    const day1 = await repo.getLogByDate('2026-11-01');
    const day2 = await repo.getLogByDate('2026-11-02');
    expect(day1?.flow).toBe('medium');
    expect(day1?.symptoms).toEqual(['headache']);
    expect(day1?.note).toBe('Keep me');
    expect(day2?.flow).toBe('medium');
  });

  it('round-trips exportSnapshot, clearAll, and importSnapshot', async () => {
    await repo.updateSettings({ defaultCycleLength: 31, onboardingCompleted: true });
    await repo.upsertLog({
      date: '2026-11-05',
      flow: 'heavy',
      symptoms: ['backache'],
      moods: ['sensitive'],
      activities: ['exercise'],
      note: 'Backed up',
    });

    const snapshot = await repo.exportSnapshot();
    await repo.clearAll();
    expect(await repo.getAllLogs()).toHaveLength(0);

    await repo.importSnapshot(snapshot);
    const restoredLogs = await repo.getAllLogs();
    const restoredSettings = await repo.getSettings();
    expect(restoredLogs).toHaveLength(1);
    expect(restoredLogs[0].note).toBe('Backed up');
    expect(restoredSettings.defaultCycleLength).toBe(31);
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run: `rtk npx vitest run src/data/backup.test.ts src/data/dexie-repository.test.ts`
Expected: FAIL because `./backup` and `./dexie-repository` do not exist.

- [ ] **Step 4: Implement `src/data/backup.ts` and `src/data/dexie-repository.ts`**

Create `src/data/backup.ts`:
```ts
import { isValidISODate } from '../domain/date-utils';
import {
  ACTIVITY_IDS,
  FLOW_LEVELS,
  MOOD_IDS,
  SYMPTOM_IDS,
  type ActivityId,
  type DailyLog,
  type FlowLevel,
  type MoodId,
  type SymptomId,
  type UserSettings,
} from '../domain/types';
import type { BackupSnapshot } from './repository';

export type BackupErrorCode =
  | 'INVALID_FORMAT'
  | 'UNSUPPORTED_VERSION'
  | 'INVALID_SETTINGS'
  | 'INVALID_LOGS';

export type ParseBackupResult =
  | { ok: true; data: BackupSnapshot }
  | { ok: false; errorCode: BackupErrorCode };

const FLOW_SET = new Set<string>(FLOW_LEVELS);
const SYMPTOM_SET = new Set<string>(SYMPTOM_IDS);
const MOOD_SET = new Set<string>(MOOD_IDS);
const ACTIVITY_SET = new Set<string>(ACTIVITY_IDS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIntInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function validateSettings(raw: unknown): UserSettings | null {
  if (!isRecord(raw)) return null;
  if (
    !isIntInRange(raw.defaultCycleLength, 18, 45) ||
    !isIntInRange(raw.defaultPeriodLength, 2, 10) ||
    !isIntInRange(raw.lutealPhaseLength, 10, 16)
  ) {
    return null;
  }
  if (raw.locale !== 'th' && raw.locale !== 'en') return null;
  if (typeof raw.onboardingCompleted !== 'boolean') return null;
  const updatedAt =
    typeof raw.updatedAt === 'string' && raw.updatedAt.length > 0
      ? raw.updatedAt
      : new Date().toISOString();

  return {
    id: 'default',
    defaultCycleLength: raw.defaultCycleLength,
    defaultPeriodLength: raw.defaultPeriodLength,
    lutealPhaseLength: raw.lutealPhaseLength,
    locale: raw.locale,
    onboardingCompleted: raw.onboardingCompleted,
    updatedAt,
  };
}

function validateLog(raw: unknown): DailyLog | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.date !== 'string' || !isValidISODate(raw.date)) return null;
  if (typeof raw.flow !== 'string' || !FLOW_SET.has(raw.flow)) return null;
  if (!Array.isArray(raw.symptoms) || !raw.symptoms.every((s) => typeof s === 'string' && SYMPTOM_SET.has(s))) {
    return null;
  }
  if (!Array.isArray(raw.moods) || !raw.moods.every((m) => typeof m === 'string' && MOOD_SET.has(m))) {
    return null;
  }
  if (
    !Array.isArray(raw.activities) ||
    !raw.activities.every((a) => typeof a === 'string' && ACTIVITY_SET.has(a))
  ) {
    return null;
  }
  if (typeof raw.note !== 'string' || raw.note.length > 1000) return null;

  const updatedAt =
    typeof raw.updatedAt === 'string' && raw.updatedAt.length > 0
      ? raw.updatedAt
      : new Date().toISOString();
  const deletedAt =
    raw.deletedAt === null || typeof raw.deletedAt === 'string' ? raw.deletedAt : null;

  return {
    date: raw.date,
    flow: raw.flow as FlowLevel,
    symptoms: Array.from(new Set(raw.symptoms as SymptomId[])),
    moods: Array.from(new Set(raw.moods as MoodId[])),
    activities: Array.from(new Set(raw.activities as ActivityId[])),
    note: raw.note,
    updatedAt,
    deletedAt,
    syncStatus: 'pending',
  };
}

export function parseBackupSnapshot(raw: unknown): ParseBackupResult {
  if (!isRecord(raw)) {
    return { ok: false, errorCode: 'INVALID_FORMAT' };
  }
  if (raw.version !== 1) {
    return { ok: false, errorCode: 'UNSUPPORTED_VERSION' };
  }
  const settings = validateSettings(raw.settings);
  if (!settings) {
    return { ok: false, errorCode: 'INVALID_SETTINGS' };
  }
  if (!Array.isArray(raw.logs)) {
    return { ok: false, errorCode: 'INVALID_LOGS' };
  }
  const logs: DailyLog[] = [];
  for (const entry of raw.logs) {
    const validated = validateLog(entry);
    if (!validated) {
      return { ok: false, errorCode: 'INVALID_LOGS' };
    }
    logs.push(validated);
  }
  const exportedAt =
    typeof raw.exportedAt === 'string' && raw.exportedAt.length > 0
      ? raw.exportedAt
      : new Date().toISOString();

  return {
    ok: true,
    data: {
      version: 1,
      exportedAt,
      settings,
      logs,
    },
  };
}
```

Create `src/data/dexie-repository.ts`:
```ts
import {
  DEFAULT_USER_SETTINGS,
  type DailyLog,
  type DailyLogInput,
  type FlowLevel,
  type ISODate,
  type UserSettings,
} from '../domain/types';
import { PinkBirdDatabase } from './db';
import type { BackupSnapshot, CycleRepository } from './repository';

function isEmptyLogInput(input: DailyLogInput): boolean {
  return (
    input.flow === 'none' &&
    input.symptoms.length === 0 &&
    input.moods.length === 0 &&
    input.activities.length === 0 &&
    input.note.trim().length === 0
  );
}

export class DexieCycleRepository implements CycleRepository {
  private readonly db: PinkBirdDatabase;

  constructor(db: PinkBirdDatabase = new PinkBirdDatabase()) {
    this.db = db;
  }

  async getAllLogs(): Promise<DailyLog[]> {
    const all = await this.db.logs.orderBy('date').toArray();
    return all.filter((log) => log.deletedAt === null);
  }

  async getLogByDate(date: ISODate): Promise<DailyLog | undefined> {
    const existing = await this.db.logs.get(date);
    if (!existing || existing.deletedAt !== null) return undefined;
    return existing;
  }

  async upsertLog(input: DailyLogInput): Promise<DailyLog> {
    const now = new Date().toISOString();
    if (isEmptyLogInput(input)) {
      await this.softDeleteLog(input.date);
      return {
        ...input,
        note: '',
        updatedAt: now,
        deletedAt: now,
        syncStatus: 'pending',
      };
    }

    const record: DailyLog = {
      ...input,
      note: input.note.trim().slice(0, 500),
      updatedAt: now,
      deletedAt: null,
      syncStatus: 'pending',
    };
    await this.db.logs.put(record);
    return record;
  }

  async bulkSetPeriodDays(updates: Array<{ date: ISODate; flow: FlowLevel }>): Promise<void> {
    if (updates.length === 0) return;
    const now = new Date().toISOString();

    await this.db.transaction('rw', this.db.logs, async () => {
      for (const { date, flow } of updates) {
        const existing = await this.db.logs.get(date);
        const base: DailyLogInput = existing && existing.deletedAt === null
          ? {
              date,
              flow,
              symptoms: existing.symptoms,
              moods: existing.moods,
              activities: existing.activities,
              note: existing.note,
            }
          : {
              date,
              flow,
              symptoms: [],
              moods: [],
              activities: [],
              note: '',
            };

        if (isEmptyLogInput(base)) {
          if (existing) {
            await this.db.logs.put({
              ...existing,
              flow: 'none',
              updatedAt: now,
              deletedAt: now,
              syncStatus: 'pending',
            });
          }
        } else {
          await this.db.logs.put({
            ...base,
            updatedAt: now,
            deletedAt: null,
            syncStatus: 'pending',
          });
        }
      }
    });
  }

  async softDeleteLog(date: ISODate): Promise<void> {
    const existing = await this.db.logs.get(date);
    if (!existing) return;
    const now = new Date().toISOString();
    await this.db.logs.put({
      ...existing,
      flow: 'none',
      symptoms: [],
      moods: [],
      activities: [],
      note: '',
      updatedAt: now,
      deletedAt: now,
      syncStatus: 'pending',
    });
  }

  async getSettings(): Promise<UserSettings> {
    const existing = await this.db.settings.get('default');
    if (existing) return existing;
    const created: UserSettings = {
      ...DEFAULT_USER_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
    await this.db.settings.put(created);
    return created;
  }

  async updateSettings(
    patch: Partial<Omit<UserSettings, 'id' | 'updatedAt'>>,
  ): Promise<UserSettings> {
    const current = await this.getSettings();
    const updated: UserSettings = {
      ...current,
      ...patch,
      id: 'default',
      updatedAt: new Date().toISOString(),
    };
    await this.db.settings.put(updated);
    return updated;
  }

  async exportSnapshot(): Promise<BackupSnapshot> {
    const [settings, logs] = await Promise.all([this.getSettings(), this.getAllLogs()]);
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      logs,
    };
  }

  async importSnapshot(snapshot: BackupSnapshot): Promise<void> {
    await this.db.transaction('rw', [this.db.logs, this.db.settings], async () => {
      await this.db.logs.clear();
      await this.db.settings.clear();
      await this.db.settings.put(snapshot.settings);
      if (snapshot.logs.length > 0) {
        await this.db.logs.bulkPut(snapshot.logs);
      }
    });
  }

  async clearAll(): Promise<void> {
    await this.db.transaction('rw', [this.db.logs, this.db.settings], async () => {
      await this.db.logs.clear();
      await this.db.settings.clear();
    });
  }
}
```

- [ ] **Step 5: Run tests and commit**

Run: `rtk npx vitest run src/data/backup.test.ts src/data/dexie-repository.test.ts`
Expected: PASS (8 tests).

```bash
rtk git add src/data/
rtk git commit -m "feat(data): add sync-ready CycleRepository, Dexie implementation, and backup validator"
```

---

### Task 5: Bilingual i18n, Cycle State Store & Shared UI Primitives

**Files:**
- Create: `src/i18n/translations.ts`, `src/i18n/I18nProvider.tsx`
- Create: `src/state/CycleProvider.tsx`
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Chip.tsx`, `src/components/ui/BottomSheet.tsx`, `src/components/ui/Skeleton.tsx`, `src/components/ui/EmptyState.tsx`
- Create: `src/components/layout/AppShell.tsx`, `src/components/layout/BottomNav.tsx`
- Test: `src/state/CycleProvider.test.tsx`

**Interfaces:**
- Consumes: `src/domain/types.ts`, `src/domain/date-utils.ts`, `src/domain/cycle-engine.ts`, `src/data/repository.ts`, `src/data/dexie-repository.ts`
- Produces:
  - `useI18n()`: `{ locale, setLocale, t }` where `t` is the strongly typed translation object for active locale
  - `CycleProvider({ repository, todayOverride, children })` and `useCycle()`:
    - `{ loading, storageError, logs, logsByDate, settings, today, summary, calendarMap, insights, saveLog, toggleTodayPeriod, clearTodayPeriod, bulkSetPeriodDays, updateSettings, completeOnboarding, exportBackup, importBackup, resetAllData }`
  - UI Primitives: `Button` (`variant: 'primary' | 'secondary' | 'ghost' | 'danger'`, `size: 'sm' | 'md' | 'lg'`), `Chip`, `BottomSheet`, `Skeleton`, `EmptyState`, `AppShell`, `BottomNav` (`TabId = 'today' | 'calendar' | 'insights' | 'settings'`).

- [ ] **Step 1: Create `src/i18n/translations.ts` and `src/i18n/I18nProvider.tsx`**

Create `src/i18n/translations.ts` containing complete, concise, natural Thai (`th`) and English (`en`) copy with ZERO emojis and ZERO em-dashes covering:
- App name, nav tabs (`วันนี้/Today`, `ปฏิทิน/Calendar`, `สถิติ/Insights`, `ตั้งค่า/Settings`)
- Onboarding steps (welcome, last period start date, skip button, period length, cycle length, finish)
- Today statuses (`no_data`, `period`, `period_due_today`, `late`, `ovulation`, `fertile`, `follicular`, `luteal`), cycle day, countdowns, conception chance labels (`low`, `medium`, `high`), quick actions (`บันทึกประจำเดือนวันนี้`, `แก้ไขบันทึกวันนี้`, `ยกเลิกวันประจำเดือนวันนี้`)
- Calendar controls (prev/next month, jump to today, edit period days mode, save/cancel, legend items, weekday short labels Sun..Sat)
- DailyLogSheet labels (all 5 `FLOW_LEVELS`, all 8 `SYMPTOM_IDS`, all 7 `MOOD_IDS`, all 3 `ACTIVITY_IDS`, note placeholder, future date notice, save/clear)
- Insights labels (average cycle, average period, variation, trend chart title & empty state, history list, ongoing badge, outlier tag, top symptoms, top moods, medical estimate disclaimer)
- Settings labels (cycle defaults, luteal phase, language switcher, export JSON, import JSON, preview count & confirm, error codes `INVALID_FORMAT`, `UNSUPPORTED_VERSION`, `INVALID_SETTINGS`, `INVALID_LOGS`, reset data confirm, storage error banner)

Create `src/i18n/I18nProvider.tsx`:
```tsx
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { Locale } from '../domain/types';
import { translations, type TranslationDict } from './translations';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationDict;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  children: ReactNode;
}

export function I18nProvider({ locale, onChangeLocale, children }: I18nProviderProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale: onChangeLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
```

- [ ] **Step 2: Create `src/state/CycleProvider.tsx` and write failing test `src/state/CycleProvider.test.tsx`**

Write `src/state/CycleProvider.test.tsx` first:
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PinkBirdDatabase } from '../data/db';
import { DexieCycleRepository } from '../data/dexie-repository';
import { CycleProvider, useCycle } from './CycleProvider';

function Probe() {
  const { loading, summary, settings, completeOnboarding, toggleTodayPeriod } = useCycle();
  if (loading) return <div>loading</div>;
  return (
    <div>
      <span data-testid="status">{summary.status}</span>
      <span data-testid="onboarded">{String(settings.onboardingCompleted)}</span>
      <button
        onClick={() =>
          completeOnboarding({
            lastPeriodStart: '2026-11-18',
            defaultPeriodLength: 5,
            defaultCycleLength: 28,
          })
        }
      >
        finish-onboarding
      </button>
      <button onClick={() => toggleTodayPeriod()}>log-today</button>
    </div>
  );
}

describe('CycleProvider', () => {
  it('completes onboarding, seeds period clamped to today, and updates cycle status', async () => {
    const db = new PinkBirdDatabase(`ProviderTest_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    const user = userEvent.setup();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Probe />
      </CycleProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('no_data'));
    await user.click(screen.getByText('finish-onboarding'));

    await waitFor(() => expect(screen.getByTestId('onboarded')).toHaveTextContent('true'));
    expect(screen.getByTestId('status')).toHaveTextContent('period');

    const logs = await repo.getAllLogs();
    // 2026-11-18 and 2026-11-19 only (never seeds future 2026-11-20..22)
    expect(logs.map((l) => l.date)).toEqual(['2026-11-18', '2026-11-19']);
    await db.delete();
  });
});
```

Run `rtk npx vitest run src/state/CycleProvider.test.tsx` (expect FAIL).

Implement `src/state/CycleProvider.tsx` with:
- Loads `settings` and `logs` on mount from `repository` (defaulting to singleton `DexieCycleRepository`)
- Catches IndexedDB errors into `storageError`
- Memoizes `logsByDate`, `summary = computeCycleSummary(logs, settings, today)`, `calendarMap = buildCalendarMap(logs, settings, today, 6)`, `insights = computeInsights(logs, today)`
- Actions: `saveLog`, `toggleTodayPeriod` (sets `flow: 'medium'` on `today`), `clearTodayPeriod` (sets `flow: 'none'` on `today`), `bulkSetPeriodDays`, `updateSettings`, `completeOnboarding` (clamps seeded dates to `<= today`), `exportBackup`, `importBackup`, `resetAllData`.

- [ ] **Step 3: Create shared UI primitives & layout shell (`src/components/ui/*`, `src/components/layout/*`)**

Implement strictly following `DESIGN.md`:
- `Button.tsx`: pill radius (`rounded-full`), `min-h-11`, `coral-rose` primary / `coral-rose-soft` secondary / ghost / danger variants, `active:scale-[0.98]`, `transition-[background-color,color,transform] duration-[180ms]`, disabled state.
- `Chip.tsx`: pill toggle chip (`aria-pressed`), `min-h-10`, unselected `bg-tinted-subtle border-transparent text-ink-primary`, selected `bg-coral-rose-soft border-coral-rose text-coral-rose-ink`.
- `BottomSheet.tsx`: mobile slide-up sheet anchored to bottom inside the app frame (not centered popup modal), soft backdrop (`bg-ink-primary/25`), handle bar, sticky header with close button, scrollable body, Escape key support, `shadow-[var(--shadow-sheet)]`.
- `Skeleton.tsx`: warm `bg-tinted-subtle animate-pulse` placeholder blocks.
- `EmptyState.tsx`: calm tinted circular icon, concise title, short guidance body, and primary action button.
- `AppShell.tsx`: full-bleed on mobile, centered `max-w-[430px] min-h-dvh mx-auto bg-warm-surface sm:border-x sm:border-rose-hairline flex flex-col` on desktop.
- `BottomNav.tsx`: sticky 4-tab bar (`Today`, `Calendar`, `Insights`, `Settings`) with Lucide icons (`Sparkles`/`CircleDot` or `HeartPulse` -> use clean `Sun`, `Calendar`, `BarChart3`, `Settings`), active top indicator pill (`bg-coral-rose`), `min-h-[68px]`, `pb-[env(safe-area-inset-bottom)]`.

- [ ] **Step 4: Run tests and commit**

Run: `rtk npx vitest run src/state/CycleProvider.test.tsx && rtk npm run typecheck`
Expected: PASS.

```bash
rtk git add src/i18n/ src/state/ src/components/
rtk git commit -m "feat(core): add TH/EN i18n, CycleProvider store, and OKLCH UI primitives"
```

---

### Task 6: First-Run Onboarding Flow & Quick Daily Log Bottom Sheet

**Files:**
- Create: `src/features/onboarding/OnboardingFlow.tsx`
- Create: `src/features/daily-log/DailyLogSheet.tsx`
- Test: `src/features/onboarding/OnboardingFlow.test.tsx`
- Test: `src/features/daily-log/DailyLogSheet.test.tsx`

**Interfaces:**
- Consumes: `useCycle()`, `useI18n()`, `Button`, `Chip`, `BottomSheet`
- Produces:
  - `OnboardingFlow` component (renders 3-step setup with progress dots, back/next, skip option, native date input capped at `today`, numeric steppers for period length 2..10 and cycle length 18..45)
  - `DailyLogSheet({ date, open, onClose })` component (renders 5 tap-to-select sections for flow, symptoms, moods, activities, note; guards dates strictly after `today` with read-only predicted summary; saves via `saveLog`)

- [ ] **Step 1: Write failing tests in `src/features/onboarding/OnboardingFlow.test.tsx` and `src/features/daily-log/DailyLogSheet.test.tsx`**

Test scenarios:
- `OnboardingFlow`: walks through Step 1 (choose last period date), Step 2 (adjust period length), Step 3 (adjust cycle length) and submits; also tests clicking Skip on Step 1 completes onboarding with zero seeded logs.
- `DailyLogSheet`: opens for `2026-11-19`, toggles flow (`heavy`), symptom (`cramps`), mood (`calm`), types note, clicks Save -> persists to repository and closes; opens for future date `2026-11-25` -> shows predicted info and disables logging inputs.

- [ ] **Step 2: Run tests to verify failure**

Run: `rtk npx vitest run src/features/onboarding/OnboardingFlow.test.tsx src/features/daily-log/DailyLogSheet.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `OnboardingFlow.tsx` and `DailyLogSheet.tsx`**

Follow `DESIGN.md`:
- Generous breathing room, single clean progress indicator (3 thin pills), no nested cards, stepper buttons with `min-w-11 min-h-11`, accessible labels (`aria-label`).
- In `DailyLogSheet`: show selected date formatted via `formatFullDate(date, locale)` + day status pill (period / fertile / ovulation / predicted) in header; horizontal flow intensity selector; wrapping `Chip` groups for Symptoms, Moods, Activities; compact `<textarea>` for note with character counter `0/500`; sticky bottom Save button.

- [ ] **Step 4: Run tests and commit**

Run: `rtk npx vitest run src/features/onboarding/OnboardingFlow.test.tsx src/features/daily-log/DailyLogSheet.test.tsx`
Expected: PASS.

```bash
rtk git add src/features/onboarding/ src/features/daily-log/
rtk git commit -m "feat(ui): add 3-step onboarding flow and quick DailyLogSheet"
```

---

### Task 7: Today Dashboard & Signature PinkBird Cycle Ring

**Files:**
- Create: `src/features/today/CycleRing.tsx`
- Create: `src/features/today/TodayLogSummary.tsx`
- Create: `src/features/today/TodayView.tsx`
- Test: `src/features/today/TodayView.test.tsx`

**Interfaces:**
- Consumes: `useCycle()`, `useI18n()`, `Button`, `EmptyState`, `formatFullDate`, `formatShortDate`
- Produces:
  - `CycleRing({ summary })`: 240px SVG circular progress dial with semantic arc color (`coral-rose` for period/due, `fertile-sage` for fertile/ovulation, `amber-late` for late, soft coral for follicular/luteal), Display-scale main label/number with `tabular-nums`, cycle day caption, and conception chance badge.
  - `TodayLogSummary({ log, onEdit })`: Clean hairline-separated summary of today's logged flow/symptoms/moods/activities/note with quick edit trigger.
  - `TodayView({ onOpenLog })`: Full Today screen with top bar (today's date + TH/EN compact pill switcher), `CycleRing`, primary one-tap Period action + secondary edit/clear action, next key dates strip (next period & ovulation date), and `TodayLogSummary`.

- [ ] **Step 1: Write failing tests in `src/features/today/TodayView.test.tsx`**

Test scenarios:
- Empty state (`no_data`): shows helpful empty state and primary CTA to log period today; clicking it immediately logs today's period and transitions into active Period Day 1 ring.
- Active period state: shows "ประจำเดือนวันที่ 1" (or English equivalent when toggled), shows Edit Log button and Clear Period Today button.
- Late period state: displays overdue day count clearly without fabricating next cycle.

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npx vitest run src/features/today/TodayView.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `CycleRing.tsx`, `TodayLogSummary.tsx`, and `TodayView.tsx`**

Ensure zero `impeccable` anti-patterns:
- Flat-by-default warm surfaces, hairline dividers (`border-rose-hairline`), no side-stripe borders, no gradient text, no nested cards.
- Smooth SVG `stroke-dashoffset` transition (`210ms var(--ease-out-expo)`).

- [ ] **Step 4: Run tests and commit**

Run: `rtk npx vitest run src/features/today/TodayView.test.tsx`
Expected: PASS.

```bash
rtk git add src/features/today/
rtk git commit -m "feat(today): add PinkBird-style CycleRing dashboard and quick log summary"
```

---

### Task 8: Monthly Calendar View & Multi-Day Period Edit Mode

**Files:**
- Create: `src/features/calendar/CalendarLegend.tsx`
- Create: `src/features/calendar/PeriodEditBanner.tsx`
- Create: `src/features/calendar/MonthGrid.tsx`
- Create: `src/features/calendar/CalendarView.tsx`
- Test: `src/features/calendar/CalendarView.test.tsx`

**Interfaces:**
- Consumes: `useCycle()`, `useI18n()`, `getMonthGrid`, `addMonths`, `formatMonthYear`, `compareDates`, `Button`
- Produces:
  - `CalendarView({ onSelectDate })`: Month navigation (prev/next + Jump to Today), `MonthGrid` with dual-cue cells, `CalendarLegend`, and toggleable "Edit Period Days" mode (`PeriodEditBanner` with Save/Cancel committing staged diffs through `bulkSetPeriodDays`).

- [ ] **Step 1: Write failing tests in `src/features/calendar/CalendarView.test.tsx`**

Test scenarios:
- Renders current month grid, highlights logged period days (`data-phase="logged-period"`), predicted period days (`data-phase="predicted-period"`), fertile window (`data-phase="fertile"`), and ovulation day (`data-phase="ovulation"`).
- Tapping a date in normal mode invokes `onSelectDate(date)`.
- Navigating to next/previous month updates month heading; clicking Today returns to current month.
- Entering "Edit Period Days" mode, tapping 3 past dates, and clicking Save persists all 3 days via `bulkSetPeriodDays` (and blocks selecting future dates beyond `today`).

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npx vitest run src/features/calendar/CalendarView.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `CalendarLegend.tsx`, `PeriodEditBanner.tsx`, `MonthGrid.tsx`, and `CalendarView.tsx`**

Dual-cue day cell styling per `DESIGN.md`:
- Logged period: solid `bg-coral-rose text-warm-surface font-semibold` circle
- Predicted period: `bg-predicted-blush text-coral-rose-ink border-[1.5px] border-dashed border-coral-rose` circle
- Ovulation: `bg-fertile-sage-soft text-fertile-sage-ink ring-2 ring-fertile-sage` circle with tiny sage dot
- Fertile window: `bg-fertile-sage-soft text-fertile-sage-ink` circle
- Today outline: crisp ring/dot marker so today is always unmistakable
- Non-flow logged symptoms/moods: subtle 4px dot beneath day number
- Every cell minimum `min-h-11` (`44px`) touch target, `tabular-nums`.

- [ ] **Step 4: Run tests and commit**

Run: `rtk npx vitest run src/features/calendar/CalendarView.test.tsx`
Expected: PASS.

```bash
rtk git add src/features/calendar/
rtk git commit -m "feat(calendar): add monthly cycle calendar with dual-cue markers and bulk period edit"
```

---

### Task 9: Insights & Trends View, Settings & JSON Backup View, and Full App Integration

**Files:**
- Create: `src/features/insights/CycleTrendChart.tsx`
- Create: `src/features/insights/CycleHistoryList.tsx`
- Create: `src/features/insights/TopPatternsList.tsx`
- Create: `src/features/insights/InsightsView.tsx`
- Create: `src/features/settings/BackupControls.tsx`
- Create: `src/features/settings/SettingsView.tsx`
- Modify: `src/App.tsx`
- Delete: `src/App.smoke.test.tsx`
- Create: `src/App.test.tsx`

**Interfaces:**
- Consumes: `useCycle()`, `useI18n()`, `parseBackupSnapshot`, all shared UI primitives & feature views
- Produces: Complete wired application inside `App.tsx` (CycleProvider -> I18nProvider -> OnboardingFlow OR AppShell + 4 Tabs + DailyLogSheet).

- [ ] **Step 1: Write failing integration tests in `src/App.test.tsx`**

Test scenarios:
- First-run user sees Onboarding -> completes onboarding -> lands on Today tab with active status.
- Switches between Today, Calendar, Insights, and Settings tabs cleanly.
- Switches language from Thai (`th`) to English (`en`) and verifies labels update immediately across tabs and persist to repository.
- Insights view displays average cycle/period metrics, history rows, and top symptoms when multi-cycle data is present, and instructive empty state when empty.
- Settings view updates default cycle length, exports JSON backup, rejects invalid JSON import with localized error, imports valid JSON after confirmation, and resets data after confirmation.

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npx vitest run src/App.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement Insights views, Settings views, and wire `src/App.tsx`**

Highlights:
- `CycleTrendChart`: Clean responsive SVG bar chart of the last 6 completed cycles with dashed horizontal average line (`coral-rose` bars, `tabular-nums` values on top of each bar, `role="img"` + accessible summary).
- `CycleHistoryList`: Single grouped `warm-surface` list with 1px `rose-hairline` dividers (no stacked identical cards), showing start to end range, period length, and cycle length (or "Ongoing / รอบปัจจุบัน" for the latest cycle).
- `TopPatternsList`: Clean frequency bars for top logged symptoms and moods.
- `BackupControls`: Export JSON blob download (`pinkbird-backup-YYYY-MM-DD.json`), Import file picker validating via `parseBackupSnapshot` -> shows preview sheet with log count + Confirm/Cancel; Reset All Data opens BottomSheet confirmation (never `window.confirm`).
- `SettingsView`: Cycle length (18-45), period length (2-10), luteal phase (10-16) steppers, TH/EN segmented control, BackupControls, privacy summary & medical disclaimer.
- `App.tsx`: Connects `CycleProvider`, `I18nProvider`, loading skeleton, storage error recovery banner, `OnboardingFlow`, 4-tab `AppShell` + `BottomNav`, and shared `DailyLogSheet`.

- [ ] **Step 4: Run full test suite, typecheck, and production build; commit**

Run:
```bash
rtk npm run typecheck
rtk npm run test -- --run
rtk npm run build
```
Expected: All tests pass, zero TypeScript errors, clean production build.

```bash
rtk git add src/
rtk git commit -m "feat(app): add Insights, Settings with JSON backup, and wire full PinkBird PWA"
```

---

### Task 10: Final Verification, Impeccable Visual Audit & Live Browser Inspection

**Files:**
- Modify (only if polish/audit issues are discovered during live inspection): targeted component or token files
- Verify: `DESIGN.md` & `PRODUCT.md` alignment

- [ ] **Step 1: Run complete automated verification**

Run:
```bash
rtk npm run typecheck
rtk npm run test -- --run
rtk npm run build
```
Expected: 100% pass, zero warnings/errors.

- [ ] **Step 2: Start Vite preview server and inspect live app in mobile (`390x844`) and desktop (`1280x800`) viewports**

Use Chrome DevTools MCP (`new_page`, `resize_page`, `take_screenshot`, `list_console_messages`) to verify:
- Onboarding flow renders cleanly in Thai (`th`) with crisp `Noto Sans Thai` typography and zero clipping.
- Today CycleRing, Calendar dual-cue cells, DailyLogSheet bottom sheet, Insights SVG chart, and Settings view all match `DESIGN.md` (OKLCH warm blush tones, zero horizontal overflow, >=44px tap targets, zero console errors).
- Instant TH / EN switch works cleanly without text overflow.
- PWA manifest loads cleanly (`manifest.webmanifest`).

- [ ] **Step 3: Fix any visual or polish issues found, re-run full verification, and commit**

Run:
```bash
rtk npm run typecheck
rtk npm run test -- --run
rtk npm run build
```
If any polish edits were made:
```bash
rtk git add -A
rtk git commit -m "polish(ui): refine spacing, contrast, and responsive alignment from visual audit"
```
