import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoselleDatabase } from '../../data/db';
import { DexieCycleRepository } from '../../data/dexie-repository';
import { I18nProvider } from '../../i18n/I18nProvider';
import { CycleProvider, useCycle } from '../../state/CycleProvider';
import { DailyLogSheet } from './DailyLogSheet';

function Harness({ date, onClose }: { date: string; onClose: () => void }) {
  const { settings, updateSettings, loading } = useCycle();
  if (loading) return <div>loading</div>;
  return (
    <I18nProvider
      locale={settings.locale}
      onChangeLocale={(locale) => {
        void updateSettings({ locale });
      }}
    >
      <DailyLogSheet date={date} open onClose={onClose} />
    </I18nProvider>
  );
}

describe('DailyLogSheet', () => {
  it('saves selected flow, symptoms, moods, activities, and note', async () => {
    const db = new RoselleDatabase(`SheetTest_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Harness date="2026-11-19" onClose={onClose} />
      </CycleProvider>,
    );

    await user.click(await screen.findByRole('button', { name: 'มาก' }));
    await user.click(screen.getByRole('button', { name: 'ปวดท้องน้อย' }));
    await user.click(screen.getByRole('button', { name: 'สงบ' }));
    await user.click(screen.getByRole('button', { name: 'ออกกำลังกาย' }));
    await user.type(screen.getByPlaceholderText('จดบันทึกสั้นๆ สำหรับวันนี้...'), 'Light walk');
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    const saved = await repo.getLogByDate('2026-11-19');
    expect(saved).toMatchObject({
      flow: 'heavy',
      symptoms: ['cramps'],
      moods: ['calm'],
      activities: ['exercise'],
      note: 'Light walk',
    });
    await db.delete();
  });

  it('shows read-only future notice and disables save for dates after today', async () => {
    const db = new RoselleDatabase(`SheetFuture_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Harness date="2026-11-25" onClose={() => {}} />
      </CycleProvider>,
    );

    expect(
      await screen.findByText('ยังไม่สามารถบันทึกอาการหรือประจำเดือนสำหรับวันในอนาคตได้'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'บันทึก' })).not.toBeInTheDocument();
    await db.delete();
  });
});
