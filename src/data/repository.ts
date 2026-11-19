import type { DailyLog, DailyLogInput, FlowLevel, ISODate, UserSettings } from '../domain/types';

export interface BackupSnapshot {
  version: 1;
  exportedAt: string;
  settings: UserSettings;
  logs: DailyLog[];
}

export interface PeriodDayUpdate {
  date: ISODate;
  flow: FlowLevel;
  periodEnded?: boolean;
}

export interface CycleRepository {
  getAllLogs(): Promise<DailyLog[]>;
  getLogByDate(date: ISODate): Promise<DailyLog | undefined>;
  upsertLog(input: DailyLogInput): Promise<DailyLog>;
  bulkSetPeriodDays(updates: PeriodDayUpdate[]): Promise<void>;
  softDeleteLog(date: ISODate): Promise<void>;
  getSettings(): Promise<UserSettings>;
  updateSettings(patch: Partial<Omit<UserSettings, 'id' | 'updatedAt'>>): Promise<UserSettings>;
  exportSnapshot(): Promise<BackupSnapshot>;
  importSnapshot(snapshot: BackupSnapshot): Promise<void>;
  clearAll(): Promise<void>;
}
