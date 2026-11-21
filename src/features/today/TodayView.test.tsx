import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoselleDatabase } from '../../data/db';
import { DexieCycleRepository } from '../../data/dexie-repository';
import { I18nProvider } from '../../i18n/I18nProvider';
import { CycleProvider, useCycle } from '../../state/CycleProvider';
import { TodayView } from './TodayView';

function Harness({ onOpenLog }: { onOpenLog: (date: string) => void }) {
  const { settings, updateSettings, loading } = useCycle();
  if (loading) return <div>loading</div>;
  return (
    <I18nProvider
      locale={settings.locale}
      onChangeLocale={(locale) => {
        void updateSettings({ locale });
      }}
    >
      <TodayView onOpenLog={onOpenLog} />
    </I18nProvider>
  );
}

describe('TodayView', () => {
  it('shows honest empty state and logs period in one tap', async () => {
    const db = new RoselleDatabase(`TodayEmpty_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    await repo.updateSettings({ onboardingCompleted: true });
    const user = userEvent.setup();
    const onOpenLog = vi.fn();

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Harness onOpenLog={onOpenLog} />
      </CycleProvider>,
    );

    expect(await screen.findByText('ยังไม่มีข้อมูลรอบเดือน')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'บันทึกประจำเดือนวันนี้' }));

    await waitFor(() => expect(screen.getByText('ประจำเดือนวันที่ 1')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'แก้ไขบันทึกวันนี้' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ยกเลิกวันประจำเดือนวันนี้' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'แก้ไขบันทึกวันนี้' }));
    expect(onOpenLog).toHaveBeenCalledWith('2026-11-19');
    await db.delete();
  });

  it('shows late period status clearly when overdue', async () => {
    const db = new RoselleDatabase(`TodayLate_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    await repo.updateSettings({ onboardingCompleted: true, defaultCycleLength: 28 });
    await repo.upsertLog({
      date: '2026-10-15',
      flow: 'medium',
      symptoms: [],
      moods: [],
      activities: [],
      note: '',
    });

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-16">
        <Harness onOpenLog={() => {}} />
      </CycleProvider>,
    );

    expect(await screen.findByText('เลยกำหนด 4 วัน')).toBeInTheDocument();
    await db.delete();
  });

  it('renders 360-degree cycle wheel day markers 1..28 with current cycle day active', async () => {
    const db = new RoselleDatabase(`TodayWheel_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    await repo.updateSettings({ onboardingCompleted: true, defaultCycleLength: 28 });
    await repo.upsertLog({
      date: '2026-11-12',
      flow: 'medium',
      symptoms: [],
      moods: [],
      activities: [],
      note: '',
    });

    const { container } = render(
      <CycleProvider repository={repo} todayOverride="2026-11-22">
        <Harness onOpenLog={() => {}} />
      </CycleProvider>,
    );

    expect(await screen.findByText('ช่วงเจริญพันธุ์')).toBeInTheDocument();
    const dayMarkers = container.querySelectorAll('[data-cycle-day]');
    expect(dayMarkers).toHaveLength(28);
    expect(container.querySelector('[data-cycle-day="1"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cycle-day="28"]')).toBeInTheDocument();
    const activeMarker = container.querySelector('[data-active="true"]');
    expect(activeMarker).toHaveAttribute('data-cycle-day', '11');

    // Interactive wheel: inspect ovulation day (day 15 = Nov 26)
    await userEvent.click(container.querySelector('[data-cycle-day="15"]')!);
    expect(await screen.findByText('วันที่ 15 ของรอบเดือน')).toBeInTheDocument();
    expect(
      container.querySelector('[data-cycle-day="15"][data-inspected="true"]'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('วันไข่ตก (คาดการณ์)').length).toBeGreaterThanOrEqual(2);
    const backButton = screen.getByRole('button', { name: 'กลับสู่วันนี้' });
    await userEvent.click(backButton);
    expect(screen.queryByRole('button', { name: 'กลับสู่วันนี้' })).not.toBeInTheDocument();

    // Phase guide card renders offline tip
    expect(screen.getByText('คำแนะนำช่วงเจริญพันธุ์')).toBeInTheDocument();
    expect(screen.getByText(/เหมาะกับการติดตามอุณหภูมิร่างกาย/)).toBeInTheDocument();

    await db.delete();
  });

  it('displays recorded optional health tracker badges in TodayLogSummary', async () => {
    const db = new RoselleDatabase(`TodayTrackers_${Math.random().toString(36).slice(2)}`);
    const repo = new DexieCycleRepository(db);
    await repo.updateSettings({
      onboardingCompleted: true,
      enabledTrackers: { weight: true, bbt: true, pill: true },
    });
    await repo.upsertLog({
      date: '2026-11-19',
      flow: 'none',
      symptoms: [],
      moods: [],
      activities: [],
      note: '',
      weightKg: 52.4,
      bbtCelsius: 36.62,
      pillTaken: true,
    });

    render(
      <CycleProvider repository={repo} todayOverride="2026-11-19">
        <Harness onOpenLog={() => {}} />
      </CycleProvider>,
    );

    expect(await screen.findByText('52.4 กก.')).toBeInTheDocument();
    expect(screen.getByText('36.62 °C')).toBeInTheDocument();
    expect(screen.getByText('ทานยาคุมแล้ว')).toBeInTheDocument();
    await db.delete();
  });
});
