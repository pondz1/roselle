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
  const activePeriodLogs = logs.filter((log) => log.deletedAt === null && log.flow !== 'none');
  const endedDates = new Set(
    activePeriodLogs.filter((log) => log.periodEnded === true).map((log) => log.date),
  );
  const periodDates = activePeriodLogs.map((log) => log.date).sort(compareDates);

  const uniqueDates = Array.from(new Set(periodDates));
  if (uniqueDates.length === 0) return [];

  const episodes: PeriodEpisode[] = [];
  let current: PeriodEpisode = {
    startDate: uniqueDates[0],
    endDate: uniqueDates[0],
    loggedDays: [uniqueDates[0]],
    lengthDays: 1,
    isExplicitlyEnded: endedDates.has(uniqueDates[0]),
  };

  for (let i = 1; i < uniqueDates.length; i += 1) {
    const date = uniqueDates[i];
    const gapFromPrev = diffDays(current.endDate, date);
    const gapFromStart = diffDays(current.startDate, date);

    if (gapFromPrev <= MAX_IN_EPISODE_GAP_DAYS && gapFromStart < MIN_NEW_CYCLE_GAP_FROM_START) {
      current.endDate = date;
      current.loggedDays.push(date);
      current.lengthDays = diffDays(current.startDate, current.endDate) + 1;
      if (endedDates.has(date)) {
        current.isExplicitlyEnded = true;
      }
    } else {
      episodes.push(current);
      current = {
        startDate: date,
        endDate: date,
        loggedDays: [date],
        lengthDays: 1,
        isExplicitlyEnded: endedDates.has(date),
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

  const pastOrTodayEpisodes = episodes.filter((ep) => compareDates(ep.startDate, today) <= 0);
  const latest =
    pastOrTodayEpisodes.length > 0
      ? pastOrTodayEpisodes[pastOrTodayEpisodes.length - 1]
      : episodes[episodes.length - 1];

  const todayLog = activeLogs.find((log) => log.date === today);
  const isTodayLoggedPeriod = Boolean(todayLog && todayLog.flow !== 'none');
  const isInsideLatestEpisode =
    compareDates(today, latest.startDate) >= 0 && compareDates(today, latest.endDate) <= 0;
  const isInsideAutoPeriodWindow =
    !latest.isExplicitlyEnded &&
    compareDates(today, latest.startDate) >= 0 &&
    diffDays(latest.startDate, today) < predictedPeriodLength;
  const isActivePeriodToday =
    isTodayLoggedPeriod || isInsideLatestEpisode || isInsideAutoPeriodWindow;

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
    isActivePeriodToday,
  );

  let status: CycleStatus;
  let periodDay: number | null = null;
  let daysLate = 0;

  if (isActivePeriodToday) {
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

function applyFertilityWindow(
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
        applyFertilityWindow(ensureDay, proj);
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

  const isOngoingAutoWindow =
    !latest.isExplicitlyEnded &&
    compareDates(today, latest.startDate) >= 0 &&
    diffDays(latest.startDate, today) < predictedPeriodLength;

  if (!latest.isExplicitlyEnded) {
    for (let d = 0; d < predictedPeriodLength; d += 1) {
      const date = addDays(latest.startDate, d);
      const info = ensureDay(date);
      info.cycleDay = d + 1;
      if (!info.isLoggedPeriod && (compareDates(date, today) >= 0 || isOngoingAutoWindow)) {
        info.isPredictedPeriod = true;
      }
    }
  }

  applyFertilityWindow(ensureDay, currentProj);

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
    applyFertilityWindow(ensureDay, proj);
    projectedCount += 1;
  }

  return map;
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
