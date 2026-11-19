import { useState } from 'react';
import { CalendarDays, Droplets, Repeat } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useI18n } from '../../i18n/I18nProvider';
import { useCycle } from '../../state/CycleProvider';

export function OnboardingFlow() {
  const { today, settings, completeOnboarding } = useCycle();
  const { locale, setLocale, t } = useI18n();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [lastPeriodStart, setLastPeriodStart] = useState<string>('');
  const [periodLength, setPeriodLength] = useState<number>(settings.defaultPeriodLength);
  const [cycleLength, setCycleLength] = useState<number>(settings.defaultCycleLength);
  const [submitting, setSubmitting] = useState(false);

  const handleSkip = async () => {
    setSubmitting(true);
    try {
      await completeOnboarding({
        lastPeriodStart: null,
        defaultPeriodLength: periodLength,
        defaultCycleLength: cycleLength,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await completeOnboarding({
        lastPeriodStart: lastPeriodStart.trim() ? lastPeriodStart : null,
        defaultPeriodLength: periodLength,
        defaultCycleLength: cycleLength,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-blush-canvas flex justify-center">
      <div className="w-full max-w-[430px] min-h-dvh bg-warm-surface sm:border-x sm:border-rose-hairline flex flex-col px-6 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-3 h-3 rounded-full bg-coral-rose inline-block"
            />
            <span className="text-[0.9375rem] font-semibold tracking-tight text-ink-primary">
              {t.appName}
            </span>
          </div>
          <div className="inline-flex rounded-full bg-tinted-subtle p-1" role="group" aria-label="Language">
            {(['th', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLocale(lang)}
                className={[
                  'px-3 py-1 rounded-full text-[0.75rem] font-medium transition-colors duration-[160ms]',
                  locale === lang
                    ? 'bg-warm-surface text-coral-rose-ink'
                    : 'text-ink-muted hover:text-ink-primary',
                ].join(' ')}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-7 flex items-center gap-2" aria-label={t.onboarding.stepOf(step, 3)}>
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={[
                'h-1.5 flex-1 rounded-full transition-colors duration-[200ms]',
                idx <= step ? 'bg-coral-rose' : 'bg-tinted-subtle',
              ].join(' ')}
            />
          ))}
        </div>
        <p className="mt-2.5 text-[0.8125rem] font-medium text-ink-muted tabular-nums">
          {t.onboarding.stepOf(step, 3)}
        </p>

        <div className="flex-1 flex flex-col justify-center py-8">
          {step === 1 ? (
            <div>
              <div className="w-12 h-12 rounded-full bg-coral-rose-soft text-coral-rose-ink flex items-center justify-center mb-5">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h1 className="text-[1.5rem] font-bold leading-snug text-ink-primary">
                {t.onboarding.welcomeTitle}
              </h1>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
                {t.onboarding.welcomeBody}
              </p>

              <div className="mt-7">
                <label
                  htmlFor="onboarding-last-period"
                  className="block text-[0.875rem] font-medium text-ink-primary mb-2"
                >
                  {t.onboarding.lastPeriodLabel}
                </label>
                <input
                  id="onboarding-last-period"
                  type="date"
                  max={today}
                  value={lastPeriodStart}
                  onChange={(e) => setLastPeriodStart(e.target.value)}
                  className="w-full min-h-12 rounded-[14px] bg-tinted-subtle border border-rose-hairline px-4 py-3 text-[0.9375rem] text-ink-primary tabular-nums focus:bg-warm-surface"
                />
                <p className="mt-2 text-[0.8125rem] text-ink-muted">
                  {t.onboarding.lastPeriodHint}
                </p>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <div className="w-12 h-12 rounded-full bg-coral-rose-soft text-coral-rose-ink flex items-center justify-center mb-5">
                <Droplets className="w-6 h-6" />
              </div>
              <h1 className="text-[1.5rem] font-bold leading-snug text-ink-primary">
                {t.onboarding.periodLengthTitle}
              </h1>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
                {t.onboarding.periodLengthBody}
              </p>

              <div className="mt-10 flex items-center justify-center gap-6">
                <button
                  type="button"
                  aria-label="-"
                  disabled={periodLength <= 2}
                  onClick={() => setPeriodLength((v) => Math.max(2, v - 1))}
                  className="w-12 h-12 rounded-full bg-tinted-subtle text-ink-primary text-[1.25rem] font-semibold hover:bg-coral-rose-soft hover:text-coral-rose-ink disabled:opacity-40 transition-colors"
                >
                  -
                </button>
                <div className="min-w-[110px] text-center">
                  <div className="text-[2.25rem] font-bold text-ink-primary tabular-nums leading-none">
                    {periodLength}
                  </div>
                  <div className="mt-1 text-[0.8125rem] text-ink-muted">{t.common.dayShort}</div>
                </div>
                <button
                  type="button"
                  aria-label="+"
                  disabled={periodLength >= 10}
                  onClick={() => setPeriodLength((v) => Math.min(10, v + 1))}
                  className="w-12 h-12 rounded-full bg-tinted-subtle text-ink-primary text-[1.25rem] font-semibold hover:bg-coral-rose-soft hover:text-coral-rose-ink disabled:opacity-40 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <div className="w-12 h-12 rounded-full bg-fertile-sage-soft text-fertile-sage-ink flex items-center justify-center mb-5">
                <Repeat className="w-6 h-6" />
              </div>
              <h1 className="text-[1.5rem] font-bold leading-snug text-ink-primary">
                {t.onboarding.cycleLengthTitle}
              </h1>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
                {t.onboarding.cycleLengthBody}
              </p>

              <div className="mt-10 flex items-center justify-center gap-6">
                <button
                  type="button"
                  aria-label="-"
                  disabled={cycleLength <= 18}
                  onClick={() => setCycleLength((v) => Math.max(18, v - 1))}
                  className="w-12 h-12 rounded-full bg-tinted-subtle text-ink-primary text-[1.25rem] font-semibold hover:bg-coral-rose-soft hover:text-coral-rose-ink disabled:opacity-40 transition-colors"
                >
                  -
                </button>
                <div className="min-w-[110px] text-center">
                  <div className="text-[2.25rem] font-bold text-ink-primary tabular-nums leading-none">
                    {cycleLength}
                  </div>
                  <div className="mt-1 text-[0.8125rem] text-ink-muted">{t.common.dayShort}</div>
                </div>
                <button
                  type="button"
                  aria-label="+"
                  disabled={cycleLength >= 45}
                  onClick={() => setCycleLength((v) => Math.min(45, v + 1))}
                  className="w-12 h-12 rounded-full bg-tinted-subtle text-ink-primary text-[1.25rem] font-semibold hover:bg-coral-rose-soft hover:text-coral-rose-ink disabled:opacity-40 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-col gap-2.5">
          {step === 1 ? (
            <>
              <Button fullWidth size="lg" onClick={() => setStep(2)} disabled={submitting}>
                {t.common.next}
              </Button>
              <Button fullWidth variant="ghost" onClick={handleSkip} disabled={submitting}>
                {t.onboarding.skipForNow}
              </Button>
            </>
          ) : null}

          {step === 2 ? (
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={submitting}>
                {t.common.back}
              </Button>
              <Button fullWidth size="lg" onClick={() => setStep(3)} disabled={submitting}>
                {t.common.next}
              </Button>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={submitting}>
                {t.common.back}
              </Button>
              <Button fullWidth size="lg" onClick={handleFinish} disabled={submitting}>
                {t.onboarding.startTracking}
              </Button>
            </div>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
