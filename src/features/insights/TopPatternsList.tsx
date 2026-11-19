import type { MoodId, PatternCount, SymptomId } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';

interface TopPatternsListProps {
  topSymptoms: PatternCount<SymptomId>[];
  topMoods: PatternCount<MoodId>[];
}

export function TopPatternsList({ topSymptoms, topMoods }: TopPatternsListProps) {
  const { t } = useI18n();
  const hasAny = topSymptoms.length > 0 || topMoods.length > 0;

  return (
    <section className="px-5 py-5 border-t border-rose-hairline space-y-5">
      {!hasAny ? (
        <div>
          <h2 className="text-[0.9375rem] font-semibold text-ink-primary mb-1.5">
            {t.insights.topSymptomsTitle}
          </h2>
          <p className="text-[0.875rem] leading-relaxed text-ink-secondary">
            {t.insights.patternsEmpty}
          </p>
        </div>
      ) : (
        <>
          {topSymptoms.length > 0 ? (
            <div>
              <h2 className="text-[0.9375rem] font-semibold text-ink-primary mb-3">
                {t.insights.topSymptomsTitle}
              </h2>
              <div className="space-y-3">
                {topSymptoms.slice(0, 5).map((item) => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between text-[0.875rem] mb-1">
                      <span className="text-ink-primary">{t.dailyLog.symptoms[item.id]}</span>
                      <span className="text-[0.75rem] text-ink-secondary tabular-nums">
                        {t.insights.loggedTimes(item.count, item.percentage)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-tinted-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full bg-coral-rose"
                        style={{ width: `${Math.max(8, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {topMoods.length > 0 ? (
            <div className={topSymptoms.length > 0 ? 'pt-5 border-t border-rose-hairline' : ''}>
              <h2 className="text-[0.9375rem] font-semibold text-ink-primary mb-3">
                {t.insights.topMoodsTitle}
              </h2>
              <div className="space-y-3">
                {topMoods.slice(0, 5).map((item) => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between text-[0.875rem] mb-1">
                      <span className="text-ink-primary">{t.dailyLog.moods[item.id]}</span>
                      <span className="text-[0.75rem] text-ink-secondary tabular-nums">
                        {t.insights.loggedTimes(item.count, item.percentage)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-tinted-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full bg-fertile-sage"
                        style={{ width: `${Math.max(8, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
