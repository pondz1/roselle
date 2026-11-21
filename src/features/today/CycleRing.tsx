import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { computeConceptionChance } from '../../domain/cycle-engine';
import { addDays, diffDays, formatShortDate } from '../../domain/date-utils';
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
  const { locale, t } = useI18n();
  const [inspectedDay, setInspectedDay] = useState<number | null>(null);

  const cycleStart = summary.latestEpisode?.startDate ?? null;

  useEffect(() => {
    setInspectedDay(null);
  }, [summary.today, summary.currentCycleDay, cycleStart]);

  const totalDays = clamp(summary.predictedCycleLength, 18, 45);
  const periodDays = clamp(summary.predictedPeriodLength, 1, totalDays);

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

  const isInspecting = inspectedDay !== null && cycleStart !== null;

  let displayChance = summary.conceptionChance;
  let isFertileTone = summary.status === 'ovulation' || summary.status === 'fertile';
  let isLateTone = summary.status === 'late';

  let headline = '';
  let eyebrow = '';
  let subtext = '';

  if (isInspecting && inspectedDay !== null && cycleStart !== null) {
    const inspectedDate = addDays(cycleStart, inspectedDay - 1);
    const inspectedIsPeriod = inspectedDay <= periodDays;
    const inspectedIsOvulation = ovulationDay !== null && inspectedDay === ovulationDay;
    const inspectedIsFertile =
      fertileStartDay !== null &&
      fertileEndDay !== null &&
      !inspectedIsPeriod &&
      inspectedDay >= fertileStartDay &&
      inspectedDay <= fertileEndDay;

    isFertileTone = inspectedIsOvulation || inspectedIsFertile;
    isLateTone = false;

    displayChance = summary.ovulationDate
      ? computeConceptionChance(inspectedDate, summary.ovulationDate, inspectedIsPeriod)
      : 'low';

    let phaseTitle = t.today.wheelPhases.luteal;
    if (inspectedIsPeriod) {
      phaseTitle = t.today.wheelPhases.period;
    } else if (inspectedIsOvulation) {
      phaseTitle = t.today.wheelPhases.ovulation;
    } else if (inspectedIsFertile) {
      phaseTitle = t.today.wheelPhases.fertile;
    } else if (ovulationDay !== null && inspectedDay < ovulationDay) {
      phaseTitle = t.today.wheelPhases.follicular;
    }

    eyebrow = t.today.cycleDay(inspectedDay);
    headline = phaseTitle;
    subtext = formatShortDate(inspectedDate, locale);
  } else {
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
  }

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
    displayChance === 'high'
      ? 'bg-fertile-sage-soft text-fertile-sage-ink'
      : displayChance === 'medium'
        ? 'bg-fertile-sage-soft/75 text-fertile-sage-ink'
        : 'bg-tinted-subtle text-ink-secondary';

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
  const inspectedKnobPos =
    isInspecting && inspectedDay !== null
      ? polarToCartesian(CENTER, CENTER, RING_RADIUS, dayToAngleDeg(inspectedDay, totalDays))
      : null;
  const ovulationPos =
    ovulationDay !== null
      ? polarToCartesian(CENTER, CENTER, RING_RADIUS, dayToAngleDeg(ovulationDay, totalDays))
      : null;

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handleSelectDay = (day: number) => {
    if (!cycleStart) return;
    setInspectedDay((prev) => {
      if (day === activeDay || prev === day) return null;
      return day;
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[304px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full h-full"
          role="group"
          aria-label={t.today.wheelAriaLabel}
        >
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
              stroke="var(--color-coral-rose)"
              strokeOpacity={isInspecting ? 0.45 : 1}
              strokeWidth={3}
            />
            <circle
              cx={activeKnobPos.x}
              cy={activeKnobPos.y}
              r={3.5}
              fill={isInspecting ? 'var(--color-ink-muted)' : strokeColor}
            />
          </g>

          {inspectedKnobPos ? (
            <g>
              <circle
                cx={inspectedKnobPos.x}
                cy={inspectedKnobPos.y}
                r={9.5}
                fill="var(--color-warm-surface)"
                stroke={strokeColor}
                strokeWidth={3}
              />
              <circle cx={inspectedKnobPos.x} cy={inspectedKnobPos.y} r={3.5} fill={strokeColor} />
            </g>
          ) : null}

          {days.map((day) => {
            const angle = dayToAngleDeg(day, totalDays);
            const dotPos = polarToCartesian(CENTER, CENTER, RING_RADIUS, angle);
            const labelPos = polarToCartesian(CENTER, CENTER, LABEL_RADIUS, angle);
            const isActive = day === activeDay;
            const isInspected = isInspecting && day === inspectedDay;
            const isOvulation = day === ovulationDay;
            const isPeriodDay = day <= periodDays;
            const isFertileDay =
              fertileStartDay !== null &&
              fertileEndDay !== null &&
              day > periodDays &&
              day >= fertileStartDay &&
              day <= fertileEndDay;

            const fontSize = isInspected || isActive ? 11 : totalDays > 34 ? 8.5 : 9.5;
            const fontWeight =
              isInspected || isActive
                ? 700
                : isOvulation
                  ? 600
                  : isPeriodDay || isFertileDay
                    ? 500
                    : 400;
            const fill = isInspected
              ? activeLabelColor
              : isActive
                ? isInspecting
                  ? 'var(--color-ink-secondary)'
                  : activeLabelColor
                : isOvulation
                  ? 'var(--color-fertile-sage-ink)'
                  : isPeriodDay
                    ? 'var(--color-coral-rose-ink)'
                    : isFertileDay
                      ? 'var(--color-fertile-sage-ink)'
                      : 'var(--color-ink-muted)';

            const dayDateStr = cycleStart
              ? formatShortDate(addDays(cycleStart, day - 1), locale)
              : '';

            return (
              <g
                key={`day-${day}`}
                role="button"
                tabIndex={0}
                aria-label={t.today.wheelDayAriaLabel(day, dayDateStr)}
                aria-pressed={isInspected}
                data-cycle-day={day}
                data-active={isActive ? 'true' : undefined}
                data-inspected={isInspected ? 'true' : undefined}
                onClick={() => handleSelectDay(day)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectDay(day);
                  }
                }}
                className="cursor-pointer outline-none focus-visible:opacity-90"
              >
                <line
                  x1={dotPos.x}
                  y1={dotPos.y}
                  x2={labelPos.x}
                  y2={labelPos.y}
                  stroke="transparent"
                  strokeWidth={20}
                  strokeLinecap="round"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  fill={fill}
                  className="tabular-nums select-none"
                >
                  {day}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-[20%] flex flex-col items-center justify-center text-center px-2">
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

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <div
          className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[0.8125rem] font-medium ${chancePillClass}`}
        >
          <span>{t.today.conceptionChanceLabel}:</span>
          <span className="font-semibold">{t.today.conceptionChance[displayChance]}</span>
        </div>

        {isInspecting ? (
          <button
            type="button"
            onClick={() => setInspectedDay(null)}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-coral-rose-soft text-coral-rose-ink px-3 py-1.5 text-[0.8125rem] font-medium hover:bg-coral-rose-soft/80 transition-colors duration-[150ms]"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.6} />
            <span>{t.today.wheelBackToToday}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
