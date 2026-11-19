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
        const base: DailyLogInput =
          existing && existing.deletedAt === null
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
