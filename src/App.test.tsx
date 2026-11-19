import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PinkBirdDatabase } from './data/db';
import { DexieCycleRepository } from './data/dexie-repository';
import { App } from './App';

describe('App full integration', () => {
  it('completes onboarding, switches tabs and languages, and displays insights and settings', async () => {
    const db = new PinkBirdDatabase(`AppInt_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    const user = userEvent.setup();

    const firstRender = render(<App repository={repo} todayOverride="2026-11-19" />);

    // 1. First-run onboarding
    expect(await screen.findByText('เริ่มติดตามรอบเดือนของคุณ')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ข้ามไปก่อน' }));

    // 2. Lands on Today tab
    expect(await screen.findByText('ยังไม่มีข้อมูลรอบเดือน')).toBeInTheDocument();

    // 3. Switch language to English from header
    await user.click(screen.getByRole('button', { name: 'EN' }));
    expect(await screen.findByText('No cycle data yet')).toBeInTheDocument();

    // 4. Seed multi-cycle logs and reload app to verify persistence across reloads
    await repo.bulkSetPeriodDays([
      { date: '2026-09-20', flow: 'medium' },
      { date: '2026-09-21', flow: 'heavy' },
      { date: '2026-10-18', flow: 'medium' },
      { date: '2026-10-19', flow: 'medium' },
      { date: '2026-11-16', flow: 'medium' },
    ]);
    await repo.upsertLog({
      date: '2026-11-16',
      flow: 'medium',
      symptoms: ['cramps'],
      moods: ['tired'],
      activities: [],
      note: '',
    });

    firstRender.unmount();

    const secondRender = render(<App repository={repo} todayOverride="2026-11-19" />);
    await user.click(await screen.findByRole('button', { name: 'Insights' }));
    expect(await screen.findByText('Insights & Trends')).toBeInTheDocument();
    expect(screen.getByText('Cramps')).toBeInTheDocument();

    // 5. Switch to Settings tab and verify cycle default stepper & reset confirmation
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByText('Cycle Defaults')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export JSON' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset All Data' }));
    expect(await screen.findByText('Reset all local data?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete everything' }));

    await waitFor(() => expect(screen.getByText('เริ่มติดตามรอบเดือนของคุณ')).toBeInTheDocument());

    secondRender.unmount();
    await db.delete();
  });
});
