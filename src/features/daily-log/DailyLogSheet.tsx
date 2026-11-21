import { useEffect, useState } from 'react';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { compareDates, formatFullDate } from '../../domain/date-utils';
import {
  ACTIVITY_IDS,
  FLOW_LEVELS,
  MOOD_IDS,
  SYMPTOM_IDS,
  type ActivityId,
  type FlowLevel,
  type ISODate,
  type MoodId,
  type SymptomId,
} from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';
import { useCycle } from '../../state/CycleProvider';

interface DailyLogSheetProps {
  date: ISODate | null;
  open: boolean;
  onClose: () => void;
}

function toggleInList<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function DailyLogSheet({ date, open, onClose }: DailyLogSheetProps) {
  const { logsByDate, calendarMap, today, saveLog } = useCycle();
  const { locale, t } = useI18n();

  const [flow, setFlow] = useState<FlowLevel>('none');
  const [symptoms, setSymptoms] = useState<SymptomId[]>([]);
  const [moods, setMoods] = useState<MoodId[]>([]);
  const [activities, setActivities] = useState<ActivityId[]>([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const dayInfo = date ? calendarMap.get(date) : undefined;
  const isFuture = date ? compareDates(date, today) > 0 : false;

  useEffect(() => {
    if (!open || !date) return;
    const current = logsByDate.get(date);
    setFlow(current?.flow ?? 'none');
    setSymptoms(current?.symptoms ?? []);
    setMoods(current?.moods ?? []);
    setActivities(current?.activities ?? []);
    setNote(current?.note ?? '');
    // Hydrate form only when opening the sheet or switching target date
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, date]);

  if (!date) return null;

  const formattedDate = formatFullDate(date, locale);

  let statusLabel: string | undefined;
  if (dayInfo?.isLoggedPeriod) statusLabel = t.dailyLog.statusLoggedPeriod;
  else if (dayInfo?.isPredictedPeriod) statusLabel = t.dailyLog.statusPredictedPeriod;
  else if (dayInfo?.isOvulation) statusLabel = t.dailyLog.statusOvulation;
  else if (dayInfo?.isFertile) statusLabel = t.dailyLog.statusFertile;

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveLog({
        date,
        flow,
        symptoms,
        moods,
        activities,
        note,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setFlow('none');
    setSymptoms([]);
    setMoods([]);
    setActivities([]);
    setNote('');
  };

  return (
    <BottomSheet
      open={open}
      title={formattedDate}
      subtitle={statusLabel}
      onClose={onClose}
      closeLabel={t.common.close}
      footer={
        !isFuture ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleClear} disabled={saving}>
              {t.common.clear}
            </Button>
            <Button fullWidth size="lg" onClick={handleSave} disabled={saving}>
              {t.common.save}
            </Button>
          </div>
        ) : undefined
      }
    >
      {isFuture ? (
        <div className="py-4 space-y-3">
          {dayInfo ? (
            <div className="rounded-[12px] bg-tinted-subtle px-4 py-3 text-[0.875rem] text-ink-primary flex items-center justify-between">
              <span className="text-ink-secondary">{t.today.conceptionChanceLabel}</span>
              <span className="font-semibold text-fertile-sage-ink">
                {t.today.conceptionChance[dayInfo.conceptionChance]}
              </span>
            </div>
          ) : null}
          <p className="text-[0.9375rem] font-medium text-ink-primary">{t.dailyLog.futureTitle}</p>
          <p className="text-[0.875rem] leading-relaxed text-ink-secondary">
            {t.dailyLog.futureBody}
          </p>
        </div>
      ) : (
        <div className="space-y-6 pb-2">
          <section>
            <h3 className="text-[0.875rem] font-medium text-ink-secondary mb-3">
              {t.dailyLog.flowSection}
            </h3>
            <div className="flex flex-wrap gap-2">
              {FLOW_LEVELS.map((level) => (
                <Chip
                  key={level}
                  selected={flow === level}
                  onToggle={() => setFlow(level)}
                >
                  {t.dailyLog.flow[level]}
                </Chip>
              ))}
            </div>
          </section>

          <section className="pt-5 border-t border-rose-hairline">
            <h3 className="text-[0.875rem] font-medium text-ink-secondary mb-3">
              {t.dailyLog.symptomsSection}
            </h3>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_IDS.map((id) => (
                <Chip
                  key={id}
                  selected={symptoms.includes(id)}
                  onToggle={() => setSymptoms((prev) => toggleInList(prev, id))}
                >
                  {t.dailyLog.symptoms[id]}
                </Chip>
              ))}
            </div>
          </section>

          <section className="pt-5 border-t border-rose-hairline">
            <h3 className="text-[0.875rem] font-medium text-ink-secondary mb-3">
              {t.dailyLog.moodsSection}
            </h3>
            <div className="flex flex-wrap gap-2">
              {MOOD_IDS.map((id) => (
                <Chip
                  key={id}
                  selected={moods.includes(id)}
                  onToggle={() => setMoods((prev) => toggleInList(prev, id))}
                >
                  {t.dailyLog.moods[id]}
                </Chip>
              ))}
            </div>
          </section>

          <section className="pt-5 border-t border-rose-hairline">
            <h3 className="text-[0.875rem] font-medium text-ink-secondary mb-3">
              {t.dailyLog.activitiesSection}
            </h3>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_IDS.map((id) => (
                <Chip
                  key={id}
                  tone="sage"
                  selected={activities.includes(id)}
                  onToggle={() => setActivities((prev) => toggleInList(prev, id))}
                >
                  {t.dailyLog.activities[id]}
                </Chip>
              ))}
            </div>
          </section>

          <section className="pt-5 border-t border-rose-hairline">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="daily-log-note"
                className="text-[0.875rem] font-medium text-ink-secondary"
              >
                {t.dailyLog.noteSection}
              </label>
              <span className="text-[0.75rem] text-ink-muted tabular-nums">{note.length}/500</span>
            </div>
            <textarea
              id="daily-log-note"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.dailyLog.notePlaceholder}
              className="w-full rounded-[10px] bg-tinted-subtle border border-rose-hairline px-4 py-3 text-[0.9375rem] text-ink-primary placeholder:text-ink-muted focus:bg-warm-surface resize-none"
            />
          </section>
        </div>
      )}
    </BottomSheet>
  );
}
