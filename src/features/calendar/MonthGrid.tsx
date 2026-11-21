import { Check } from 'lucide-react';
import { compareDates, getMonthGrid, parseISODate } from '../../domain/date-utils';
import type { DayCalendarInfo, ISODate } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';

interface MonthGridProps {
  year: number;
  month: number;
  today: ISODate;
  selectedDate: ISODate;
  calendarMap: Map<ISODate, DayCalendarInfo>;
  editMode: boolean;
  stagedPeriodDates: Set<ISODate>;
  onTapDate: (date: ISODate) => void;
}

export function MonthGrid({
  year,
  month,
  today,
  selectedDate,
  calendarMap,
  editMode,
  stagedPeriodDates,
  onTapDate,
}: MonthGridProps) {
  const { t } = useI18n();
  const cells = getMonthGrid(year, month);

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-7 mb-1.5">
        {t.calendar.weekdays.map((dayLabel) => (
          <div
            key={dayLabel}
            className="text-center text-[0.75rem] font-medium text-ink-muted py-1.5"
          >
            {dayLabel}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map(({ date, inCurrentMonth }) => {
          const info = calendarMap.get(date);
          const { day } = parseISODate(date);
          const isToday = date === today;
          const isSelected = !editMode && date === selectedDate;
          const isFuture = compareDates(date, today) > 0;

          let phase: string = 'none';
          if (editMode) {
            phase = stagedPeriodDates.has(date) ? 'logged-period' : 'none';
          } else if (info?.isLoggedPeriod) {
            phase = 'logged-period';
          } else if (info?.isPredictedPeriod) {
            phase = 'predicted-period';
          } else if (info?.isOvulation) {
            phase = 'ovulation';
          } else if (info?.isFertile) {
            phase = 'fertile';
          }

          let circleClasses = 'text-ink-primary hover:bg-tinted-subtle';
          if (phase === 'logged-period') {
            circleClasses = 'bg-coral-rose text-warm-surface font-semibold';
          } else if (phase === 'predicted-period') {
            circleClasses =
              'bg-predicted-blush text-coral-rose-ink border-[1.5px] border-dashed border-coral-rose font-medium';
          } else if (phase === 'ovulation') {
            circleClasses =
              'bg-fertile-sage-soft text-fertile-sage-ink ring-2 ring-fertile-sage font-semibold';
          } else if (phase === 'fertile') {
            circleClasses = 'bg-fertile-sage-soft text-fertile-sage-ink font-medium';
          }

          const disabled = editMode && isFuture;

          return (
            <button
              key={date}
              type="button"
              data-testid={`cal-day-${date}`}
              data-phase={phase}
              disabled={disabled}
              onClick={() => onTapDate(date)}
              aria-label={date}
              aria-pressed={isSelected}
              className={[
                'relative flex flex-col items-center justify-start min-h-11 py-0.5',
                'transition-[transform,opacity] duration-[150ms] active:scale-[0.95]',
                !inCurrentMonth ? 'opacity-35' : '',
                disabled ? 'opacity-30 pointer-events-none' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className={[
                  'w-11 h-11 rounded-[12px] flex items-center justify-center transition-colors duration-[150ms]',
                  isSelected ? 'bg-tinted-subtle' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className={[
                    'relative w-9 h-9 rounded-full flex items-center justify-center text-[0.875rem] tabular-nums transition-colors duration-[160ms]',
                    circleClasses,
                    isToday && phase !== 'logged-period'
                      ? `ring-2 ring-ink-primary/40 ring-offset-1 ${
                          isSelected ? 'ring-offset-tinted-subtle' : 'ring-offset-warm-surface'
                        }`
                      : '',
                    isToday && phase === 'logged-period'
                      ? `ring-2 ring-coral-rose ring-offset-2 ${
                          isSelected ? 'ring-offset-tinted-subtle' : 'ring-offset-warm-surface'
                        }`
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {day}
                  {editMode && stagedPeriodDates.has(date) ? (
                    <Check
                      aria-hidden="true"
                      className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 bg-warm-surface text-coral-rose rounded-full p-[1px]"
                    />
                  ) : null}
                </span>
              </span>

              <span className="h-1.5 mt-0.5 flex items-center justify-center gap-0.5">
                {!editMode && info?.isOvulation ? (
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-fertile-sage" />
                ) : null}
                {!editMode && info?.hasOtherLogs ? (
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-ink-secondary" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
