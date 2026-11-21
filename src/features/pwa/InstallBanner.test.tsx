import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { InstallBanner } from './InstallBanner';
import type { BeforeInstallPromptEvent } from './usePwaInstall';

describe('InstallBanner', () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      configurable: true,
    });
    Object.defineProperty(window.navigator, 'standalone', {
      value: false,
      configurable: true,
    });
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });
  });

  function renderBanner() {
    return render(
      <I18nProvider locale="th" onChangeLocale={() => {}}>
        <InstallBanner />
      </I18nProvider>,
    );
  }

  it('stays hidden on desktop browsers without install prompt or iOS Safari', () => {
    const { container } = renderBanner();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows 1-tap install banner on beforeinstallprompt and persists dismissal', async () => {
    const user = userEvent.setup();
    renderBanner();

    const promptMock = vi.fn().mockResolvedValue(undefined);
    const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
    Object.assign(event, {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(await screen.findByText('เพิ่ม Roselle ลงหน้าจอโฮม')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ติดตั้ง' }));
    expect(promptMock).toHaveBeenCalledTimes(1);
  });

  it('shows iOS Safari Add to Home Screen instructions and hides when dismissed', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      configurable: true,
    });

    renderBanner();
    expect(await screen.findByText(/เพิ่มไปยังหน้าจอโฮม/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ปิด' }));
    expect(screen.queryByText(/เพิ่มไปยังหน้าจอโฮม/)).not.toBeInTheDocument();
    expect(window.localStorage.getItem('roselle_pwa_install_dismissed')).toBe('1');
  });

  it('stays hidden when already running in standalone mode', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
      configurable: true,
    });
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
      configurable: true,
    });

    const { container } = renderBanner();
    expect(container).toBeEmptyDOMElement();
  });
});
