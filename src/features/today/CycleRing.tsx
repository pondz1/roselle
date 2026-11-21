import { diffDays } from '../../domain/date-utils';
import type { CycleSummary } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';

interface CycleRingProps {
  summary: CycleSummary;
}

const SIZE = 304;
const CENTER = SIZE / 2;
const LABEL_RADIUS = 136;
const RING_RADIUS = 110;
const STROKE = 14;
const INNER_RADIUS = 94;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function dayToAngleDeg(day: number, totalDays: number): number {
  return -90 + ((day - 1) / totalDays) * 360;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number,
): string {
  const safeEnd = endAngleDeg - startAngleDeg <= 0.5 ? startAngleDeg + 0.5 : endAngleDeg;
  const start = polarToCartesian(cx, cy, r, startAngleDeg);
  const end = polarToCartesian(cx, cy, r, safeEnd);
  const largeArcFlag = safeEnd - startAngleDeg > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function CycleRing({ summary }: CycleRingProps) {
  const { t } = useI18n();

  const isFertileTone = summary.status === 'ovulation' || summary.status === 'fertile';
  const isLateTone = summary.status === 'late';

  const strokeColor = isLateTone
    ? 'var(--color-amber-late)'
    : isFertileTone
      ? 'var(--color-fertile-sage)'
      : 'var(--color-coral-rose)';

  const activeLabelColor = isLateTone
    ? 'var(--color-amber-late-ink)'
    : isFertileTone
      ? 'var(--color-fertile-sage-ink)'
      : 'var(--color-coral-rose-ink)';

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

  const totalDays = clamp(summary.predictedCycleLength, 18, 45);
  const periodDays = clamp(summary.predictedPeriodLength, 1, totalDays);
  const cycleStart = summary.latestEpisode?.startDate ?? null;

  const ovulationDay =
    cycleStart && summary.ovulationDate
      ? clamp(diffDays(cycleStart, summary.ovulationDate) + 1, 1, totalDays)
      : null;

  const fertileStartDay =
    cycleStart && summary.fertileStart
      ? clamp(diffDays(cycleStart, summary.fertileStart) + 1, 1, totalDays)
      : null;

  const fertileEndDay =
    cycleStart && summary.fertileEnd
      ? clamp(diffDays(cycleStart, summary.fertileEnd) + 1, 1, totalDays)
      : null;

  const activeDay =
    summary.status === 'late' ? totalDays : clamp(summary.currentCycleDay ?? 1, 1, totalDays);

  const periodArcPath = describeArc(
    CENTER,
    CENTER,
    RING_RADIUS,
    dayToAngleDeg(1, totalDays),
    dayToAngleDeg(periodDays, totalDays),
  );

  const fertileArcStart =
    fertileStartDay !== null ? Math.max(periodDays + 1, fertileStartDay) : null;
  const hasFertileArc =
    fertileArcStart !== null && fertileEndDay !== null && fertileEndDay >= fertileArcStart;
  const fertileArcPath = hasFertileArc
    ? describeArc(
        CENTER,
        CENTER,
        RING_RADIUS,
        dayToAngleDeg(fertileArcStart, totalDays),
        dayToAngleDeg(fertileEndDay, totalDays),
      )
    : null;

  const activeKnobPos = polarToCartesian(
    CENTER,
    CENTER,
    RING_RADIUS,
    dayToAngleDeg(activeDay, totalDays),
  );
  const ovulationPos =
    ovulationDay !== null
      ? polarToCartesian(CENTER, CENTER, RING_RADIUS, dayToAngleDeg(ovulationDay, totalDays))
      : null;

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[304px] aspect-square flex items-center justify-center">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full" aria-hidden="true">
          <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS} fill={innerFill} />

          <circle
            cx={CENTER}
            cy={CENTER}
            r={RING_RADIUS}
            fill="none"
            stroke="var(--color-tinted-subtle)"
            strokeWidth={STROKE}
          />

          <path
            d={periodArcPath}
            fill="none"
            stroke="var(--color-coral-rose)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {fertileArcPath ? (
            <path
              d={fertileArcPath}
              fill="none"
              stroke="var(--color-fertile-sage)"
              strokeOpacity={0.34}
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
          ) : null}

          {days.map((day) => {
            const angle = dayToAngleDeg(day, totalDays);
            const dotPos = polarToCartesian(CENTER, CENTER, RING_RADIUS, angle);
            const isPeriodDay = day <= periodDays;
            const isFertileDay =
              fertileStartDay !== null &&
              fertileEndDay !== null &&
              day > periodDays &&
              day >= fertileStartDay &&
              day <= fertileEndDay;

            return (
              <circle
                key={`dot-${day}`}
                cx={dotPos.x}
                cy={dotPos.y}
                r={1.6}
                fill={
                  isPeriodDay
                    ? 'var(--color-warm-surface)'
                    : isFertileDay
                      ? 'var(--color-fertile-sage)'
                      : 'var(--color-rose-hairline)'
                }
                fillOpacity={isPeriodDay ? 0.75 : isFertileDay ? 0.55 : 1}
              />
            );
          })}

          {ovulationPos ? (
            <circle
              cx={ovulationPos.x}
              cy={ovulationPos.y}
              r={5.5}
              fill="var(--color-fertile-sage)"
              stroke="var(--color-warm-surface)"
              strokeWidth={2}
            />
          ) : null}

          <g
            style={{
              transition: 'transform 220ms var(--ease-out-expo)',
            }}
          >
            <circle
              cx={activeKnobPos.x}
              cy={activeKnobPos.y}
              r={9.5}
              fill="var(--color-warm-surface)"
              stroke={strokeColor}
              strokeWidth={3}
            />
            <circle cx={activeKnobPos.x} cy={activeKnobPos.y} r={3.5} fill={strokeColor} />
          </g>

          {days.map((day) => {
            const angle = dayToAngleDeg(day, totalDays);
            const labelPos = polarToCartesian(CENTER, CENTER, LABEL_RADIUS, angle);
            const isActive = day === activeDay;
            const isOvulation = day === ovulationDay;
            const isPeriodDay = day <= periodDays;
            const isFertileDay =
              fertileStartDay !== null &&
              fertileEndDay !== null &&
              day > periodDays &&
              day >= fertileStartDay &&
              day <= fertileEndDay;

            const fontSize = isActive ? 11 : totalDays > 34 ? 8.5 : 9.5;
            const fontWeight = isActive
              ? 700
              : isOvulation
                ? 600
                : isPeriodDay || isFertileDay
                  ? 500
                  : 400;
            const fill = isActive
              ? activeLabelColor
              : isOvulation
                ? 'var(--color-fertile-sage-ink)'
                : isPeriodDay
                  ? 'var(--color-coral-rose-ink)'
                  : isFertileDay
                    ? 'var(--color-fertile-sage-ink)'
                    : 'var(--color-ink-muted)';

            return (
              <text
                key={`day-${day}`}
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fontSize}
                fontWeight={fontWeight}
                fill={fill}
                className="tabular-nums select-none"
                data-cycle-day={day}
                data-active={isActive ? 'true' : undefined}
              >
                {day}
              </text>
            );
          })}
        </svg>

        <div className="absolute inset-[20%] flex flex-col items-center justify-center text-center px-2">
          {eyebrow ? (
            <span className="text-[0.75rem] font-medium text-ink-secondary tabular-nums">
              {eyebrow}
            </span>
          ) : null}
          <div className="mt-1 text-[1.1875rem] font-semibold leading-snug text-ink-primary tabular-nums text-balance">
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
        className={`mt-4 inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[0.8125rem] font-medium ${chancePillClass}`}
      >
        <span>{t.today.conceptionChanceLabel}:</span>
        <span className="font-semibold">{t.today.conceptionChance[summary.conceptionChance]}</span>
      </div>
    </div>
  );
}
