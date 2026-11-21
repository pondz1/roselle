import { useCallback, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { AppShell } from './components/layout/AppShell';
import { BottomNav, type TabId } from './components/layout/BottomNav';
import { Skeleton } from './components/ui/Skeleton';
import type { CycleRepository } from './data/repository';
import type { ISODate } from './domain/types';
import { CalendarView } from './features/calendar/CalendarView';
import { DailyLogSheet } from './features/daily-log/DailyLogSheet';
import { InsightsView } from './features/insights/InsightsView';
import { LandingPage } from './features/landing/LandingPage';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { SettingsView } from './features/settings/SettingsView';
import { TodayView } from './features/today/TodayView';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import { CycleProvider, useCycle } from './state/CycleProvider';

function AppContent() {
  const { loading, storageError, settings } = useCycle();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [logSheetDate, setLogSheetDate] = useState<ISODate | null>(null);

  if (loading) {
    return (
      <AppShell>
        <div className="px-5 pt-8 space-y-6">
          <Skeleton className="h-7 w-36" />
          <div className="flex justify-center py-4">
            <Skeleton className="w-[248px] h-[248px] rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-[12px]" />
          <Skeleton className="h-24 w-full" />
        </div>
      </AppShell>
    );
  }

  if (storageError) {
    return (
      <AppShell>
        <div className="px-6 py-12 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-[12px] bg-danger-soft text-danger-ink flex items-center justify-center mb-4">
            <AlertCircle className="w-5 h-5" strokeWidth={1.6} />
          </div>
          <h1 className="text-[1.125rem] font-semibold text-ink-primary">
            {t.common.storageErrorTitle}
          </h1>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary max-w-[36ch]">
            {t.common.storageErrorBody}
          </p>
        </div>
      </AppShell>
    );
  }

  if (!settings.onboardingCompleted) {
    return <OnboardingFlow />;
  }

  return (
    <AppShell
      bottomNav={<BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />}
    >
      {activeTab === 'today' ? <TodayView onOpenLog={setLogSheetDate} /> : null}
      {activeTab === 'calendar' ? <CalendarView onSelectDate={setLogSheetDate} /> : null}
      {activeTab === 'insights' ? <InsightsView /> : null}
      {activeTab === 'settings' ? <SettingsView /> : null}

      <DailyLogSheet
        date={logSheetDate}
        open={logSheetDate !== null}
        onClose={() => setLogSheetDate(null)}
      />
    </AppShell>
  );
}

interface LocalizedShellProps {
  pathname: string;
  onNavigate: (to: string) => void;
}

function LocalizedShell({ pathname, onNavigate }: LocalizedShellProps) {
  const { settings, updateSettings } = useCycle();
  const isAppRoute = pathname.startsWith('/app');

  return (
    <I18nProvider
      locale={settings.locale}
      onChangeLocale={(locale) => {
        void updateSettings({ locale });
      }}
    >
      {isAppRoute ? (
        <AppContent />
      ) : (
        <LandingPage onOpenApp={() => onNavigate('/app')} />
      )}
    </I18nProvider>
  );
}

interface AppProps {
  repository?: CycleRepository;
  todayOverride?: ISODate;
  initialPath?: string;
}

export function App({ repository, todayOverride, initialPath }: AppProps) {
  const [pathname, setPathname] = useState<string>(
    () => initialPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/app'),
  );

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== to) {
      window.history.pushState({}, '', to);
      window.scrollTo({ top: 0 });
    }
    setPathname(to);
  }, []);

  return (
    <CycleProvider repository={repository} todayOverride={todayOverride}>
      <LocalizedShell pathname={pathname} onNavigate={navigate} />
    </CycleProvider>
  );
}
