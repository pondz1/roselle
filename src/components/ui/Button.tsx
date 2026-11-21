import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-coral-rose text-warm-surface hover:bg-coral-rose-hover active:scale-[0.98]',
  secondary:
    'bg-coral-rose-soft text-coral-rose-ink hover:bg-predicted-blush active:scale-[0.98]',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-tinted-subtle hover:text-ink-primary active:scale-[0.98]',
  danger:
    'bg-danger-soft text-danger-ink hover:bg-coral-rose-soft active:scale-[0.98]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 py-2 text-[0.8125rem] rounded-[10px]',
  md: 'min-h-11 px-4 py-2 text-[0.9375rem] rounded-[12px]',
  lg: 'min-h-12 px-5 py-3 text-[0.9375rem] rounded-[12px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap',
        'transition-[background-color,color,transform,opacity] duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        'disabled:opacity-45 disabled:pointer-events-none select-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full min-w-0' : 'shrink-0',
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
