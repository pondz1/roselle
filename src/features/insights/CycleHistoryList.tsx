import { formatShortDate } from '../../domain/date-utils';
import type { CycleHistoryItem } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';

interface CycleHistoryListProps {
  history: CycleHistoryItem[];
}

export function CycleHistoryList({ history }: CycleHistoryListProps) {
  const { locale, t } = useI18n();

  return (
    <section className="px-5 py-5 border-t border-rose-hairline">
      <h2 className="text-[0.9375rem] font-semibold text-ink-primary mb-3">
        {t.insights.historyTitle}
      </h2>

      {history.length === 0 ? (
        <p className="text-[0.875rem] text-ink-secondary">{t.insights.historyEmpty}</p>
      ) : (
        <div className="divide-y divide-rose-hairline border-y border-rose-hairline">
          {history.map((item) => (
            <div
              key={item.startDate}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-[0.9375rem] font-medium text-ink-primary tabular-nums">
                  {formatShortDate(item.startDate, locale)}
                  {item.endDate !== item.startDate
                    ? ` - ${formatShortDate(item.endDate, locale)}`
                    : ''}
                </p>
                <p className="mt-0.5 text-[0.75rem] text-ink-muted tabular-nums">
                  {t.insights.periodDaysCount(item.periodLength)}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {item.isOutlier ? (
                  <span className="rounded-[6px] bg-amber-late-soft text-amber-late-ink px-2 py-0.5 text-[0.75rem] font-medium">
                    {t.insights.outlierBadge}
                  </span>
                ) : null}
                {item.cycleLength === null ? (
                  <span className="rounded-[6px] bg-coral-rose-soft text-coral-rose-ink px-2.5 py-1 text-[0.8125rem] font-medium">
                    {t.insights.ongoingCycle}
                  </span>
                ) : (
                  <span className="text-[0.875rem] font-medium text-ink-secondary tabular-nums">
                    {t.insights.cycleDaysCount(item.cycleLength)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
