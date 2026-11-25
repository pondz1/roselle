import { Check, Droplets, PenLine, SquareCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatFullDate, formatShortDate } from '../../domain/date-utils';
import type { ISODate } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';
import { useCycle } from '../../state/CycleProvider';
import { InstallBanner } from '../pwa/InstallBanner';
import { CycleRing } from './CycleRing';
import { PhaseGuideCard } from './PhaseGuideCard';
import { TodayLogSummary } from './TodayLogSummary';

interface TodayViewProps {
  onOpenLog: (date: ISODate) => void;
}

export function TodayView({ onOpenLog }: TodayViewProps) {
  const {
    today,
    summary,
    logsByDate,
    toggleTodayPeriod,
    clearTodayPeriod,
    markPeriodEnd,
  } = useCycle();
  const { locale, setLocale, t } = useI18n();

  const todayLog = logsByDate.get(today);
  const isTodayLoggedPeriod = Boolean(todayLog && todayLog.flow !== 'none');
  const isPeriodActiveToday = summary.status === 'period' || isTodayLoggedPeriod;
  const isTodayMarkedEnded = Boolean(
    todayLog && todayLog.flow !== 'none' && todayLog.periodEnded === true,
  );

  return (
    <div className="flex flex-col pb-6">
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <p className="text-[0.8125rem] font-medium text-ink-secondary tabular-nums">
            {formatFullDate(today, locale)}
          </p>
          <h1 className="text-[1.375rem] font-semibold text-ink-primary">
            {t.appName}
          </h1>
        </div>

        <div
          className="inline-flex rounded-[10px] bg-tinted-subtle p-1"
          role="group"
          aria-label={t.settings.languageTitle}
        >
          {(['th', 'en'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLocale(lang)}
              className={[
                'px-3 py-1 rounded-[6px] text-[0.75rem] font-medium transition-colors duration-[150ms]',
                locale === lang
                  ? 'bg-warm-surface text-coral-rose-ink'
                  : 'text-ink-muted hover:text-ink-primary',
              ].join(' ')}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <InstallBanner />

      {summary.status === 'no_data' ? (
        <div className="py-6">
          <EmptyState
            icon={<Droplets className="w-5 h-5" strokeWidth={1.6} />}
            title={t.today.emptyTitle}
            body={t.today.emptyBody}
            action={
              <Button size="lg" onClick={() => void toggleTodayPeriod()}>
                <Droplets className="w-4 h-4" strokeWidth={1.6} />
                <span>{t.today.logPeriodToday}</span>
              </Button>
            }
          />
        </div>
      ) : (
        <section className="px-5 pt-2 pb-6 flex flex-col items-center">
          <CycleRing summary={summary} />

          <div className="mt-6 w-full flex flex-col gap-2">
            {isPeriodActiveToday ? (
              <>
                <Button fullWidth size="lg" onClick={() => onOpenLog(today)}>
                  <PenLine className="w-4 h-4" strokeWidth={1.6} />
                  <span>{t.today.editTodayLog}</span>
                </Button>
                {!isTodayMarkedEnded ? (
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => void markPeriodEnd(today)}
                  >
                    <SquareCheck className="w-4 h-4" strokeWidth={1.6} />
                    <span>{t.today.endPeriodToday}</span>
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 rounded-[10px] bg-tinted-subtle px-3 py-2 text-[0.8125rem] font-medium text-ink-secondary">
                    <Check className="w-4 h-4 text-coral-rose-ink" strokeWidth={1.6} />
                    <span>{t.today.periodEndedToday}</span>
                  </div>
                )}
                {isTodayLoggedPeriod ? (
                  <Button
                    fullWidth
                    variant="ghost"
                    size="sm"
                    onClick={() => void clearTodayPeriod()}
                  >
                    {t.today.clearPeriodToday}
                  </Button>
                ) : null}
              </>
            ) : (
              <Button fullWidth size="lg" onClick={() => void toggleTodayPeriod()}>
                <Droplets className="w-4 h-4" strokeWidth={1.6} />
                <span>{t.today.logPeriodToday}</span>
              </Button>
            )}
          </div>

          <div className="mt-6 w-full grid grid-cols-2 divide-x divide-rose-hairline border-y border-rose-hairline py-4">
            <div className="pr-3">
              <p className="text-[0.75rem] text-ink-muted">{t.today.nextPeriodLabel}</p>
              <p className="mt-1 text-[0.9375rem] font-semibold text-ink-primary tabular-nums">
                {summary.nextPeriodStart ? formatShortDate(summary.nextPeriodStart, locale) : '-'}
              </p>
            </div>
            <div className="pl-4">
              <p className="text-[0.75rem] text-ink-muted">{t.today.ovulationDateLabel}</p>
              <p className="mt-1 text-[0.9375rem] font-semibold text-fertile-sage-ink tabular-nums">
                {summary.ovulationDate ? formatShortDate(summary.ovulationDate, locale) : '-'}
              </p>
            </div>
          </div>

          <PhaseGuideCard status={summary.status} />
        </section>
      )}

      <TodayLogSummary log={todayLog} onEdit={() => onOpenLog(today)} />
    </div>
  );
}
