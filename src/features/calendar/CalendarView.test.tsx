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
  it('renders phase markers, selects tapped date in panel, and opens details sheet', async () => {
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
    expect(day1).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Edit daily log' }));
    expect(onSelectDate).toHaveBeenCalledWith('2026-11-01');
    await db.delete();
  });

  it('marks period start (auto-filling defaultPeriodLength) and trims cleanly on period end', async () => {
    const db = new RoselleDatabase(`CalStartEnd_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    await repo.updateSettings({
      onboardingCompleted: true,
      locale: 'en',
      defaultPeriodLength: 5,
    });
    const user = userEvent.setup();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Harness onSelectDate={() => {}} />
      </CycleProvider>,
    );

    // Select Nov 10 and tap "Period started" -> auto-fills Nov 10..14 (5 days)
    await user.click(await screen.findByTestId('cal-day-2026-11-10'));
    await user.click(screen.getByRole('button', { name: 'Period started' }));

    await waitFor(async () => {
      const logs = await repo.getAllLogs();
      expect(logs.map((l) => l.date)).toEqual([
        '2026-11-10',
        '2026-11-11',
        '2026-11-12',
        '2026-11-13',
        '2026-11-14',
      ]);
    });

    // Select Nov 12 and tap "Period ended" -> trims Nov 13..14 and marks Nov 12 periodEnded=true
    await user.click(screen.getByTestId('cal-day-2026-11-12'));
    await user.click(screen.getByRole('button', { name: 'Period ended' }));

    await waitFor(async () => {
      const logs = await repo.getAllLogs();
      expect(logs.map((l) => l.date)).toEqual(['2026-11-10', '2026-11-11', '2026-11-12']);
      expect(logs[2].periodEnded).toBe(true);
    });
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
    expect(screen.getByTestId('cal-day-2026-11-25')).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(async () => {
      const logs = await repo.getAllLogs();
      expect(logs.map((l) => l.date)).toEqual(['2026-11-10', '2026-11-11', '2026-11-12']);
    });
    await db.delete();
  });

  it('shows status rows with explicit undo and hides Period started on ongoing period days', async () => {
    const db = new RoselleDatabase(`CalGuard_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    await repo.updateSettings({
      onboardingCompleted: true,
      locale: 'en',
      defaultPeriodLength: 5,
    });
    const user = userEvent.setup();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-25">
        <Harness onSelectDate={() => {}} />
      </CycleProvider>,
    );

    // Start period on Nov 21 -> shows start status row + Undo start + Period ended
    await user.click(await screen.findByTestId('cal-day-2026-11-21'));
    await user.click(screen.getByRole('button', { name: 'Period started' }));
    expect(await screen.findByText('Marked as period start')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo period start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Period ended' })).toBeInTheDocument();

    // Selecting Day 2 (Nov 22) shows Ongoing period + Period ended, with no Period started button
    await user.click(screen.getByTestId('cal-day-2026-11-22'));
    expect(screen.getByText('Ongoing period')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Period started' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Period ended' })).toBeInTheDocument();

    // Marking Period ended on Nov 23 switches to Marked as period end + Undo period end
    await user.click(screen.getByTestId('cal-day-2026-11-23'));
    await user.click(screen.getByRole('button', { name: 'Period ended' }));
    expect(await screen.findByText('Marked as period end')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo period end' }));
    await waitFor(async () => {
      const nov23 = await repo.getLogByDate('2026-11-23');
      expect(nov23?.periodEnded).toBe(false);
    });

    // Undoing start on Nov 21 clears the whole auto-filled episode cleanly
    await user.click(screen.getByTestId('cal-day-2026-11-21'));
    await user.click(screen.getByRole('button', { name: 'Undo period start' }));
    await waitFor(async () => {
      const logs = await repo.getAllLogs();
      expect(logs).toHaveLength(0);
    });
    expect(screen.getByRole('button', { name: 'Period started' })).toBeInTheDocument();
    await db.delete();
  });

  it('clears stale periodEnded flag on earlier day when extending episode in bulk edit mode', async () => {
    const db = new RoselleDatabase(`CalBulkExtend_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    await repo.updateSettings({ onboardingCompleted: true, locale: 'en' });
    await repo.bulkSetPeriodDays([
      { date: '2026-11-10', flow: 'medium', periodEnded: false },
      { date: '2026-11-11', flow: 'medium', periodEnded: true },
    ]);
    const user = userEvent.setup();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Harness onSelectDate={() => {}} />
      </CycleProvider>,
    );

    await user.click(await screen.findByRole('button', { name: 'Edit Period Days' }));
    await user.click(screen.getByTestId('cal-day-2026-11-12'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(async () => {
      const nov11 = await repo.getLogByDate('2026-11-11');
      const nov12 = await repo.getLogByDate('2026-11-12');
      expect(nov11?.periodEnded).toBe(false);
      expect(nov12?.flow).toBe('medium');
    });
    await db.delete();
  });
});
