import { Smartphone, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useI18n } from '../../i18n/I18nProvider';
import { usePwaInstall } from './usePwaInstall';

export function InstallBanner() {
  const { t } = useI18n();
  const { mode, triggerInstall, dismiss } = usePwaInstall();

  if (mode === 'none') {
    return null;
  }

  return (
    <section
      aria-label={t.pwa.installTitle}
      className="mx-5 mb-3 rounded-[14px] bg-tinted-subtle border border-rose-hairline px-4 py-3 flex items-start justify-between gap-3"
    >
      <div className="flex items-start gap-3 min-w-0">
        <Smartphone
          className="w-4 h-4 mt-0.5 shrink-0 text-coral-rose-ink"
          strokeWidth={1.6}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-[0.875rem] font-semibold text-ink-primary">{t.pwa.installTitle}</p>
          <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-secondary">
            {mode === 'prompt' ? t.pwa.installBodyPrompt : t.pwa.installBodyIos}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {mode === 'prompt' ? (
          <Button size="sm" onClick={() => void triggerInstall()}>
            {t.pwa.installAction}
          </Button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          aria-label={t.common.close}
          className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-warm-surface transition-colors duration-[150ms]"
        >
          <X className="w-4 h-4" strokeWidth={1.6} />
        </button>
      </div>
    </section>
  );
}
