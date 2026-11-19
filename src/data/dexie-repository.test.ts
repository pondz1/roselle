import { RoselleDatabase } from './db';
import { DexieCycleRepository } from './dexie-repository';

describe('DexieCycleRepository', () => {
  let db: RoselleDatabase;
  let repo: DexieCycleRepository;

  beforeEach(() => {
    db = new RoselleDatabase(`TestDB_${Math.random().toString(36).slice(2)}`);
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
