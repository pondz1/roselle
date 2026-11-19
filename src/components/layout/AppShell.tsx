import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  bottomNav?: ReactNode;
}

export function AppShell({ children, bottomNav }: AppShellProps) {
  return (
    <div className="min-h-dvh w-full bg-blush-canvas flex justify-center">
      <div className="w-full max-w-[430px] min-h-dvh bg-warm-surface sm:border-x sm:border-rose-hairline flex flex-col relative">
        <main className="flex-1 flex flex-col pb-24">{children}</main>
        {bottomNav}
      </div>
    </div>
  );
}
