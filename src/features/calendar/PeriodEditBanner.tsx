import { Button } from '../../components/ui/Button';
import { useI18n } from '../../i18n/I18nProvider';

interface PeriodEditBannerProps {
  selectedCount: number;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function PeriodEditBanner({
  selectedCount,
  saving,
  onCancel,
  onSave,
}: PeriodEditBannerProps) {
  const { t } = useI18n();

  return (
    <div className="mx-5 mb-4 rounded-[14px] bg-coral-rose-soft/75 border border-rose-hairline px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.875rem] font-semibold text-coral-rose-ink">
            {t.calendar.editBannerTitle}
          </p>
          <p className="mt-0.5 text-[0.75rem] text-ink-secondary">{t.calendar.editBannerHint}</p>
        </div>
        <span className="shrink-0 text-[0.75rem] font-semibold text-coral-rose-ink tabular-nums">
          {t.calendar.selectedCount(selectedCount)}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          {t.common.cancel}
        </Button>
        <Button variant="primary" size="sm" onClick={onSave} disabled={saving}>
          {t.common.save}
        </Button>
      </div>
    </div>
  );
}
