import { useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { addMonths, compareDates, formatMonthYear, parseISODate } from '../../domain/date-utils';
import type { FlowLevel, ISODate } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';
import { useCycle } from '../../state/CycleProvider';
import { CalendarLegend } from './CalendarLegend';
import { MonthGrid } from './MonthGrid';
import { PeriodEditBanner } from './PeriodEditBanner';
import { SelectedDayPanel } from './SelectedDayPanel';

interface CalendarViewProps {
  onSelectDate: (date: ISODate) => void;
}

export function CalendarView({ onSelectDate }: CalendarViewProps) {
  const { today, logs, calendarMap, bulkSetPeriodDays } = useCycle();
  const { locale, t } = useI18n();

  const initial = parseISODate(today);
  const [cursor, setCursor] = useState<{ year: number; month: number }>({
    year: initial.year,
    month: initial.month,
  });
  const [selectedDate, setSelectedDate] = useState<ISODate>(today);
  const [editMode, setEditMode] = useState(false);
  const [stagedDates, setStagedDates] = useState<Set<ISODate>>(new Set());
  const [saving, setSaving] = useState(false);

  const isCurrentMonth = cursor.year === initial.year && cursor.month === initial.month;

  const enterEditMode = () => {
    const initialSet = new Set<ISODate>();
    for (const log of logs) {
      if (log.flow !== 'none') {
        initialSet.add(log.date);
      }
    }
    setStagedDates(initialSet);
    setEditMode(true);
  };

  const handleTapDate = (date: ISODate) => {
    if (!editMode) {
      setSelectedDate(date);
      return;
    }
    if (compareDates(date, today) > 0) return;
    setStagedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const originalSet = new Set(
        logs.filter((l) => l.flow !== 'none').map((l) => l.date),
      );
      const updates: Array<{ date: ISODate; flow: FlowLevel }> = [];

      for (const date of stagedDates) {
        if (!originalSet.has(date)) {
          updates.push({ date, flow: 'medium' });
        }
      }
      for (const date of originalSet) {
        if (!stagedDates.has(date)) {
          updates.push({ date, flow: 'none' });
        }
      }

      if (updates.length > 0) {
        await bulkSetPeriodDays(updates);
      }
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = stagedDates.size;

  return (
    <div className="flex flex-col pb-6">
      <header className="px-5 pt-6 pb-4 flex items-center justify-between gap-2">
        <h1 className="text-[1.375rem] font-semibold text-ink-primary">
          {t.calendar.title}
        </h1>
        {!editMode ? (
          <Button variant="secondary" size="sm" onClick={enterEditMode}>
            <CalendarPlus className="w-4 h-4" strokeWidth={1.6} />
            <span>{t.calendar.editPeriodDays}</span>
          </Button>
        ) : null}
      </header>

      {editMode ? (
        <PeriodEditBanner
          selectedCount={selectedCount}
          saving={saving}
          onCancel={() => setEditMode(false)}
          onSave={() => void handleSaveEdit()}
        />
      ) : null}

      <div className="px-5 pb-3 flex items-center justify-between">
        <h2 className="text-[1.0625rem] font-semibold text-ink-primary tabular-nums">
          {formatMonthYear(cursor.year, cursor.month, locale)}
        </h2>

        <div className="flex items-center gap-1">
          {!isCurrentMonth ? (
            <button
              type="button"
              onClick={() => {
                setCursor({ year: initial.year, month: initial.month });
                setSelectedDate(today);
              }}
              className="mr-1 px-3 py-1.5 rounded-[8px] text-[0.75rem] font-medium bg-tinted-subtle text-ink-primary hover:bg-coral-rose-soft hover:text-coral-rose-ink transition-colors"
            >
              {t.calendar.jumpToday}
            </button>
          ) : null}
          <button
            type="button"
            aria-label={t.calendar.prevMonth}
            onClick={() => setCursor((c) => addMonths(c.year, c.month, -1))}
            className="w-10 h-10 rounded-[10px] inline-flex items-center justify-center text-ink-secondary hover:bg-tinted-subtle hover:text-ink-primary transition-colors"
          >
            <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.6} />
          </button>
          <button
            type="button"
            aria-label={t.calendar.nextMonth}
            onClick={() => setCursor((c) => addMonths(c.year, c.month, 1))}
            className="w-10 h-10 rounded-[10px] inline-flex items-center justify-center text-ink-secondary hover:bg-tinted-subtle hover:text-ink-primary transition-colors"
          >
            <ChevronRight className="w-[18px] h-[18px]" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <MonthGrid
        year={cursor.year}
        month={cursor.month}
        today={today}
        selectedDate={selectedDate}
        calendarMap={calendarMap}
        editMode={editMode}
        stagedPeriodDates={stagedDates}
        onTapDate={handleTapDate}
      />

      <CalendarLegend />

      {!editMode ? (
        <SelectedDayPanel date={selectedDate} onOpenDetails={onSelectDate} />
      ) : null}
    </div>
  );
}
