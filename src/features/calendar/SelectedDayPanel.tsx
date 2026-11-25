import { Check, Droplets, PenLine, SquareCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { compareDates, diffDays, formatFullDate } from '../../domain/date-utils';
import type { ISODate } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';
import { useCycle } from '../../state/CycleProvider';

interface SelectedDayPanelProps {
  date: ISODate;
  onOpenDetails: (date: ISODate) => void;
}

export function SelectedDayPanel({ date, onOpenDetails }: SelectedDayPanelProps) {
  const {
    today,
    settings,
    logsByDate,
    episodes,
    calendarMap,
    markPeriodStart,
    markPeriodEnd,
    clearPeriodEpisode,
    bulkSetPeriodDays,
  } = useCycle();
  const { locale, t } = useI18n();

  const log = logsByDate.get(date);
  const info = calendarMap.get(date);
  const isFuture = compareDates(date, today) > 0;

  const matchingEpisode = [...episodes]
    .reverse()
    .find((ep) => {
      const offset = diffDays(ep.startDate, date);
      return offset >= 0 && offset <= 12;
    });

  const isEpisodeStart = Boolean(matchingEpisode && matchingEpisode.startDate === date);
  const isMarkedEnded = Boolean(log && log.flow !== 'none' && log.periodEnded === true);

  let phaseLabel: string | null = null;
  let phaseClass = 'bg-tinted-subtle text-ink-secondary';
  if (info?.isLoggedPeriod) {
    phaseLabel = t.dailyLog.statusLoggedPeriod;
    phaseClass = 'bg-coral-rose-soft text-coral-rose-ink';
  } else if (info?.isPredictedPeriod) {
    phaseLabel = t.dailyLog.statusPredictedPeriod;
    phaseClass = 'bg-predicted-blush text-coral-rose-ink';
  } else if (info?.isOvulation) {
    phaseLabel = t.dailyLog.statusOvulation;
    phaseClass = 'bg-fertile-sage-soft text-fertile-sage-ink';
  } else if (info?.isFertile) {
    phaseLabel = t.dailyLog.statusFertile;
    phaseClass = 'bg-fertile-sage-soft text-fertile-sage-ink';
  }

  const hasDetailTags =
    Boolean(log) &&
    (log!.flow !== 'none' ||
      log!.symptoms.length > 0 ||
      log!.moods.length > 0 ||
      log!.activities.length > 0 ||
      log!.note.trim().length > 0 ||
      log!.weightKg != null ||
      log!.bbtCelsius != null ||
      log!.pillTaken === true);

  const handleUndoEnd = async () => {
    if (!isMarkedEnded || !log) return;
    await bulkSetPeriodDays([{ date, flow: log.flow, periodEnded: false }]);
  };

  return (
    <section
      aria-label={formatFullDate(date, locale)}
      className="px-5 pt-5 pb-6 border-t border-rose-hairline space-y-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[1rem] font-semibold text-ink-primary tabular-nums">
            {formatFullDate(date, locale)}
          </h2>
          {info?.cycleDay ? (
            <p className="mt-0.5 text-[0.75rem] text-ink-muted tabular-nums">
              {t.today.cycleDay(info.cycleDay)}
            </p>
          ) : null}
        </div>
        {phaseLabel ? (
          <span
            className={`shrink-0 rounded-[8px] px-2.5 py-1 text-[0.75rem] font-medium ${phaseClass}`}
          >
            {phaseLabel}
          </span>
        ) : null}
      </div>

      {isFuture ? (
        <div className="space-y-3">
          {info ? (
            <div className="rounded-[12px] bg-tinted-subtle px-4 py-3 text-[0.875rem] flex items-center justify-between">
              <span className="text-ink-secondary">{t.today.conceptionChanceLabel}</span>
              <span className="font-semibold text-fertile-sage-ink">
                {t.today.conceptionChance[info.conceptionChance]}
              </span>
            </div>
          ) : null}
          <p className="text-[0.8125rem] leading-relaxed text-ink-secondary">
            {t.dailyLog.futureBody}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {!matchingEpisode ? (
              <button
                type="button"
                onClick={() => void markPeriodStart(date)}
                className="w-full flex items-center justify-center gap-2 min-h-11 px-4 py-2 rounded-[10px] text-[0.875rem] font-medium bg-coral-rose-soft/80 text-coral-rose-ink hover:bg-coral-rose-soft transition-[background-color,transform] duration-[150ms] active:scale-[0.98]"
              >
                <Droplets className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                <span>{t.calendar.selectedDay.periodStartButton}</span>
              </button>
            ) : (
              <>
                {isEpisodeStart ? (
                  <div className="flex items-center justify-between gap-2 rounded-[10px] bg-coral-rose-soft/80 px-3.5 py-2.5 text-[0.8125rem] text-coral-rose-ink">
                    <span className="flex items-center gap-2 font-medium min-w-0">
                      <Check className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                      <span className="truncate">{t.calendar.selectedDay.periodStartStatus}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={t.calendar.selectedDay.undoStartAria}
                      onClick={() => void clearPeriodEpisode(matchingEpisode.startDate)}
                      className="shrink-0 font-semibold underline underline-offset-2 hover:text-coral-rose-hover px-1 py-0.5 rounded-[6px] transition-colors"
                    >
                      {t.calendar.selectedDay.undoAction}
                    </button>
                  </div>
                ) : !isMarkedEnded ? (
                  <div className="flex items-center gap-2 rounded-[10px] bg-tinted-subtle px-3.5 py-2.5 text-[0.8125rem] text-ink-secondary">
                    <Droplets className="w-4 h-4 shrink-0 text-coral-rose-ink" strokeWidth={1.6} />
                    <span>{t.calendar.selectedDay.periodOngoingStatus}</span>
                  </div>
                ) : null}

                {isMarkedEnded ? (
                  <div className="flex items-center justify-between gap-2 rounded-[10px] bg-coral-rose-soft/80 px-3.5 py-2.5 text-[0.8125rem] text-coral-rose-ink">
                    <span className="flex items-center gap-2 font-medium min-w-0">
                      <Check className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                      <span className="truncate">{t.calendar.selectedDay.periodEndStatus}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={t.calendar.selectedDay.undoEndAria}
                      onClick={() => void handleUndoEnd()}
                      className="shrink-0 font-semibold underline underline-offset-2 hover:text-coral-rose-hover px-1 py-0.5 rounded-[6px] transition-colors"
                    >
                      {t.calendar.selectedDay.undoAction}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void markPeriodEnd(date)}
                    className={[
                      'w-full flex items-center justify-center gap-2 min-h-11 px-4 py-2 rounded-[10px] text-[0.875rem] font-medium transition-[background-color,color,transform] duration-[150ms] active:scale-[0.98]',
                      isEpisodeStart
                        ? 'bg-tinted-subtle text-ink-primary hover:bg-tinted-subtle/70'
                        : 'bg-coral-rose-soft/80 text-coral-rose-ink hover:bg-coral-rose-soft',
                    ].join(' ')}
                  >
                    <SquareCheck className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                    <span>{t.calendar.selectedDay.periodEndButton}</span>
                  </button>
                )}
              </>
            )}
          </div>

          {matchingEpisode && !matchingEpisode.isExplicitlyEnded ? (
            <p className="text-[0.75rem] leading-relaxed text-ink-muted">
              {t.calendar.selectedDay.autoEndHint(settings.defaultPeriodLength)}
            </p>
          ) : null}

          {hasDetailTags ? (
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap gap-2">
                {log!.flow !== 'none' ? (
                  <span className="inline-flex items-center rounded-[8px] bg-coral-rose-soft text-coral-rose-ink px-2.5 py-1 text-[0.75rem] font-medium">
                    {t.dailyLog.flow[log!.flow]}
                  </span>
                ) : null}
                {log!.symptoms.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-[8px] bg-tinted-subtle text-ink-primary px-2.5 py-1 text-[0.75rem]"
                  >
                    {t.dailyLog.symptoms[s]}
                  </span>
                ))}
                {log!.moods.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center rounded-[8px] bg-tinted-subtle text-ink-primary px-2.5 py-1 text-[0.75rem]"
                  >
                    {t.dailyLog.moods[m]}
                  </span>
                ))}
                {log!.activities.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center rounded-[8px] bg-fertile-sage-soft text-fertile-sage-ink px-2.5 py-1 text-[0.75rem]"
                  >
                    {t.dailyLog.activities[a]}
                  </span>
                ))}
                {log!.weightKg != null ? (
                  <span className="inline-flex items-center rounded-[8px] bg-tinted-subtle text-ink-primary px-2.5 py-1 text-[0.75rem] tabular-nums">
                    {log!.weightKg} {t.dailyLog.weightUnit}
                  </span>
                ) : null}
                {log!.bbtCelsius != null ? (
                  <span className="inline-flex items-center rounded-[8px] bg-tinted-subtle text-ink-primary px-2.5 py-1 text-[0.75rem] tabular-nums">
                    {log!.bbtCelsius} {t.dailyLog.bbtUnit}
                  </span>
                ) : null}
                {log!.pillTaken ? (
                  <span className="inline-flex items-center rounded-[8px] bg-fertile-sage-soft text-fertile-sage-ink px-2.5 py-1 text-[0.75rem]">
                    {t.dailyLog.pillTaken}
                  </span>
                ) : null}
              </div>
              {log!.note.trim() ? (
                <p className="text-[0.8125rem] leading-relaxed text-ink-secondary bg-tinted-subtle/60 rounded-[12px] px-4 py-2.5">
                  {log!.note}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-[0.8125rem] text-ink-muted">
              {t.calendar.selectedDay.noLogsForDay}
            </p>
          )}

          <Button
            variant="secondary"
            fullWidth
            onClick={() => onOpenDetails(date)}
          >
            <PenLine className="w-4 h-4" strokeWidth={1.6} />
            <span>
              {hasDetailTags
                ? t.calendar.selectedDay.editDetails
                : t.calendar.selectedDay.openDetails}
            </span>
          </Button>
        </>
      )}
    </section>
  );
}
