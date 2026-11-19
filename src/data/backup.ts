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
  if (
    !Array.isArray(raw.symptoms) ||
    !raw.symptoms.every((s) => typeof s === 'string' && SYMPTOM_SET.has(s))
  ) {
    return null;
  }
  if (
    !Array.isArray(raw.moods) ||
    !raw.moods.every((m) => typeof m === 'string' && MOOD_SET.has(m))
  ) {
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
