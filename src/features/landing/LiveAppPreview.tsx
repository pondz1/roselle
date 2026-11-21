import { useMemo, useState } from 'react';
import { buildCalendarMap, computeCycleSummary } from '../../domain/cycle-engine';
import { formatFullDate, formatShortDate } from '../../domain/date-utils';
import {
  DEFAULT_USER_SETTINGS,
  type DailyLog,
  type ISODate,
  type UserSettings,
} from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';
import { MonthGrid } from '../calendar/MonthGrid';
import { CycleRing } from '../today/CycleRing';

const SAMPLE_TODAY: ISODate = '2026-11-19';
const EMPTY_STAGED_DATES = new Set<ISODate>();

const SAMPLE_SETTINGS: UserSettings = {
  ...DEFAULT_USER_SETTINGS,
  onboardingCompleted: true,
  updatedAt: '2026-11-19T00:00:00.000Z',
};

function makeSampleLog(
  date: ISODate,
  flow: DailyLog['flow'],
  extra: Partial<DailyLog> = {},
): DailyLog {
  return {
    date,
    flow,
    periodEnded: false,
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

const SAMPLE_LOGS: DailyLog[] = [
  makeSampleLog('2026-08-24', 'medium'),
  makeSampleLog('2026-08-25', 'heavy'),
  makeSampleLog('2026-08-26', 'medium'),
  makeSampleLog('2026-08-27', 'light'),
  makeSampleLog('2026-08-28', 'spotting', { periodEnded: true }),
  makeSampleLog('2026-09-21', 'medium'),
  makeSampleLog('2026-09-22', 'heavy'),
  makeSampleLog('2026-09-23', 'medium'),
  makeSampleLog('2026-09-24', 'light'),
  makeSampleLog('2026-09-25', 'spotting', { periodEnded: true }),
  makeSampleLog('2026-10-20', 'medium'),
  makeSampleLog('2026-10-21', 'heavy'),
  makeSampleLog('2026-10-22', 'medium'),
  makeSampleLog('2026-10-23', 'light'),
  makeSampleLog('2026-10-24', 'spotting', { periodEnded: true }),
  makeSampleLog('2026-11-17', 'medium', { symptoms: ['cramps'], moods: ['tired'] }),
  makeSampleLog('2026-11-18', 'heavy', { symptoms: ['cramps'], moods: ['sensitive'] }),
  makeSampleLog('2026-11-19', 'medium', { symptoms: ['fatigue'], moods: ['calm'] }),
];

export function LiveAppPreview() {
  const { locale, t } = useI18n();
  const [tab, setTab] = useState<'today' | 'calendar'>('today');
  const [selectedDate, setSelectedDate] = useState<ISODate>(SAMPLE_TODAY);

  const sampleSummary = useMemo(
    () => computeCycleSummary(SAMPLE_LOGS, SAMPLE_SETTINGS, SAMPLE_TODAY),
    [],
  );

  const sampleCalendarMap = useMemo(
    () => buildCalendarMap(SAMPLE_LOGS, SAMPLE_SETTINGS, SAMPLE_TODAY, 3),
    [],
  );

  const selectedDayInfo = sampleCalendarMap.get(selectedDate);
  let selectedPhaseLabel = t.today.conceptionChance[selectedDayInfo?.conceptionChance ?? 'low'];
  if (selectedDayInfo?.isLoggedPeriod) selectedPhaseLabel = t.dailyLog.statusLoggedPeriod;
  else if (selectedDayInfo?.isPredictedPeriod) selectedPhaseLabel = t.dailyLog.statusPredictedPeriod;
  else if (selectedDayInfo?.isOvulation) selectedPhaseLabel = t.dailyLog.statusOvulation;
  else if (selectedDayInfo?.isFertile) selectedPhaseLabel = t.dailyLog.statusFertile;

  return (
    <div className="w-full max-w-[360px] mx-auto rounded-[20px] bg-warm-surface border border-rose-hairline shadow-[0_12px_36px_oklch(0.24_0.02_15_/_0.07)] overflow-hidden">
      <div className="px-4 py-3 border-b border-rose-hairline flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-coral-rose shrink-0" />
          <span className="text-[0.8125rem] font-medium text-ink-secondary truncate tabular-nums">
            {formatShortDate(SAMPLE_TODAY, locale)}
          </span>
        </div>

        <div
          className="inline-flex rounded-[10px] bg-tinted-subtle p-1 shrink-0"
          role="tablist"
          aria-label="Preview view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'today'}
            onClick={() => setTab('today')}
            className={[
              'px-3 py-1 rounded-[6px] text-[0.75rem] font-medium transition-colors duration-[150ms]',
              tab === 'today'
                ? 'bg-warm-surface text-coral-rose-ink'
                : 'text-ink-muted hover:text-ink-primary',
            ].join(' ')}
          >
            {t.landing.previewTabToday}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'calendar'}
            onClick={() => setTab('calendar')}
            className={[
              'px-3 py-1 rounded-[6px] text-[0.75rem] font-medium transition-colors duration-[150ms]',
              tab === 'calendar'
                ? 'bg-warm-surface text-coral-rose-ink'
                : 'text-ink-muted hover:text-ink-primary',
            ].join(' ')}
          >
            {t.landing.previewTabCalendar}
          </button>
        </div>
      </div>

      {tab === 'today' ? (
        <div className="px-5 py-6 flex flex-col items-center">
          <CycleRing summary={sampleSummary} />
          <div className="mt-5 w-full grid grid-cols-2 divide-x divide-rose-hairline border-t border-rose-hairline pt-3.5">
            <div className="pr-3">
              <p className="text-[0.75rem] text-ink-muted">{t.today.nextPeriodLabel}</p>
              <p className="mt-0.5 text-[0.875rem] font-semibold text-ink-primary tabular-nums">
                {sampleSummary.nextPeriodStart
                  ? formatShortDate(sampleSummary.nextPeriodStart, locale)
                  : '-'}
              </p>
            </div>
            <div className="pl-4">
              <p className="text-[0.75rem] text-ink-muted">{t.today.ovulationDateLabel}</p>
              <p className="mt-0.5 text-[0.875rem] font-semibold text-fertile-sage-ink tabular-nums">
                {sampleSummary.ovulationDate
                  ? formatShortDate(sampleSummary.ovulationDate, locale)
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-3">
          <MonthGrid
            year={2026}
            month={11}
            today={SAMPLE_TODAY}
            selectedDate={selectedDate}
            calendarMap={sampleCalendarMap}
            editMode={false}
            stagedPeriodDates={EMPTY_STAGED_DATES}
            onTapDate={setSelectedDate}
          />
          <div className="px-4 py-3 border-t border-rose-hairline flex items-center justify-between gap-2 text-[0.75rem]">
            <span className="font-medium text-ink-primary tabular-nums truncate">
              {formatFullDate(selectedDate, locale)}
            </span>
            <span className="shrink-0 font-medium text-coral-rose-ink">
              {selectedPhaseLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
