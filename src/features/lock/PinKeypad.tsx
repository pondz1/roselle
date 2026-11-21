import { useEffect } from 'react';
import { Delete } from 'lucide-react';

interface PinKeypadProps {
  value: string;
  onChange: (next: string) => void;
  error?: string | null;
  disabled?: boolean;
  deleteLabel: string;
  keyboardEnabled?: boolean;
}

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

export function PinKeypad({
  value,
  onChange,
  error,
  disabled = false,
  deleteLabel,
  keyboardEnabled = true,
}: PinKeypadProps) {
  useEffect(() => {
    if (!keyboardEnabled || disabled) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^\d$/.test(event.key) && value.length < 4) {
        event.preventDefault();
        onChange(`${value}${event.key}`);
      } else if (event.key === 'Backspace' && value.length > 0) {
        event.preventDefault();
        onChange(value.slice(0, -1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, keyboardEnabled, onChange, value]);

  const handleDigit = (digit: string) => {
    if (disabled || value.length >= 4) return;
    onChange(`${value}${digit}`);
  };

  const handleDelete = () => {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  };

  return (
    <div className="w-full max-w-[268px] mx-auto flex flex-col items-center">
      <div className="flex items-center justify-center gap-4 py-3" aria-hidden="true">
        {[0, 1, 2, 3].map((idx) => {
          const filled = idx < value.length;
          return (
            <span
              key={idx}
              className={[
                'w-3.5 h-3.5 rounded-full transition-colors duration-[150ms]',
                filled ? 'bg-coral-rose' : 'bg-rose-hairline',
              ].join(' ')}
            />
          );
        })}
      </div>

      <p
        role="alert"
        aria-live="polite"
        className="min-h-5 text-[0.8125rem] font-medium text-danger-ink text-center"
      >
        {error ?? ''}
      </p>

      <div className="mt-4 w-full grid grid-cols-3 gap-3">
        {KEYPAD_KEYS.map((key, idx) => {
          if (key === '') {
            return <div key={`empty-${idx}`} aria-hidden="true" />;
          }
          if (key === 'del') {
            return (
              <button
                key="delete"
                type="button"
                aria-label={deleteLabel}
                disabled={disabled || value.length === 0}
                onClick={handleDelete}
                className="min-h-13 rounded-[14px] bg-tinted-subtle text-ink-secondary hover:bg-coral-rose-soft hover:text-coral-rose-ink active:scale-[0.97] transition-[background-color,color,transform] duration-[150ms] flex items-center justify-center disabled:opacity-40"
              >
                <Delete className="w-5 h-5" strokeWidth={1.6} />
              </button>
            );
          }

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => handleDigit(key)}
              className="min-h-13 rounded-[14px] bg-tinted-subtle text-ink-primary hover:bg-coral-rose-soft hover:text-coral-rose-ink active:scale-[0.97] transition-[background-color,color,transform] duration-[150ms] text-[1.125rem] font-medium tabular-nums disabled:opacity-40"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
