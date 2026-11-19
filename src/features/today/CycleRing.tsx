import type { CycleSummary } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';

interface CycleRingProps {
  summary: CycleSummary;
}

const SIZE = 248;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CycleRing({ summary }: CycleRingProps) {
  const { t } = useI18n();

  const progress = Math.max(0.04, Math.min(1, summary.progressRatio));
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const isFertileTone = summary.status === 'ovulation' || summary.status === 'fertile';
  const isLateTone = summary.status === 'late';

  const strokeColor = isLateTone
    ? 'var(--color-amber-late)'
    : isFertileTone
      ? 'var(--color-fertile-sage)'
      : 'var(--color-coral-rose)';

  const innerFill = isLateTone
    ? 'var(--color-amber-late-soft)'
    : isFertileTone
      ? 'var(--color-fertile-sage-soft)'
      : 'var(--color-blush-canvas)';

  const chancePillClass =
    summary.conceptionChance === 'high'
      ? 'bg-fertile-sage-soft text-fertile-sage-ink'
      : summary.conceptionChance === 'medium'
        ? 'bg-fertile-sage-soft/75 text-fertile-sage-ink'
        : 'bg-tinted-subtle text-ink-secondary';

  let headline = '';
  let eyebrow = '';
  let subtext = '';

  switch (summary.status) {
    case 'period':
      eyebrow = summary.currentCycleDay ? t.today.cycleDay(summary.currentCycleDay) : '';
      headline = t.today.periodDayTitle(summary.periodDay ?? 1);
      subtext = t.today.periodSubtitle;
      break;
    case 'period_due_today':
      eyebrow = summary.currentCycleDay ? t.today.cycleDay(summary.currentCycleDay) : '';
      headline = t.today.periodDueToday;
      subtext = t.today.periodSubtitle;
      break;
    case 'late':
      eyebrow = summary.currentCycleDay ? t.today.cycleDay(summary.currentCycleDay) : '';
      headline = t.today.periodLateTitle(summary.daysLate);
      subtext = t.today.periodLateSubtitle;
      break;
    case 'ovulation':
      eyebrow = summary.currentCycleDay ? t.today.cycleDay(summary.currentCycleDay) : '';
      headline = t.today.ovulationTitle;
      subtext = t.today.ovulationSubtitle;
      break;
    case 'fertile':
      eyebrow = summary.currentCycleDay ? t.today.cycleDay(summary.currentCycleDay) : '';
      headline = t.today.fertileTitle;
      subtext = t.today.fertileSubtitle;
      break;
    case 'follicular':
    case 'luteal':
      eyebrow = t.today.countdownLabel;
      headline = t.today.daysUntilPeriod(summary.daysUntilNextPeriod ?? 0);
      subtext = summary.currentCycleDay ? t.today.cycleDay(summary.currentCycleDay) : '';
      break;
    default:
      break;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS - STROKE / 2 - 4}
            fill={innerFill}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-tinted-subtle)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 220ms var(--ease-out-expo), stroke 200ms var(--ease-out-expo)',
            }}
          />
        </svg>

        <div className="absolute inset-5 flex flex-col items-center justify-center text-center px-2">
          {eyebrow ? (
            <span className="text-[0.75rem] font-medium text-ink-secondary tabular-nums">
              {eyebrow}
            </span>
          ) : null}
          <div className="mt-1 text-[1.1875rem] font-bold leading-snug text-ink-primary tabular-nums text-balance">
            {headline}
          </div>
          {subtext ? (
            <p className="mt-1.5 text-[0.75rem] leading-snug text-ink-secondary max-w-[18ch] tabular-nums">
              {subtext}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium ${chancePillClass}`}
      >
        <span>{t.today.conceptionChanceLabel}:</span>
        <span className="font-semibold">{t.today.conceptionChance[summary.conceptionChance]}</span>
      </div>
    </div>
  );
}
