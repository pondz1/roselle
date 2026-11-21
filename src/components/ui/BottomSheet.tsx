import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  closeLabel: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function BottomSheet({
  open,
  title,
  subtitle,
  onClose,
  closeLabel,
  footer,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-primary/25 transition-opacity duration-[180ms]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] max-h-[88dvh] flex flex-col rounded-t-[16px] bg-warm-surface shadow-[var(--shadow-sheet)] border-t border-rose-hairline overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-8 rounded-full bg-rose-hairline" aria-hidden="true" />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 pt-2 pb-3 border-b border-rose-hairline">
          <div className="min-w-0">
            <h2 className="text-[1.0625rem] font-semibold leading-snug text-ink-primary truncate">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-[0.8125rem] text-ink-secondary">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="shrink-0 inline-flex items-center justify-center w-10 h-10 -mr-2 rounded-[10px] text-ink-secondary hover:bg-tinted-subtle hover:text-ink-primary transition-colors duration-[150ms]"
          >
            <X className="w-[18px] h-[18px]" strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="px-5 py-4 border-t border-rose-hairline bg-warm-surface pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
