import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-10">
      <div className="w-12 h-12 rounded-[12px] bg-coral-rose-soft text-coral-rose-ink flex items-center justify-center mb-4">
        {icon}
      </div>
      <h2 className="text-[1.0625rem] font-semibold text-ink-primary">{title}</h2>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary max-w-[34ch]">
        {body}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
