import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoselleDatabase } from '../data/db';
import { DexieCycleRepository } from '../data/dexie-repository';
import { CycleProvider, useCycle } from './CycleProvider';

function Probe() {
  const { loading, summary, settings, completeOnboarding, toggleTodayPeriod } = useCycle();
  if (loading) return <div>loading</div>;
  return (
    <div>
      <span data-testid="status">{summary.status}</span>
      <span data-testid="onboarded">{String(settings.onboardingCompleted)}</span>
      <button
        onClick={() =>
          completeOnboarding({
            lastPeriodStart: '2026-11-18',
            defaultPeriodLength: 5,
            defaultCycleLength: 28,
          })
        }
      >
        finish-onboarding
      </button>
      <button onClick={() => toggleTodayPeriod()}>log-today</button>
    </div>
  );
}

describe('CycleProvider', () => {
  it('completes onboarding, seeds period clamped to today, and updates cycle status', async () => {
    const db = new RoselleDatabase(`ProviderTest_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    const user = userEvent.setup();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Probe />
      </CycleProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('no_data'));
    await user.click(screen.getByText('finish-onboarding'));

    await waitFor(() => expect(screen.getByTestId('onboarded')).toHaveTextContent('true'));
    expect(screen.getByTestId('status')).toHaveTextContent('period');

    const logs = await repo.getAllLogs();
    expect(logs.map((l) => l.date)).toEqual(['2026-11-18', '2026-11-19']);
    await db.delete();
  });
});
