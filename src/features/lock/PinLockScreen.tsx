import { useState } from 'react';
import { Lock } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { verifyPin } from '../../domain/pin';
import { useI18n } from '../../i18n/I18nProvider';
import { PinKeypad } from './PinKeypad';

interface PinLockScreenProps {
  pinHash: string;
  pinSalt: string;
  onUnlock: () => void;
  onResetAllData?: () => Promise<void>;
}

export function PinLockScreen({
  pinHash,
  pinSalt,
  onUnlock,
  onResetAllData,
}: PinLockScreenProps) {
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resetSheetOpen, setResetSheetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

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

  const handleConfirmReset = async () => {
    if (!onResetAllData) return;
    setResetting(true);
    try {
      await onResetAllData();
      setResetSheetOpen(false);
      onUnlock();
    } finally {
      setResetting(false);
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
            disabled={verifying || resetting}
            deleteLabel={t.settings.pinDeleteDigit}
            keyboardEnabled={!resetSheetOpen}
          />
        </div>

        {onResetAllData ? (
          <div className="mt-6">
            <Button
              variant="ghost"
              size="sm"
              disabled={verifying || resetting}
              onClick={() => setResetSheetOpen(true)}
            >
              {t.settings.pinForgotButton}
            </Button>
          </div>
        ) : null}
      </div>

      {onResetAllData ? (
        <BottomSheet
          open={resetSheetOpen}
          title={t.settings.pinForgotTitle}
          onClose={() => {
            if (!resetting) setResetSheetOpen(false);
          }}
          closeLabel={t.common.close}
          footer={
            <div className="flex gap-3">
              <Button
                variant="ghost"
                fullWidth
                disabled={resetting}
                onClick={() => setResetSheetOpen(false)}
              >
                {t.common.cancel}
              </Button>
              <Button
                variant="danger"
                fullWidth
                disabled={resetting}
                onClick={() => void handleConfirmReset()}
              >
                {t.settings.pinForgotConfirmAction}
              </Button>
            </div>
          }
        >
          <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">
            {t.settings.pinForgotBody}
          </p>
        </BottomSheet>
      ) : null}
    </AppShell>
  );
}
