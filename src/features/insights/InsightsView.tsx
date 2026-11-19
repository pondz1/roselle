import { useI18n } from '../../i18n/I18nProvider';
import { useCycle } from '../../state/CycleProvider';
import { CycleHistoryList } from './CycleHistoryList';
import { CycleTrendChart } from './CycleTrendChart';
import { TopPatternsList } from './TopPatternsList';

export function InsightsView() {
  const { insights } = useCycle();
  const { t } = useI18n();

  return (
    <div className="flex flex-col pb-8">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-[1.375rem] font-semibold tracking-tight text-ink-primary">
          {t.insights.title}
        </h1>
      </header>

      <section className="px-5 pb-5">
        <div className="grid grid-cols-3 divide-x divide-rose-hairline rounded-[16px] bg-tinted-subtle/75 py-4">
          <div className="px-3 text-center">
            <p className="text-[0.75rem] text-ink-muted">{t.insights.avgCycle}</p>
            <p className="mt-1 text-[1.125rem] font-bold text-ink-primary tabular-nums">
              {insights.averageCycleLength !== null
                ? t.common.days(insights.averageCycleLength)
                : t.insights.noValue}
            </p>
          </div>
          <div className="px-3 text-center">
            <p className="text-[0.75rem] text-ink-muted">{t.insights.avgPeriod}</p>
            <p className="mt-1 text-[1.125rem] font-bold text-coral-rose-ink tabular-nums">
              {insights.averagePeriodLength !== null
                ? t.common.days(insights.averagePeriodLength)
                : t.insights.noValue}
            </p>
          </div>
          <div className="px-3 text-center">
            <p className="text-[0.75rem] text-ink-muted">{t.insights.variation}</p>
            <p className="mt-1 text-[1.125rem] font-bold text-ink-primary tabular-nums">
              {insights.cycleVariation !== null
                ? `+/-${insights.cycleVariation}${t.common.dayShort}`
                : t.insights.noValue}
            </p>
          </div>
        </div>
      </section>

      <CycleTrendChart
        history={insights.cycleHistory}
        averageCycleLength={insights.averageCycleLength}
      />
      <CycleHistoryList history={insights.cycleHistory} />
      <TopPatternsList
        topSymptoms={insights.topSymptoms}
        topMoods={insights.topMoods}
      />

      <footer className="px-5 pt-5 border-t border-rose-hairline">
        <p className="text-[0.75rem] leading-relaxed text-ink-muted">{t.insights.disclaimer}</p>
      </footer>
    </div>
  );
}
