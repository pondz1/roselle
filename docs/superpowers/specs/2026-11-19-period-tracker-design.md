# Roselle Period Tracker PWA Design Specification

**Date:** 2026-11-19  
**Status:** Approved Design (Pending Final Spec Review)  
**Platform:** Mobile-first Web App / PWA  
**Stack:** Vite + React 19 + TypeScript + Tailwind CSS v4 + Dexie (IndexedDB) + vite-plugin-pwa + Vitest  

---

## 1. Purpose and Scope

Build Roselle, a private, local-first menstrual cycle tracking Progressive Web App. Users can open the app on mobile or desktop immediately without creating an account, track their menstrual periods, view upcoming cycle/ovulation/fertile window predictions, log daily symptoms and moods in seconds, and inspect personal cycle history and trends.

### In Scope (v1)
- Mobile-first PWA installable on home screen and fully functional offline.
- Bilingual UI: Thai (`th`) default with instant switch to English (`en`).
- Quick 3-step first-run onboarding (with skip option).
- **Today (Dashboard)**: Signature circular cycle ring, cycle day, countdown or active period day or late-period alert, daily conception chance badge, one-tap start/end period action, and today's quick daily log summary.
- **Calendar**: Monthly calendar grid showing historical logged period days, predicted upcoming period days (6-month projection), fertile window, ovulation day, and logged-symptom dots; tap any date to view status and edit logs; multi-day period edit mode for bulk adjustments.
- **Insights**: Summary statistics (average cycle length, average period length, cycle variation), recent cycle length trend chart, chronological period history list, and top logged symptoms/moods frequency breakdown.
- **Settings**: Configurable default cycle length, default period length, luteal phase length (10-16 days), TH/EN language toggle, JSON Export/Import backup with strict schema validation, and confirmed local data reset.
- Decoupled, sync-ready `CycleRepository` data layer backed by IndexedDB (`Dexie.js`) so Cloud Sync can be added later without modifying UI or domain logic.

### Explicitly Out of Scope (v1)
- User authentication, accounts, or live cloud backend synchronization.
- PIN / biometric app lock.
- Browser push notifications or pill reminders.
- Educational articles or social community feed.

---

## 2. Visual Design and UX Architecture

Visual tokens, typography, elevation rules, and component guidelines are formally specified in `PRODUCT.md` and `DESIGN.md` at the repository root, following the `impeccable` Product Register:

- **Viewport Strategy**: Full-bleed responsive layout on mobile screens (`<= 480px`); centered mobile app shell (`max-w-[430px]`, full viewport height, subtle `rose-hairline` border) over a soft `blush-canvas` background on larger desktop viewports.
- **Color System**: OKLCH warm-blush neutrals (`blush-canvas`, `warm-surface`, `tinted-subtle`, `rose-hairline`) with semantic accents:
  - Logged period: solid `coral-rose`
  - Predicted period: `predicted-blush` fill + dashed `coral-rose` outline
  - Fertile window: `fertile-sage-soft` fill + `fertile-sage-ink` text
  - Ovulation day: solid `fertile-sage` ring + accent dot
  - Late period: calm `amber-late-soft` + `amber-late`
- **Navigation**: Sticky 4-tab Bottom Navigation Bar (`Today`, `Calendar`, `Insights`, `Settings`) with active state indicator and safe-area padding (`env(safe-area-inset-bottom)`).
- **Daily Log Bottom Sheet**: Triggered from Today or by tapping a day on Calendar. Tap-to-select chips across 5 groups:
  1. **Flow**: `none`, `spotting`, `light`, `medium`, `heavy`
  2. **Symptoms**: `cramps`, `backache`, `headache`, `tender_breasts`, `bloating`, `fatigue`, `acne`, `nausea`
  3. **Moods**: `calm`, `happy`, `sensitive`, `irritable`, `sad`, `anxious`, `tired`
  4. **Activities**: `protected_sex`, `unprotected_sex`, `exercise`
  5. **Note**: Single compact multiline textarea (optional, max 500 chars)
- **Onboarding**: Shown only when `settings.onboardingCompleted === false`. Steps: (1) Last period start date (optional/skippable), (2) Typical period length (default 5, range 2-10), (3) Typical cycle length (default 28, range 18-45). Submitting seeds the initial period days (from last period start date for `defaultPeriodLength` days, clamped so it never seeds future dates beyond today) and marks onboarding complete.

---

## 3. Domain Model and Cycle Prediction Engine

All domain calculations live in `src/domain/` as pure TypeScript functions with zero React or database dependencies.

### 3.1 Date Handling (`src/domain/date-utils.ts`)
- Every calendar date is represented as an ISO local date string `ISODate = "YYYY-MM-DD"`.
- Arithmetic (`addDays`, `diffDays`, `compareDates`, `getMonthGrid`, `todayISO`) parses `YYYY-MM-DD` strictly in UTC midnight (`Date.UTC(y, m - 1, d)`) to eliminate local timezone and DST drift.

### 3.2 Core Types (`src/domain/types.ts`)
```ts
export type ISODate = string; // YYYY-MM-DD
export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
export type Locale = 'th' | 'en';
export type SyncStatus = 'local' | 'pending' | 'synced';
export type ConceptionChance = 'low' | 'medium' | 'high';

export type SymptomId =
  | 'cramps' | 'backache' | 'headache' | 'tender_breasts'
  | 'bloating' | 'fatigue' | 'acne' | 'nausea';

export type MoodId =
  | 'calm' | 'happy' | 'sensitive' | 'irritable'
  | 'sad' | 'anxious' | 'tired';

export type ActivityId = 'protected_sex' | 'unprotected_sex' | 'exercise';

export interface DailyLog {
  date: ISODate; // Primary key
  flow: FlowLevel;
  symptoms: SymptomId[];
  moods: MoodId[];
  activities: ActivityId[];
  note: string;
  updatedAt: string; // ISO-8601 UTC timestamp
  deletedAt: string | null; // Tombstone for future cloud sync
  syncStatus: SyncStatus;
}

export interface UserSettings {
  id: 'default';
  defaultCycleLength: number; // default 28, valid 18..45
  defaultPeriodLength: number; // default 5, valid 2..10
  lutealPhaseLength: number; // default 14, valid 10..16
  locale: Locale; // default 'th'
  onboardingCompleted: boolean;
  updatedAt: string;
}
```

### 3.3 Prediction Rules (`src/domain/cycle-engine.ts`)
1. **Active Period Days**: Filter logs where `deletedAt === null && flow !== 'none'`. Sort ascending by `date`.
2. **Episode Grouping**:
   - Group sorted period dates into `PeriodEpisode` objects (`startDate`, `endDate`, `loggedDays`, `lengthDays`).
   - A period date joins the current episode if it is within `<= 2` calendar days of the previous logged period date AND `< 14` days from the current episode's `startDate`.
   - Otherwise, it begins a new `PeriodEpisode` (starting a new cycle).
   - `lengthDays` of an episode is `diffDays(startDate, endDate) + 1`.
3. **Completed Cycles**:
   - For consecutive episodes `i` and `i + 1`, `cycleLength = diffDays(episodes[i].startDate, episodes[i + 1].startDate)`.
   - Valid cycles for statistical averaging satisfy `15 <= cycleLength <= 60` (outliers outside this range remain visible in history but are excluded from prediction weights).
4. **Weighted Averages**:
   - Take up to the 6 most recent valid completed cycles `[c_1, ..., c_k]` ordered oldest to newest.
   - Weighted cycle length: `round(sum(c_i * i) / sum(i))` for `i = 1..k`. If `k === 0`, use `settings.defaultCycleLength`.
   - Predicted period length: simple rounded average of up to the 6 most recent completed episodes (excluding an ongoing episode that started `< defaultPeriodLength` days ago relative to `today`), clamped to `[2, 10]`. Fallback: `settings.defaultPeriodLength`.
5. **Current Status and Projections**:
   - If no episodes exist: return `status = 'no_data'`, zero fabricated predictions.
   - Let `latest = episodes[episodes.length - 1]`.
   - `currentCycleDay = diffDays(latest.startDate, today) + 1` (for `today >= latest.startDate`).
   - `nextPeriodStart = addDays(latest.startDate, predictedCycleLength)`.
   - `daysUntilNextPeriod = diffDays(today, nextPeriodStart)`.
   - **Status priority (evaluated top-to-bottom)**:
     1. `'period'`: `today` has a logged flow (`flow !== 'none'`), OR `today` falls strictly inside `[latest.startDate, latest.endDate]`. Reports `periodDay = diffDays(latest.startDate, today) + 1`.
     2. `'period_due_today'`: `daysUntilNextPeriod === 0`.
     3. `'late'`: `daysUntilNextPeriod < 0`. Reports `daysLate = Math.abs(daysUntilNextPeriod)`.
     4. `'ovulation'`: `today === currentCycleOvulationDate`.
     5. `'fertile'`: `today` is within `[currentCycleFertileStart, currentCycleFertileEnd]` (excluding ovulation day).
     6. `'follicular'` or `'luteal'`: remaining days before/after ovulation, showing `daysUntilNextPeriod` countdown.
   - **Remaining Predicted Period Days of Current Episode**: If `today` is within `[addDays(latest.startDate, 1), addDays(latest.startDate, predictedPeriodLength - 1)]` and `today` has not yet been logged as period, those unlogged days up to `addDays(latest.startDate, predictedPeriodLength - 1)` render on the calendar as predicted period days (dashed blush) so the user can confirm or ignore them naturally.
   - **Fertile and Ovulation**:
     - For any cycle starting at `cycleStart` with length `L` and `cycleEndStart = addDays(cycleStart, L)`:
       - `ovulationDate = addDays(cycleEndStart, -settings.lutealPhaseLength)`
       - `fertileStart = addDays(ovulationDate, -5)`
       - `fertileEnd = addDays(ovulationDate, 1)`
     - Conception chance for date `d`:
       - `'high'`: `diffDays(ovulationDate, d)` in `[-2, 0]` (2 days before ovulation through ovulation day)
       - `'medium'`: `diffDays(ovulationDate, d)` in `[-5, -3]` or `1`
       - `'low'`: all other days (and always `'low'` if `d` is a logged period day)
   - **6-Cycle Calendar Projection**:
     - Current cycle (`n = 0`) is anchored at `latest.startDate` for fertile/ovulation dates.
     - Future cycles (`n = 1, 2, ...`) start at `addDays(latest.startDate, predictedCycleLength * n)`. Include the first 6 future cycles whose `cycleStart > today` (so overdue cycles never paint predicted period days in the past).
6. **Insights Aggregation (`computeInsights`)**:
   - `averageCycleLength`, `averagePeriodLength`, `shortestCycle`, `longestCycle`, `cycleVariation` (`longest - shortest`), `completedCycleCount`.
   - `cycleHistory`: list of episodes (newest first) with `startDate`, `endDate`, `periodLength`, and `cycleLength` (null for the ongoing latest cycle).
   - `topSymptoms` and `topMoods`: sorted counts across all non-deleted logs (with percentage of logged days).

---

## 4. Data Layer and Sync-Ready Architecture

### 4.1 Repository Interface (`src/data/repository.ts`)
```ts
export interface BackupSnapshot {
  version: 1;
  exportedAt: string;
  settings: UserSettings;
  logs: DailyLog[];
}

export interface CycleRepository {
  getAllLogs(): Promise<DailyLog[]>;
  getLogByDate(date: ISODate): Promise<DailyLog | undefined>;
  upsertLog(input: Omit<DailyLog, 'updatedAt' | 'deletedAt' | 'syncStatus'>): Promise<DailyLog>;
  bulkSetPeriodDays(dates: ISODate[], flow: FlowLevel): Promise<void>;
  softDeleteLog(date: ISODate): Promise<void>;
  getSettings(): Promise<UserSettings>;
  updateSettings(patch: Partial<Omit<UserSettings, 'id' | 'updatedAt'>>): Promise<UserSettings>;
  exportSnapshot(): Promise<BackupSnapshot>;
  importSnapshot(snapshot: BackupSnapshot): Promise<void>;
  clearAll(): Promise<void>;
}
```

### 4.2 Local Implementation (`src/data/dexie-repository.ts`)
- IndexedDB database `RoselleCycleDB` (version 1):
  - `logs`: `&date, updatedAt, syncStatus`
  - `settings`: `&id`
- Any write automatically stamps `updatedAt = new Date().toISOString()` and `syncStatus = 'pending'` (ready for a future `SyncedCycleRepository` decorator to push dirty records and pull remote deltas).
- Empty log cleanup: if a user clears flow (`'none'`), symptoms (`[]`), moods (`[]`), activities (`[]`), and note (`''`), the repository calls `softDeleteLog(date)` (setting `deletedAt`) rather than hard deleting, preserving tombstone semantics for future multi-device sync.

### 4.3 Backup Validation (`src/data/backup.ts`)
- Pure validator `parseBackupSnapshot(raw: unknown)` checks:
  - `version === 1`
  - Valid `settings` numeric ranges (`defaultCycleLength` 18..45, `defaultPeriodLength` 2..10, `lutealPhaseLength` 10..16, `locale` in `['th', 'en']`)
  - Valid `logs` array where every `date` matches `/^\d{4}-\d{2}-\d{2}$/` and represents a real calendar date, and every `flow`, `symptoms`, `moods`, `activities` entry belongs to the allowed enum sets.
- Returns a typed result `{ ok: true, data: BackupSnapshot } | { ok: false, errorCode: BackupErrorCode }` so UI displays localized Thai/EN error messages.

---

## 5. Application Structure and Data Flow

```text
src/
  domain/
    types.ts
    date-utils.ts
    cycle-engine.ts
  data/
    repository.ts
    db.ts
    dexie-repository.ts
    backup.ts
  i18n/
    translations.ts
    I18nProvider.tsx
  state/
    CycleProvider.tsx
  components/
    ui/
      Button.tsx
      Chip.tsx
      BottomSheet.tsx
      Skeleton.tsx
      EmptyState.tsx
    layout/
      AppShell.tsx
      BottomNav.tsx
  features/
    onboarding/
      OnboardingFlow.tsx
    today/
      TodayView.tsx
      CycleRing.tsx
      TodayLogSummary.tsx
    calendar/
      CalendarView.tsx
      MonthGrid.tsx
      CalendarLegend.tsx
      PeriodEditBanner.tsx
    insights/
      InsightsView.tsx
      CycleTrendChart.tsx
      CycleHistoryList.tsx
      TopPatternsList.tsx
    daily-log/
      DailyLogSheet.tsx
    settings/
      SettingsView.tsx
      BackupControls.tsx
  styles/
    tokens.css
    globals.css
  App.tsx
  main.tsx
```

### Data Flow
1. `CycleProvider` loads `settings` and active `logs` from the injected `CycleRepository` on mount (defaulting to `DexieCycleRepository`, injectable with an in-memory or `fake-indexeddb` repo in tests).
2. Derived cycle state (`cycleSummary`, `calendarMap`, `insights`) is computed synchronously via `useMemo` from `(logs, settings, todayISO)`.
3. User actions (quick Start/End Period, Daily Log save, Calendar bulk edit, Settings update) write through `CycleRepository`, update local React state immediately, and recompute predictions automatically.
4. `I18nProvider` syncs with `settings.locale` (`th` default), persists locale changes to `CycleRepository`, and sets `document.documentElement.lang`.

---

## 6. Error Handling and Edge Cases

- **IndexedDB Failure**: If IndexedDB throws on open (e.g., restricted private browsing), `CycleProvider` catches the error and renders a clear localized recovery banner instead of crashing.
- **Future Date Logging**: Users can view predicted future dates on Calendar, but logging period flow/symptoms is disabled for dates strictly after `todayISO` with a gentle localized explanation.
- **Period Quick-Toggle on Today**:
  - When `todayISO` has `flow === 'none'`: primary button reads "Log Period Today" (`บันทึกประจำเดือนวันนี้`) and immediately sets `flow: 'medium'` on `todayISO` (keeping any existing symptoms/moods/notes).
  - When `todayISO` already has `flow !== 'none'`: primary button opens the Daily Log sheet for `todayISO` (to adjust flow intensity or symptoms) alongside a quiet secondary button "Clear Period Today" (`ยกเลิกวันประจำเดือนวันนี้`) that resets `flow` to `'none'` for `todayISO` only, preventing accidental deletion of previous days.
- **Invalid JSON Backup**: Shows localized validation error without modifying existing data. Valid JSON shows summary preview (number of logged days) and requires explicit confirmation before replacing local data.

---

## 7. PWA Configuration

- Configured via `vite-plugin-pwa` with `registerType: 'autoUpdate'`, precaching static assets and Google Fonts fallback.
- Web App Manifest:
  - `name`: "Roselle Cycle Tracker"
  - `short_name`: "Roselle"
  - `display`: `"standalone"`
  - `theme_color`: `"#fcf7f8"`
  - `background_color`: `"#fcf7f8"`
  - Custom minimal SVG/PNG app icons (192x192 and 512x512) in coral-rose/blush aesthetic.

---

## 8. Testing and Verification Plan

1. **Unit Tests (Vitest)**:
   - `date-utils.test.ts`: leap year (`2024-02-29`), month boundaries, year transitions, `diffDays`/`addDays` symmetry.
   - `cycle-engine.test.ts`: empty state, single episode fallback to defaults, weighted average across 6+ cycles, outlier exclusion (`<15` or `>60` days), 1-2 day gap merging within one episode, ovulation/fertile window/conception chance boundaries, late period detection, insights aggregation.
   - `backup.test.ts`: valid snapshot parsing, malformed JSON, invalid dates, out-of-range settings, unknown enum values.
2. **Repository Tests (Vitest + `fake-indexeddb`)**:
   - `dexie-repository.test.ts`: upsert, update timestamps, soft delete on empty log, bulk period set, settings persistence, export/import round-trip, clearAll.
3. **Component & Flow Tests (Vitest + React Testing Library)**:
   - Onboarding completion and skip path.
   - Today view status display and quick period logging.
   - DailyLogSheet chip selection and persistence.
   - Calendar date selection and multi-day edit mode.
   - TH / EN instant language switching.
4. **Live Browser Verification**:
   - Run production build (`npm run build`) and dev/preview server.
   - Inspect in mobile viewport (`390x844`) and desktop viewport (`1280x800`) to verify visual craft against `DESIGN.md`, touch targets, Thai typography rendering, zero console errors, and offline/PWA manifest registration.
