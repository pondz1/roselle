import { useI18n } from '../../i18n/I18nProvider';

export function CalendarLegend() {
  const { t } = useI18n();

  return (
    <div className="px-5 py-4 border-t border-rose-hairline flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.75rem] text-ink-secondary">
      <div className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="w-3 h-3 rounded-full bg-coral-rose" />
        <span>{t.calendar.legend.loggedPeriod}</span>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="w-3 h-3 rounded-full bg-predicted-blush border-[1.5px] border-dashed border-coral-rose"
        />
        <span>{t.calendar.legend.predictedPeriod}</span>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="w-3 h-3 rounded-full bg-fertile-sage-soft" />
        <span>{t.calendar.legend.fertile}</span>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="w-3 h-3 rounded-full bg-fertile-sage-soft ring-[1.5px] ring-fertile-sage"
        />
        <span>{t.calendar.legend.ovulation}</span>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-ink-secondary" />
        <span>{t.calendar.legend.loggedNote}</span>
      </div>
    </div>
  );
}
