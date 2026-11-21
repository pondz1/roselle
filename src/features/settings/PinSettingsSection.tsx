import { useState } from 'react';
import { Lock } from 'lucide-react';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { generatePinSalt, hashPin, verifyPin } from '../../domain/pin';
import { useI18n } from '../../i18n/I18nProvider';
import { useCycle } from '../../state/CycleProvider';
import { PinKeypad } from '../lock/PinKeypad';

type PinFlow = 'setup' | 'change' | 'disable';
type PinStep = 'verify_current' | 'enter_new' | 'confirm_new';

interface PinSettingsSectionProps {
  onLockNow?: () => void;
}

export function PinSettingsSection({ onLockNow }: PinSettingsSectionProps) {
  const { settings, updateSettings } = useCycle();
  const { t } = useI18n();

  const isPinEnabled = Boolean(settings.pinHash && settings.pinSalt);

  const [flow, setFlow] = useState<PinFlow | null>(null);
  const [step, setStep] = useState<PinStep>('enter_new');
  const [digits, setDigits] = useState('');
  const [draftPin, setDraftPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const openFlow = (nextFlow: PinFlow) => {
    setFeedback(null);
    setFlow(nextFlow);
    setStep(nextFlow === 'setup' ? 'enter_new' : 'verify_current');
    setDigits('');
    setDraftPin('');
    setError(null);
  };

  const closeSheet = () => {
    if (busy) return;
    setFlow(null);
    setDigits('');
    setDraftPin('');
    setError(null);
  };

  const handleDigitsChange = async (next: string) => {
    if (!flow || busy) return;
    if (error) setError(null);
    setDigits(next);

    if (next.length !== 4) return;
    setBusy(true);
    try {
      if (step === 'verify_current') {
        const valid =
          settings.pinHash && settings.pinSalt
            ? await verifyPin(next, settings.pinSalt, settings.pinHash)
            : false;

        if (!valid) {
          setError(t.settings.pinWrongError);
          setDigits('');
          return;
        }

        if (flow === 'disable') {
          await updateSettings({ pinHash: null, pinSalt: null });
          setFlow(null);
          setDigits('');
          setFeedback(t.settings.pinDisabledFeedback);
          return;
        }

        setStep('enter_new');
        setDigits('');
        setError(null);
        return;
      }

      if (step === 'enter_new') {
        setDraftPin(next);
        setStep('confirm_new');
        setDigits('');
        setError(null);
        return;
      }

      if (step === 'confirm_new') {
        if (next !== draftPin) {
          setError(t.settings.pinMismatchError);
          setDigits('');
          return;
        }
        const salt = generatePinSalt();
        const hash = await hashPin(next, salt);
        await updateSettings({ pinHash: hash, pinSalt: salt });

        const savedMessage =
          flow === 'change' ? t.settings.pinChangedFeedback : t.settings.pinSavedFeedback;
        setFlow(null);
        setDigits('');
        setDraftPin('');
        setFeedback(savedMessage);
      }
    } finally {
      setBusy(false);
    }
  };

  let sheetTitle = t.settings.pinSetupTitle;
  if (step === 'verify_current') {
    sheetTitle =
      flow === 'disable' ? t.settings.pinDisableTitle : t.settings.pinVerifyCurrentTitle;
  } else if (step === 'enter_new') {
    sheetTitle = flow === 'change' ? t.settings.pinNewTitle : t.settings.pinSetupTitle;
  } else if (step === 'confirm_new') {
    sheetTitle = t.settings.pinConfirmTitle;
  }

  return (
    <>
      <section className="px-5 py-5 border-t border-rose-hairline">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Lock
              className="w-4 h-4 mt-0.5 shrink-0 text-coral-rose-ink"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <div>
              <h2 className="text-[0.9375rem] font-semibold text-ink-primary">
                {t.settings.pinTitle}
              </h2>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-secondary">
                {t.settings.pinDescription}
              </p>
            </div>
          </div>
          <span
            className={[
              'shrink-0 rounded-[8px] px-2.5 py-1 text-[0.75rem] font-medium',
              isPinEnabled
                ? 'bg-fertile-sage-soft text-fertile-sage-ink'
                : 'bg-tinted-subtle text-ink-muted',
            ].join(' ')}
          >
            {isPinEnabled ? t.settings.pinStatusOn : t.settings.pinStatusOff}
          </span>
        </div>

        {isPinEnabled ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => openFlow('change')}>
              {t.settings.pinChangeButton}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openFlow('disable')}>
              {t.settings.pinDisableButton}
            </Button>
            {onLockNow ? (
              <Button variant="ghost" size="sm" onClick={onLockNow}>
                {t.settings.pinLockNowButton}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mt-4">
            <Button variant="secondary" fullWidth onClick={() => openFlow('setup')}>
              {t.settings.pinSetupButton}
            </Button>
          </div>
        )}

        {feedback ? (
          <p
            role="status"
            className="mt-3 rounded-[12px] px-3.5 py-2.5 text-[0.8125rem] font-medium bg-fertile-sage-soft text-fertile-sage-ink"
          >
            {feedback}
          </p>
        ) : null}
      </section>

      <BottomSheet
        open={flow !== null}
        title={sheetTitle}
        onClose={closeSheet}
        closeLabel={t.common.close}
        footer={
          step === 'confirm_new' ? (
            <Button
              variant="ghost"
              fullWidth
              disabled={busy}
              onClick={() => {
                setStep('enter_new');
                setDraftPin('');
                setDigits('');
                setError(null);
              }}
            >
              {t.common.back}
            </Button>
          ) : undefined
        }
      >
        <div className="py-2">
          <PinKeypad
            value={digits}
            onChange={(next) => {
              void handleDigitsChange(next);
            }}
            error={error}
            disabled={busy}
            deleteLabel={t.settings.pinDeleteDigit}
            keyboardEnabled={flow !== null}
          />
        </div>
      </BottomSheet>
    </>
  );
}
