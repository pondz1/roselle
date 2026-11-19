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
