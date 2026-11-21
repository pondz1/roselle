import { BarChart3, Calendar, Settings, Sun } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

export type TabId = 'today' | 'calendar' | 'insights' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  const { t } = useI18n();

  const items: Array<{ id: TabId; label: string; Icon: typeof Sun }> = [
    { id: 'today', label: t.nav.today, Icon: Sun },
    { id: 'calendar', label: t.nav.calendar, Icon: Calendar },
    { id: 'insights', label: t.nav.insights, Icon: BarChart3 },
    { id: 'settings', label: t.nav.settings, Icon: Settings },
  ];

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-warm-surface border-t border-rose-hairline pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4 h-[68px]">
        {items.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'relative flex flex-col items-center justify-center gap-1 min-h-11',
                'transition-colors duration-[160ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                isActive ? 'text-coral-rose' : 'text-ink-muted hover:text-ink-secondary',
              ].join(' ')}
            >
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-coral-rose"
                />
              ) : null}
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.6} />
              <span className="text-[0.75rem] font-medium leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
