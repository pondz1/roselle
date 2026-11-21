import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  selected: boolean;
  onToggle: () => void;
  tone?: 'rose' | 'sage';
  children: ReactNode;
}

export function Chip({
  selected,
  onToggle,
  tone = 'rose',
  className = '',
  children,
  ...props
}: ChipProps) {
  const selectedClasses =
    tone === 'sage'
      ? 'bg-fertile-sage-soft text-fertile-sage-ink border-fertile-sage'
      : 'bg-coral-rose-soft text-coral-rose-ink border-coral-rose';

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-[10px] min-h-10 px-3 py-2',
        'text-[0.8125rem] font-medium border-[1.5px] select-none',
        'transition-[background-color,color,border-color,transform] duration-[150ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        'active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none',
        selected
          ? selectedClasses
          : 'bg-tinted-subtle text-ink-primary border-transparent hover:border-rose-hairline',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
