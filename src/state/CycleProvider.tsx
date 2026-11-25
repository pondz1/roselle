import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DexieCycleRepository } from '../data/dexie-repository';
import type { BackupSnapshot, CycleRepository, PeriodDayUpdate } from '../data/repository';
import {
  buildCalendarMap,
  computeCycleSummary,
  computeInsights,
  extractPeriodEpisodes,
} from '../domain/cycle-engine';
import { addDays, compareDates, diffDays, todayISO } from '../domain/date-utils';
import {
  DEFAULT_USER_SETTINGS,
  type CycleInsights,
  type CycleSummary,
  type DailyLog,
  type DailyLogInput,
  type DayCalendarInfo,
  type FlowLevel,
  type ISODate,
  type PeriodEpisode,
  type UserSettings,
} from '../domain/types';

export interface OnboardingPayload {
  lastPeriodStart: ISODate | null;
  defaultPeriodLength: number;
  defaultCycleLength: number;
}

interface CycleContextValue {
  loading: boolean;
  storageError: boolean;
  logs: DailyLog[];
  logsByDate: Map<ISODate, DailyLog>;
  episodes: PeriodEpisode[];
  settings: UserSettings;
  today: ISODate;
  summary: CycleSummary;
  calendarMap: Map<ISODate, DayCalendarInfo>;
  insights: CycleInsights;
  saveLog: (input: DailyLogInput) => Promise<void>;
  toggleTodayPeriod: () => Promise<void>;
  clearTodayPeriod: () => Promise<void>;
  markPeriodStart: (date: ISODate) => Promise<void>;
  markPeriodEnd: (date: ISODate) => Promise<void>;
  clearPeriodDay: (date: ISODate) => Promise<void>;
  clearPeriodEpisode: (startDate: ISODate) => Promise<void>;
  bulkSetPeriodDays: (updates: PeriodDayUpdate[]) => Promise<void>;
  updateSettings: (patch: Partial<Omit<UserSettings, 'id' | 'updatedAt'>>) => Promise<void>;
  completeOnboarding: (payload: OnboardingPayload) => Promise<void>;
  exportBackup: () => Promise<BackupSnapshot>;
  importBackup: (snapshot: BackupSnapshot) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const CycleContext = createContext<CycleContextValue | null>(null);

let defaultRepoSingleton: CycleRepository | null = null;
function getDefaultRepository(): CycleRepository {
  if (!defaultRepoSingleton) {
    defaultRepoSingleton = new DexieCycleRepository();
  }
  return defaultRepoSingleton;
}

interface CycleProviderProps {
  repository?: CycleRepository;
  todayOverride?: ISODate;
  children: ReactNode;
}

export function CycleProvider({ repository, todayOverride, children }: CycleProviderProps) {
  const repo = useMemo(() => repository ?? getDefaultRepository(), [repository]);
  const [currentToday, setCurrentToday] = useState<ISODate>(() => todayISO());
  const today = todayOverride ?? currentToday;

  useEffect(() => {
    if (todayOverride || typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const syncToday = () => {
      const next = todayISO();
      setCurrentToday((prev) => (prev === next ? prev : next));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncToday();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', syncToday);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', syncToday);
    };
  }, [todayOverride]);

  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    ...DEFAULT_USER_SETTINGS,
    updatedAt: '',
  });

  const refreshAll = useCallback(async () => {
    const [loadedLogs, loadedSettings] = await Promise.all([
      repo.getAllLogs(),
      repo.getSettings(),
    ]);
    setLogs(loadedLogs);
    setSettings(loadedSettings);
  }, [repo]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setStorageError(false);

    refreshAll()
      .catch(() => {
        if (active) setStorageError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshAll]);

  const logsByDate = useMemo(() => {
    const map = new Map<ISODate, DailyLog>();
    for (const log of logs) {
      map.set(log.date, log);
    }
    return map;
  }, [logs]);

  const episodes = useMemo(() => extractPeriodEpisodes(logs), [logs]);

  const summary = useMemo(
    () => computeCycleSummary(logs, settings, today),
    [logs, settings, today],
  );

  const calendarMap = useMemo(
    () => buildCalendarMap(logs, settings, today, 6),
    [logs, settings, today],
  );

  const insights = useMemo(() => computeInsights(logs, today), [logs, today]);

  const saveLog = useCallback(
    async (input: DailyLogInput) => {
      if (compareDates(input.date, today) > 0) return;
      await repo.upsertLog(input);
      const nextLogs = await repo.getAllLogs();
      setLogs(nextLogs);
    },
    [repo, today],
  );

  const toggleTodayPeriod = useCallback(async () => {
    const existing = logsByDate.get(today);
    await repo.upsertLog({
      date: today,
      flow: existing && existing.flow !== 'none' ? existing.flow : 'medium',
      periodEnded: existing?.periodEnded ?? false,
      symptoms: existing?.symptoms ?? [],
      moods: existing?.moods ?? [],
      activities: existing?.activities ?? [],
      note: existing?.note ?? '',
      weightKg: existing?.weightKg ?? null,
      bbtCelsius: existing?.bbtCelsius ?? null,
      pillTaken: existing?.pillTaken ?? false,
    });
    const nextLogs = await repo.getAllLogs();
    setLogs(nextLogs);
  }, [logsByDate, repo, today]);

  const clearTodayPeriod = useCallback(async () => {
    const existing = logsByDate.get(today);
    if (!existing) return;
    await repo.upsertLog({
      date: today,
      flow: 'none',
      periodEnded: false,
      symptoms: existing.symptoms,
      moods: existing.moods,
      activities: existing.activities,
      note: existing.note,
      weightKg: existing.weightKg ?? null,
      bbtCelsius: existing.bbtCelsius ?? null,
      pillTaken: existing.pillTaken ?? false,
    });
    const nextLogs = await repo.getAllLogs();
    setLogs(nextLogs);
  }, [logsByDate, repo, today]);

  const bulkSetPeriodDays = useCallback(
    async (updates: PeriodDayUpdate[]) => {
      await repo.bulkSetPeriodDays(updates);
      const nextLogs = await repo.getAllLogs();
      setLogs(nextLogs);
    },
    [repo],
  );

  const markPeriodStart = useCallback(
    async (date: ISODate) => {
      if (compareDates(date, today) > 0) return;
      const isInsideExistingEpisode = episodes.some((ep) => {
        const offset = diffDays(ep.startDate, date);
        return offset > 0 && offset <= 12;
      });
      if (isInsideExistingEpisode) return;

      const updates: PeriodDayUpdate[] = [];
      for (let i = 0; i < settings.defaultPeriodLength; i += 1) {
        const d = addDays(date, i);
        if (compareDates(d, today) <= 0) {
          const existing = logsByDate.get(d);
          const flow: FlowLevel =
            existing && existing.flow !== 'none' ? existing.flow : 'medium';
          updates.push({ date: d, flow, periodEnded: false });
        }
      }
      await repo.bulkSetPeriodDays(updates);
      const nextLogs = await repo.getAllLogs();
      setLogs(nextLogs);
    },
    [episodes, logsByDate, repo, settings.defaultPeriodLength, today],
  );

  const markPeriodEnd = useCallback(
    async (date: ISODate) => {
      if (compareDates(date, today) > 0) return;
      const matching = [...episodes]
        .reverse()
        .find((ep) => {
          const offset = diffDays(ep.startDate, date);
          return offset >= 0 && offset <= 12;
        });

      const updates: PeriodDayUpdate[] = [];
      if (matching) {
        const span = diffDays(matching.startDate, date);
        for (let i = 0; i <= span; i += 1) {
          const d = addDays(matching.startDate, i);
          const existing = logsByDate.get(d);
          const flow: FlowLevel =
            existing && existing.flow !== 'none' ? existing.flow : 'medium';
          updates.push({ date: d, flow, periodEnded: d === date });
        }
        const trailingDays = diffDays(date, matching.endDate);
        for (let i = 1; i <= trailingDays; i += 1) {
          const d = addDays(date, i);
          updates.push({ date: d, flow: 'none', periodEnded: false });
        }
      } else {
        const existing = logsByDate.get(date);
        const flow: FlowLevel =
          existing && existing.flow !== 'none' ? existing.flow : 'medium';
        updates.push({ date, flow, periodEnded: true });
      }

      await repo.bulkSetPeriodDays(updates);
      const nextLogs = await repo.getAllLogs();
      setLogs(nextLogs);
    },
    [episodes, logsByDate, repo, today],
  );

  const clearPeriodDay = useCallback(
    async (date: ISODate) => {
      await repo.bulkSetPeriodDays([{ date, flow: 'none', periodEnded: false }]);
      const nextLogs = await repo.getAllLogs();
      setLogs(nextLogs);
    },
    [repo],
  );

  const clearPeriodEpisode = useCallback(
    async (startDate: ISODate) => {
      const target = episodes.find((ep) => ep.startDate === startDate);
      if (!target || target.loggedDays.length === 0) return;
      await repo.bulkSetPeriodDays(
        target.loggedDays.map((d) => ({ date: d, flow: 'none', periodEnded: false })),
      );
      const nextLogs = await repo.getAllLogs();
      setLogs(nextLogs);
    },
    [episodes, repo],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Omit<UserSettings, 'id' | 'updatedAt'>>) => {
      const updated = await repo.updateSettings(patch);
      setSettings(updated);
    },
    [repo],
  );

  const completeOnboarding = useCallback(
    async (payload: OnboardingPayload) => {
      if (payload.lastPeriodStart && compareDates(payload.lastPeriodStart, today) <= 0) {
        const updates: Array<{ date: ISODate; flow: FlowLevel }> = [];
        for (let i = 0; i < payload.defaultPeriodLength; i += 1) {
          const d = addDays(payload.lastPeriodStart, i);
          if (compareDates(d, today) <= 0) {
            updates.push({ date: d, flow: 'medium' });
          }
        }
        await repo.bulkSetPeriodDays(updates);
      }

      await repo.updateSettings({
        defaultCycleLength: payload.defaultCycleLength,
        defaultPeriodLength: payload.defaultPeriodLength,
        onboardingCompleted: true,
      });

      await refreshAll();
    },
    [refreshAll, repo, today],
  );

  const exportBackup = useCallback(() => repo.exportSnapshot(), [repo]);

  const importBackup = useCallback(
    async (snapshot: BackupSnapshot) => {
      await repo.importSnapshot(snapshot);
      await refreshAll();
    },
    [refreshAll, repo],
  );

  const resetAllData = useCallback(async () => {
    await repo.clearAll();
    await refreshAll();
  }, [refreshAll, repo]);

  const value = useMemo<CycleContextValue>(
    () => ({
      loading,
      storageError,
      logs,
      logsByDate,
      episodes,
      settings,
      today,
      summary,
      calendarMap,
      insights,
      saveLog,
      toggleTodayPeriod,
      clearTodayPeriod,
      markPeriodStart,
      markPeriodEnd,
      clearPeriodDay,
      clearPeriodEpisode,
      bulkSetPeriodDays,
      updateSettings,
      completeOnboarding,
      exportBackup,
      importBackup,
      resetAllData,
    }),
    [
      loading,
      storageError,
      logs,
      logsByDate,
      episodes,
      settings,
      today,
      summary,
      calendarMap,
      insights,
      saveLog,
      toggleTodayPeriod,
      clearTodayPeriod,
      markPeriodStart,
      markPeriodEnd,
      clearPeriodDay,
      clearPeriodEpisode,
      bulkSetPeriodDays,
      updateSettings,
      completeOnboarding,
      exportBackup,
      importBackup,
      resetAllData,
    ],
  );

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
}

export function useCycle(): CycleContextValue {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycle must be used within CycleProvider');
  return ctx;
}
