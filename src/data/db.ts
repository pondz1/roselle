import Dexie, { type EntityTable } from 'dexie';
import type { DailyLog, UserSettings } from '../domain/types';

export class RoselleDatabase extends Dexie {
  logs!: EntityTable<DailyLog, 'date'>;
  settings!: EntityTable<UserSettings, 'id'>;

  constructor(name = 'RoselleCycleDB') {
    super(name);
    this.version(1).stores({
      logs: '&date, updatedAt, syncStatus',
      settings: '&id',
    });
  }
}
