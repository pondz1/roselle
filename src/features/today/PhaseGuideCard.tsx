import { Clock, Droplets, Heart, Moon, Sun } from 'lucide-react';
import type { CycleStatus } from '../../domain/types';
import { useI18n } from '../../i18n/I18nProvider';

interface PhaseGuideCardProps {
  status: CycleStatus;
}

export function PhaseGuideCard({ status }: PhaseGuideCardProps) {
  const { t } = useI18n();

  if (status === 'no_data') {
    return null;
  }

  const guide = t.today.phaseGuide[status];

  let icon = <Droplets className="w-4 h-4 text-coral-rose-ink" strokeWidth={1.6} />;
  if (status === 'late') {
    icon = <Clock className="w-4 h-4 text-amber-late-ink" strokeWidth={1.6} />;
  } else if (status === 'ovulation' || status === 'fertile') {
    icon = <Heart className="w-4 h-4 text-fertile-sage-ink" strokeWidth={1.6} />;
  } else if (status === 'follicular') {
    icon = <Sun className="w-4 h-4 text-coral-rose-ink" strokeWidth={1.6} />;
  } else if (status === 'luteal') {
    icon = <Moon className="w-4 h-4 text-ink-secondary" strokeWidth={1.6} />;
  }

  return (
    <aside
      aria-label={guide.title}
      className="w-full mt-5 rounded-[14px] bg-tinted-subtle/75 px-4 py-3.5 flex items-start gap-3"
    >
      <div className="mt-0.5 shrink-0" aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[0.875rem] font-semibold text-ink-primary">{guide.title}</p>
        <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-secondary">{guide.body}</p>
      </div>
    </aside>
  );
}
