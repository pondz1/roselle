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
    const starts = [
      '2026-01-01',
      '2026-01-29',
      '2026-02-28',
      '2026-05-10',
      '2026-06-09',
      '2026-07-11',
    ];
    const logs = starts.map((d) => makeLog(d, 'medium'));
    const summary = computeCycleSummary(logs, baseSettings, '2026-07-15');
    expect(summary.predictedCycleLength).toBe(31);
    expect(summary.nextPeriodStart).toBe('2026-08-11');
  });

  it('identifies active period, ovulation, fertile window, and conception chances accurately', () => {
    const logs = [
      makeLog('2026-11-01', 'medium'),
      makeLog('2026-11-02', 'heavy'),
      makeLog('2026-11-03', 'medium'),
    ];
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
    expect(map.get('2026-11-03')?.isPredictedPeriod).toBe(true);
    expect(map.get('2026-11-05')?.isPredictedPeriod).toBe(true);
    expect(map.get('2026-11-06')?.isPredictedPeriod ?? false).toBe(false);
    expect(map.get('2026-11-15')?.isOvulation).toBe(true);
    expect(map.get('2026-11-12')?.isFertile).toBe(true);
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

  it('auto-tracks active period across defaultPeriodLength if end is not marked, and stops after', () => {
    const logs = [makeLog('2026-11-17', 'medium')];

    // Day 3 (Nov 19): user forgot to log Nov 18-19 -> still treated as Period Day 3 automatically
    const day3 = computeCycleSummary(logs, baseSettings, '2026-11-19');
    expect(day3.status).toBe('period');
    expect(day3.periodDay).toBe(3);

    // Day 6 (Nov 22): past 5-day defaultPeriodLength -> automatically ended, now follicular countdown
    const day6 = computeCycleSummary(logs, baseSettings, '2026-11-22');
    expect(day6.status).toBe('follicular');
    expect(day6.daysUntilNextPeriod).toBe(23);
  });

  it('stops predicted period tail immediately when periodEnded is marked early', () => {
    const logs = [
      makeLog('2026-11-17', 'medium'),
      makeLog('2026-11-18', 'heavy'),
      makeLog('2026-11-19', 'light', { periodEnded: true }),
    ];

    const map = buildCalendarMap(logs, baseSettings, '2026-11-19', 6);
    expect(map.get('2026-11-19')?.isLoggedPeriod).toBe(true);
    expect(map.get('2026-11-20')?.isPredictedPeriod ?? false).toBe(false);
    expect(map.get('2026-11-21')?.isPredictedPeriod ?? false).toBe(false);

    // Next day (Nov 20) is already follicular countdown, not period
    const nextDay = computeCycleSummary(logs, baseSettings, '2026-11-20');
    expect(nextDay.status).toBe('follicular');
  });
});
