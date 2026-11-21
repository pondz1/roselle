import { ShieldCheck } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { useCycle } from '../../state/CycleProvider';
import { BackupControls } from './BackupControls';
import { OptionalTrackersSection } from './OptionalTrackersSection';
import { PinSettingsSection } from './PinSettingsSection';

interface StepperRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (next: number) => void;
}

function StepperRow({ label, value, min, max, unit, onChange }: StepperRowProps) {
  return (
    <div className="py-3 flex items-center justify-between gap-3">
      <span className="text-[0.9375rem] text-ink-primary">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 rounded-[10px] bg-tinted-subtle text-ink-primary font-medium hover:bg-coral-rose-soft hover:text-coral-rose-ink disabled:opacity-40 transition-colors"
        >
          -
        </button>
        <span className="min-w-[64px] text-center text-[0.9375rem] font-medium text-ink-primary tabular-nums">
          {value} {unit}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 rounded-[10px] bg-tinted-subtle text-ink-primary font-medium hover:bg-coral-rose-soft hover:text-coral-rose-ink disabled:opacity-40 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

interface SettingsViewProps {
  onLockNow?: () => void;
}

export function SettingsView({ onLockNow }: SettingsViewProps = {}) {
  const { settings, updateSettings } = useCycle();
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex flex-col pb-8">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-[1.375rem] font-semibold text-ink-primary">
          {t.settings.title}
        </h1>
      </header>

      <section className="px-5 pb-4">
        <h2 className="text-[0.875rem] font-medium text-ink-secondary mb-2">
          {t.settings.cycleDefaultsTitle}
        </h2>
        <div className="divide-y divide-rose-hairline border-t border-rose-hairline">
          <StepperRow
            label={t.settings.defaultCycleLength}
            value={settings.defaultCycleLength}
            min={18}
            max={45}
            unit={t.common.dayShort}
            onChange={(v) => void updateSettings({ defaultCycleLength: v })}
          />
          <StepperRow
            label={t.settings.defaultPeriodLength}
            value={settings.defaultPeriodLength}
            min={2}
            max={10}
            unit={t.common.dayShort}
            onChange={(v) => void updateSettings({ defaultPeriodLength: v })}
          />
          <StepperRow
            label={t.settings.lutealPhaseLength}
            value={settings.lutealPhaseLength}
            min={10}
            max={16}
            unit={t.common.dayShort}
            onChange={(v) => void updateSettings({ lutealPhaseLength: v })}
          />
        </div>
      </section>

      <section className="px-5 py-5 border-t border-rose-hairline">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[0.9375rem] font-semibold text-ink-primary">
            {t.settings.languageTitle}
          </h2>
          <div className="inline-flex rounded-[10px] bg-tinted-subtle p-1" role="group">
            {(
              [
                { id: 'th', label: t.settings.languageTh },
                { id: 'en', label: t.settings.languageEn },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLocale(opt.id)}
                className={[
                  'px-4 py-1.5 rounded-[6px] text-[0.8125rem] font-medium transition-colors duration-[150ms]',
                  locale === opt.id
                    ? 'bg-warm-surface text-coral-rose-ink'
                    : 'text-ink-muted hover:text-ink-primary',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <OptionalTrackersSection />

      <PinSettingsSection onLockNow={onLockNow} />

      <BackupControls />

      <footer className="px-5 pt-5 border-t border-rose-hairline space-y-3">
        <div className="flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-ink-secondary">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-fertile-sage" strokeWidth={1.6} />
          <p>{t.settings.privacyNote}</p>
        </div>
        <p className="text-[0.75rem] leading-relaxed text-ink-muted">{t.insights.disclaimer}</p>
      </footer>
    </div>
  );
}
