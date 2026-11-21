import { useCallback, useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_STORAGE_KEY = 'roselle_pwa_install_dismissed';

function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mediaMatch =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = Boolean(
    (window.navigator as Navigator & { standalone?: boolean }).standalone,
  );
  return mediaMatch || iosStandalone;
}

function isIosSafariBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isNotEdgeOrChrome = !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isNotEdgeOrChrome && !('MSStream' in window);
}

function readDismissedFlag(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(DISMISS_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export type PwaInstallMode = 'none' | 'prompt' | 'ios';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => readDismissedFlag());
  const [installed, setInstalled] = useState<boolean>(() => isRunningStandalone());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    setDeferredPrompt(null);
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, '1');
    } catch {
      // Storage may be unavailable in restricted contexts
    }
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (result.outcome === 'accepted') {
      setInstalled(true);
    }
  }, [deferredPrompt]);

  let mode: PwaInstallMode = 'none';
  if (!installed && !dismissed) {
    if (deferredPrompt) {
      mode = 'prompt';
    } else if (isIosSafariBrowser()) {
      mode = 'ios';
    }
  }

  return {
    mode,
    triggerInstall,
    dismiss,
  };
}
