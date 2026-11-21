import { DEFAULT_OPTIONAL_TRACKERS, type OptionalTrackersConfig } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';
import { useCycle } from '../../state/CycleProvider';

type TrackerKey = keyof OptionalTrackersConfig;

export function OptionalTrackersSection() {
  const { settings, updateSettings } = useCycle();
  const { t } = useI18n();

  const current: OptionalTrackersConfig = {
    ...DEFAULT_OPTIONAL_TRACKERS,
    ...(settings.enabledTrackers ?? {}),
  };

  const rows: Array<{ key: TrackerKey; label: string }> = [
    { key: 'weight', label: t.settings.trackerWeight },
    { key: 'bbt', label: t.settings.trackerBbt },
    { key: 'pill', label: t.settings.trackerPill },
  ];

  const handleToggle = (key: TrackerKey) => {
    void updateSettings({
      enabledTrackers: {
        ...current,
        [key]: !current[key],
      },
    });
  };

  return (
    <section className="px-5 py-5 border-t border-rose-hairline">
      <h2 className="text-[0.9375rem] font-semibold text-ink-primary">
        {t.settings.trackersTitle}
      </h2>
      <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-secondary mb-3">
        {t.settings.trackersDescription}
      </p>

      <div className="divide-y divide-rose-hairline border-t border-rose-hairline">
        {rows.map((row) => {
          const enabled = current[row.key];
          return (
            <div key={row.key} className="py-3 flex items-center justify-between gap-3">
              <span className="text-[0.9375rem] text-ink-primary">{row.label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={row.label}
                onClick={() => handleToggle(row.key)}
                className={[
                  'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-[150ms]',
                  enabled ? 'bg-coral-rose' : 'bg-rose-hairline',
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'inline-block h-6 w-6 rounded-full bg-warm-surface transition-transform duration-[150ms]',
                    enabled ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
