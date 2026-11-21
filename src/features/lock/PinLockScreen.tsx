import { useState } from 'react';
import { Lock } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { verifyPin } from '../../domain/pin';
import { useI18n } from '../../i18n/I18nProvider';
import { PinKeypad } from './PinKeypad';

interface PinLockScreenProps {
  pinHash: string;
  pinSalt: string;
  onUnlock: () => void;
}

export function PinLockScreen({ pinHash, pinSalt, onUnlock }: PinLockScreenProps) {
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleChange = async (next: string) => {
    if (error) setError(null);
    setPin(next);

    if (next.length !== 4 || verifying) return;
    setVerifying(true);
    try {
      const matched = await verifyPin(next, pinSalt, pinHash);
      if (matched) {
        onUnlock();
      } else {
        setError(t.settings.pinWrongError);
        setPin('');
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-dvh px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-[14px] bg-coral-rose-soft text-coral-rose-ink flex items-center justify-center mb-5">
          <Lock className="w-5 h-5" strokeWidth={1.6} />
        </div>
        <h1 className="text-[1.25rem] font-semibold text-ink-primary">
          {t.settings.pinUnlockTitle}
        </h1>
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-secondary max-w-[30ch]">
          {t.settings.pinUnlockSubtitle}
        </p>

        <div className="mt-6 w-full">
          <PinKeypad
            value={pin}
            onChange={(next) => {
              void handleChange(next);
            }}
            error={error}
            disabled={verifying}
            deleteLabel={t.settings.pinDeleteDigit}
          />
        </div>
      </div>
    </AppShell>
  );
}
