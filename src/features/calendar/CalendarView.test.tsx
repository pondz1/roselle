import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoselleDatabase } from '../../data/db';
import { DexieCycleRepository } from '../../data/dexie-repository';
import { I18nProvider } from '../../i18n/I18nProvider';
import { CycleProvider, useCycle } from '../../state/CycleProvider';
import { CalendarView } from './CalendarView';

function Harness({ onSelectDate }: { onSelectDate: (date: string) => void }) {
  const { settings, updateSettings, loading } = useCycle();
  if (loading) return <div>loading</div>;
  return (
    <I18nProvider
      locale={settings.locale}
      onChangeLocale={(locale) => {
        void updateSettings({ locale });
      }}
    >
      <CalendarView onSelectDate={onSelectDate} />
    </I18nProvider>
  );
}

describe('CalendarView', () => {
  it('renders phase markers and opens selected date on tap', async () => {
    const db = new RoselleDatabase(`CalTest_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    await repo.updateSettings({ onboardingCompleted: true, locale: 'en' });
    await repo.bulkSetPeriodDays([
      { date: '2026-11-01', flow: 'medium' },
      { date: '2026-11-02', flow: 'heavy' },
    ]);
    const user = userEvent.setup();
    const onSelectDate = vi.fn();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Harness onSelectDate={onSelectDate} />
      </CycleProvider>,
    );

    const day1 = await screen.findByTestId('cal-day-2026-11-01');
    expect(day1).toHaveAttribute('data-phase', 'logged-period');
    expect(screen.getByTestId('cal-day-2026-11-15')).toHaveAttribute('data-phase', 'ovulation');
    expect(screen.getByTestId('cal-day-2026-11-12')).toHaveAttribute('data-phase', 'fertile');
    expect(screen.getByTestId('cal-day-2026-11-29')).toHaveAttribute(
      'data-phase',
      'predicted-period',
    );

    await user.click(day1);
    expect(onSelectDate).toHaveBeenCalledWith('2026-11-01');
    await db.delete();
  });

  it('supports multi-day period edit mode and persists bulk changes', async () => {
    const db = new RoselleDatabase(`CalBulk_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    await repo.updateSettings({ onboardingCompleted: true, locale: 'en' });
    const user = userEvent.setup();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Harness onSelectDate={() => {}} />
      </CycleProvider>,
    );

    await user.click(await screen.findByRole('button', { name: 'Edit Period Days' }));
    await user.click(screen.getByTestId('cal-day-2026-11-10'));
    await user.click(screen.getByTestId('cal-day-2026-11-11'));
    await user.click(screen.getByTestId('cal-day-2026-11-12'));
    // Future date button should be disabled in edit mode
    expect(screen.getByTestId('cal-day-2026-11-25')).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(async () => {
      const logs = await repo.getAllLogs();
      expect(logs.map((l) => l.date)).toEqual(['2026-11-10', '2026-11-11', '2026-11-12']);
    });
    await db.delete();
  });
});
