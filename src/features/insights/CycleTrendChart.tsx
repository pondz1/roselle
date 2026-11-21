import { formatShortDate } from '../../domain/date-utils';
import type { CycleHistoryItem } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';

interface CycleTrendChartProps {
  history: CycleHistoryItem[];
  averageCycleLength: number | null;
}

export function CycleTrendChart({ history, averageCycleLength }: CycleTrendChartProps) {
  const { locale, t } = useI18n();

  const completed = history
    .filter((item) => item.cycleLength !== null && !item.isOutlier)
    .slice(0, 6)
    .reverse();

  if (completed.length === 0) {
    return (
      <section className="px-5 py-5 border-t border-rose-hairline">
        <h2 className="text-[0.9375rem] font-semibold text-ink-primary mb-2">
          {t.insights.trendTitle}
        </h2>
        <p className="text-[0.875rem] leading-relaxed text-ink-secondary">
          {t.insights.trendEmpty}
        </p>
      </section>
    );
  }

  const maxVal = Math.max(35, ...completed.map((c) => c.cycleLength ?? 28));
  const chartHeight = 132;
  const chartWidth = 340;
  const topPad = 24;
  const bottomPad = 26;
  const usableHeight = chartHeight - topPad - bottomPad;
  const slotWidth = chartWidth / completed.length;
  const barWidth = Math.min(34, Math.max(18, slotWidth * 0.48));

  const avgY =
    averageCycleLength !== null
      ? topPad + usableHeight * (1 - averageCycleLength / maxVal)
      : null;

  return (
    <section className="px-5 py-5 border-t border-rose-hairline">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[0.9375rem] font-semibold text-ink-primary">
          {t.insights.trendTitle}
        </h2>
        {averageCycleLength !== null ? (
          <span className="text-[0.75rem] font-medium text-coral-rose-ink tabular-nums">
            {t.insights.trendAverageLabel(averageCycleLength)}
          </span>
        ) : null}
      </div>

      <div className="rounded-[12px] bg-tinted-subtle/65 px-3 pt-4 pb-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label={t.insights.trendTitle}
        >
          <line
            x1={4}
            x2={chartWidth - 4}
            y1={topPad + usableHeight}
            y2={topPad + usableHeight}
            stroke="var(--color-rose-hairline)"
            strokeWidth={1}
          />
          {avgY !== null ? (
            <line
              x1={4}
              x2={chartWidth - 4}
              y1={avgY}
              y2={avgY}
              stroke="var(--color-coral-rose)"
              strokeOpacity={0.4}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          ) : null}

          {completed.map((item, idx) => {
            const len = item.cycleLength ?? 0;
            const barH = Math.max(8, (len / maxVal) * usableHeight);
            const x = idx * slotWidth + (slotWidth - barWidth) / 2;
            const y = topPad + (usableHeight - barH);
            const centerX = x + barWidth / 2;
            const isLatest = idx === completed.length - 1;

            return (
              <g key={item.startDate}>
                <text
                  x={centerX}
                  y={y - 6}
                  textAnchor="middle"
                  fill={isLatest ? 'var(--color-coral-rose-ink)' : 'var(--color-ink-secondary)'}
                  fontSize="11"
                  fontWeight={isLatest ? '600' : '500'}
                  className="tabular-nums"
                >
                  {len}
                </text>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={4}
                  fill={isLatest ? 'var(--color-coral-rose)' : 'var(--color-chart-muted)'}
                />
                <text
                  x={centerX}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  fill={isLatest ? 'var(--color-ink-primary)' : 'var(--color-ink-muted)'}
                  fontSize="10"
                  className="tabular-nums"
                >
                  {formatShortDate(item.startDate, locale)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
