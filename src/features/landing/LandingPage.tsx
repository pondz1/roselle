import { ArrowUpRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useI18n } from '../../i18n/I18nProvider';
import { LiveAppPreview } from './LiveAppPreview';

const GITHUB_REPO_URL = 'https://github.com/pondz1/roselle';

interface LandingPageProps {
  onOpenApp: () => void;
}

export function LandingPage({ onOpenApp }: LandingPageProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="min-h-dvh w-full bg-blush-canvas text-ink-primary flex flex-col">
      <header className="sticky top-0 z-30 bg-blush-canvas/95 backdrop-blur-xs border-b border-rose-hairline">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-[1.0625rem] font-semibold text-ink-primary no-underline"
          >
            <span aria-hidden="true" className="w-3 h-3 rounded-full bg-coral-rose inline-block" />
            <span>{t.appName}</span>
          </a>

          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="inline-flex rounded-[10px] bg-tinted-subtle p-1"
              role="group"
              aria-label={t.settings.languageTitle}
            >
              {(['th', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLocale(lang)}
                  className={[
                    'px-2.5 py-1 rounded-[6px] text-[0.75rem] font-medium transition-colors duration-[150ms]',
                    locale === lang
                      ? 'bg-warm-surface text-coral-rose-ink'
                      : 'text-ink-muted hover:text-ink-primary',
                  ].join(' ')}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-[0.875rem] font-medium text-ink-secondary hover:text-ink-primary transition-colors duration-[150ms]"
            >
              <span>{t.landing.github}</span>
              <ArrowUpRight className="w-4 h-4" strokeWidth={1.6} />
            </a>

            <Button size="sm" onClick={onOpenApp}>
              {t.landing.openApp}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-blush-canvas border-b border-rose-hairline">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <img
              src="/images/hero-roselle.png"
              alt=""
              className="h-full w-full object-cover object-right opacity-85 lg:opacity-95"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-blush-canvas) 0%, oklch(0.985 0.008 15 / 0.92) 44%, oklch(0.985 0.008 15 / 0.28) 78%, oklch(0.985 0.008 15 / 0.10) 100%)',
              }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-28"
              style={{
                background:
                  'linear-gradient(to top, var(--color-blush-canvas) 0%, transparent 100%)',
              }}
            />
          </div>

          <div className="relative z-10 max-w-[1160px] mx-auto px-5 sm:px-8 py-12 lg:py-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center">
            <div>
              <h1 className="text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-[1.24] text-ink-primary">
                {t.landing.headline}
              </h1>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-secondary max-w-[44ch]">
                {t.landing.subhead}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button size="lg" onClick={onOpenApp}>
                  {t.landing.primaryCta}
                </Button>
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 min-h-11 px-2 text-[0.9375rem] font-medium text-ink-secondary hover:text-ink-primary transition-colors duration-[150ms]"
                >
                  <span>{t.landing.secondaryCta}</span>
                  <ArrowUpRight className="w-4 h-4" strokeWidth={1.6} />
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-start lg:pl-2">
              <div className="w-full max-w-[356px]">
                <LiveAppPreview />
                <p className="mt-3 text-[0.8125rem] text-ink-muted text-center">
                  {t.landing.previewCaption}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-[1.5rem] sm:text-[1.75rem] font-semibold leading-snug text-ink-primary max-w-[30ch] mb-10">
            {t.landing.featuresTitle}
          </h2>

          <div className="border-b border-rose-hairline">
            {t.landing.features.map((item) => (
              <div
                key={item.index}
                className="grid sm:grid-cols-[64px_1fr_1.4fr] gap-3 sm:gap-8 py-7 border-t border-rose-hairline items-baseline"
              >
                <span className="text-[0.875rem] font-medium text-coral-rose-ink tabular-nums">
                  {item.index}
                </span>
                <h3 className="text-[1.0625rem] font-semibold text-ink-primary">
                  {item.title}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-warm-surface border-y border-rose-hairline">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-14 sm:py-16 grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center">
            <div>
              <h2 className="text-[1.375rem] sm:text-[1.5rem] font-semibold leading-snug text-ink-primary">
                {t.landing.legendTitle}
              </h2>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-secondary max-w-[44ch]">
                {t.landing.legendBody}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="inline-flex items-center gap-2.5 text-[0.875rem] font-medium text-ink-primary">
                <span aria-hidden="true" className="w-7 h-7 rounded-full bg-coral-rose inline-block" />
                <span>{t.calendar.legend.loggedPeriod}</span>
              </div>
              <div className="inline-flex items-center gap-2.5 text-[0.875rem] font-medium text-ink-primary">
                <span
                  aria-hidden="true"
                  className="w-7 h-7 rounded-full bg-predicted-blush border-[1.5px] border-dashed border-coral-rose inline-block"
                />
                <span>{t.calendar.legend.predictedPeriod}</span>
              </div>
              <div className="inline-flex items-center gap-2.5 text-[0.875rem] font-medium text-ink-primary">
                <span
                  aria-hidden="true"
                  className="w-7 h-7 rounded-full bg-fertile-sage-soft inline-block"
                />
                <span>{t.calendar.legend.fertile}</span>
              </div>
              <div className="inline-flex items-center gap-2.5 text-[0.875rem] font-medium text-ink-primary">
                <span
                  aria-hidden="true"
                  className="w-7 h-7 rounded-full bg-fertile-sage-soft ring-2 ring-fertile-sage inline-block"
                />
                <span>{t.calendar.legend.ovulation}</span>
              </div>
              <div className="inline-flex items-center gap-2.5 text-[0.875rem] font-medium text-ink-primary">
                <span
                  aria-hidden="true"
                  className="w-2.5 h-2.5 rounded-full bg-ink-secondary inline-block"
                />
                <span>{t.calendar.legend.loggedNote}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-[1.5rem] sm:text-[1.75rem] font-semibold leading-snug text-ink-primary">
              {t.landing.closingTitle}
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary max-w-[48ch]">
              {t.landing.closingBody}
            </p>
          </div>
          <Button size="lg" onClick={onOpenApp} className="self-start sm:self-center">
            {t.landing.closingCta}
          </Button>
        </section>
      </main>

      <footer className="border-t border-rose-hairline">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[0.8125rem] text-ink-muted">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-medium text-ink-primary">{t.appName}</span>
            <span>{t.landing.footerLicense}</span>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink-primary transition-colors"
            >
              {t.landing.github}
            </a>
          </div>
          <p className="max-w-[58ch] leading-relaxed">{t.insights.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}
