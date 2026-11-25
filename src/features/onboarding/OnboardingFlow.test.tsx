import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoselleDatabase } from '../../data/db';
import { DexieCycleRepository } from '../../data/dexie-repository';
import { I18nProvider } from '../../i18n/I18nProvider';
import { CycleProvider, useCycle } from '../../state/CycleProvider';
import { OnboardingFlow } from './OnboardingFlow';

function Harness() {
  const { settings, updateSettings, logs, loading } = useCycle();
  if (loading) return <div>loading</div>;
  return (
    <I18nProvider
      locale={settings.locale}
      onChangeLocale={(locale) => {
        void updateSettings({ locale });
      }}
    >
      {settings.onboardingCompleted ? (
        <div data-testid="done-state">
          onboarded:{settings.defaultPeriodLength}:{settings.defaultCycleLength}:{logs.length}
        </div>
      ) : (
        <OnboardingFlow />
      )}
    </I18nProvider>
  );
}

describe('OnboardingFlow', () => {
  it('completes 3-step onboarding with date and custom lengths', async () => {
    const db = new RoselleDatabase(`OnboardTest_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    const user = userEvent.setup();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Harness />
      </CycleProvider>,
    );

    const dateInput = await screen.findByLabelText('วันแรกของประจำเดือนครั้งล่าสุด');
    await user.clear(dateInput);
    await user.type(dateInput, '2026-11-17');

    await user.click(screen.getByRole('button', { name: 'ถัดไป' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    await user.click(screen.getByRole('button', { name: 'ถัดไป' }));
    await user.click(screen.getByRole('button', { name: 'เริ่มใช้งาน' }));

    await waitFor(() =>
      expect(screen.getByTestId('done-state')).toHaveTextContent('onboarded:6:28:3'),
    );
    await db.delete();
  });

  it('allows skipping onboarding without seeding logs', async () => {
    const db = new RoselleDatabase(`OnboardSkip_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    const user = userEvent.setup();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Harness />
      </CycleProvider>,
    );

    const skipBtn = await screen.findByRole('button', { name: 'ข้ามไปก่อน' });
    await user.click(skipBtn);

    await waitFor(() =>
      expect(screen.getByTestId('done-state')).toHaveTextContent('onboarded:5:28:0'),
    );
    await db.delete();
  });

  it('shows validation error and disables Next when future date is entered', async () => {
    const db = new RoselleDatabase(`OnboardFuture_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    const user = userEvent.setup();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Harness />
      </CycleProvider>,
    );

    const dateInput = await screen.findByLabelText('วันแรกของประจำเดือนครั้งล่าสุด');
    await user.clear(dateInput);
    await user.type(dateInput, '2026-11-25');

    expect(await screen.findByRole('alert')).toHaveTextContent('วันที่ต้องไม่เกินวันปัจจุบัน');
    expect(screen.getByRole('button', { name: 'ถัดไป' })).toBeDisabled();
    await db.delete();
  });
});
