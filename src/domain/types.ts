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
  periodEnded?: boolean;
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
  isExplicitlyEnded: boolean;
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
