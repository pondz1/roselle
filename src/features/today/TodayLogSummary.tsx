import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { DailyLog } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';

interface TodayLogSummaryProps {
  log: DailyLog | undefined;
  onEdit: () => void;
}

export function TodayLogSummary({ log, onEdit }: TodayLogSummaryProps) {
  const { t } = useI18n();

  const hasTags =
    Boolean(log) &&
    (log!.flow !== 'none' ||
      log!.symptoms.length > 0 ||
      log!.moods.length > 0 ||
      log!.activities.length > 0 ||
      log!.note.trim().length > 0 ||
      log!.weightKg != null ||
      log!.bbtCelsius != null ||
      log!.pillTaken === true);

  return (
    <section className="px-5 pt-6 border-t border-rose-hairline">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[0.9375rem] font-semibold text-ink-primary">
          {t.today.todayLogHeading}
        </h2>
        <Button variant="ghost" size="sm" onClick={onEdit} className="-mr-2">
          <Plus className="w-4 h-4" strokeWidth={1.6} />
          <span>{hasTags ? t.common.edit : t.today.addDailyLog}</span>
        </Button>
      </div>

      {!hasTags ? (
        <button
          type="button"
          onClick={onEdit}
          className="w-full text-left rounded-[12px] bg-tinted-subtle/80 hover:bg-tinted-subtle px-4 py-3 text-[0.875rem] text-ink-secondary transition-colors duration-[150ms]"
        >
          {t.today.noLogsToday}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {log!.flow !== 'none' ? (
              <span className="inline-flex items-center rounded-[8px] bg-coral-rose-soft text-coral-rose-ink px-2.5 py-1 text-[0.8125rem] font-medium">
                {t.dailyLog.flow[log!.flow]}
              </span>
            ) : null}
            {log!.symptoms.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-[8px] bg-tinted-subtle text-ink-primary px-2.5 py-1 text-[0.8125rem]"
              >
                {t.dailyLog.symptoms[s]}
              </span>
            ))}
            {log!.moods.map((m) => (
              <span
                key={m}
                className="inline-flex items-center rounded-[8px] bg-tinted-subtle text-ink-primary px-2.5 py-1 text-[0.8125rem]"
              >
                {t.dailyLog.moods[m]}
              </span>
            ))}
            {log!.activities.map((a) => (
              <span
                key={a}
                className="inline-flex items-center rounded-[8px] bg-fertile-sage-soft text-fertile-sage-ink px-2.5 py-1 text-[0.8125rem]"
              >
                {t.dailyLog.activities[a]}
              </span>
            ))}
            {log!.weightKg != null ? (
              <span className="inline-flex items-center rounded-[8px] bg-tinted-subtle text-ink-primary px-2.5 py-1 text-[0.8125rem] tabular-nums">
                {log!.weightKg} {t.dailyLog.weightUnit}
              </span>
            ) : null}
            {log!.bbtCelsius != null ? (
              <span className="inline-flex items-center rounded-[8px] bg-tinted-subtle text-ink-primary px-2.5 py-1 text-[0.8125rem] tabular-nums">
                {log!.bbtCelsius} {t.dailyLog.bbtUnit}
              </span>
            ) : null}
            {log!.pillTaken ? (
              <span className="inline-flex items-center rounded-[8px] bg-fertile-sage-soft text-fertile-sage-ink px-2.5 py-1 text-[0.8125rem]">
                {t.dailyLog.pillTaken}
              </span>
            ) : null}
          </div>
          {log!.note.trim() ? (
            <p className="text-[0.875rem] leading-relaxed text-ink-secondary bg-tinted-subtle/60 rounded-[12px] px-4 py-3">
              {log!.note}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
