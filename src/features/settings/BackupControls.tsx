import { useRef, useState, type ChangeEvent } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { parseBackupSnapshot } from '../../data/backup';
import type { BackupSnapshot } from '../../data/repository';
import { useI18n } from '../../i18n/I18nProvider';
import { useCycle } from '../../state/CycleProvider';

export function BackupControls() {
  const { today, exportBackup, importBackup, resetAllData } = useCycle();
  const { t } = useI18n();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(
    null,
  );
  const [pendingImport, setPendingImport] = useState<BackupSnapshot | null>(null);
  const [resetSheetOpen, setResetSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setFeedback(null);
    const snapshot = await exportBackup();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pinkbird-backup-${today}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setFeedback({ kind: 'success', text: t.settings.exportSuccess });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setFeedback(null);
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsedJson: unknown = JSON.parse(text);
      const result = parseBackupSnapshot(parsedJson);
      if (!result.ok) {
        setFeedback({ kind: 'error', text: t.settings.importErrors[result.errorCode] });
        return;
      }
      setPendingImport(result.data);
    } catch {
      setFeedback({ kind: 'error', text: t.settings.importErrors.INVALID_FORMAT });
    }
  };

  const confirmImport = async () => {
    if (!pendingImport) return;
    setBusy(true);
    try {
      await importBackup(pendingImport);
      setPendingImport(null);
      setFeedback({ kind: 'success', text: t.settings.importSuccess });
    } finally {
      setBusy(false);
    }
  };

  const confirmReset = async () => {
    setBusy(true);
    try {
      await resetAllData();
      setResetSheetOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="px-5 py-5 border-t border-rose-hairline">
        <h2 className="text-[0.9375rem] font-semibold text-ink-primary">
          {t.settings.backupTitle}
        </h2>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-secondary">
          {t.settings.backupDescription}
        </p>

        <div className="mt-4 flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => void handleExport()}>
            <Download className="w-4 h-4" />
            <span>{t.settings.exportButton}</span>
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            <span>{t.settings.importButton}</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(e) => void handleFileChange(e)}
            className="hidden"
            aria-label={t.settings.importButton}
          />
        </div>

        {feedback ? (
          <p
            role="status"
            className={[
              'mt-3 rounded-[12px] px-3.5 py-2.5 text-[0.8125rem] font-medium',
              feedback.kind === 'error'
                ? 'bg-danger-soft text-danger-ink'
                : 'bg-fertile-sage-soft text-fertile-sage-ink',
            ].join(' ')}
          >
            {feedback.text}
          </p>
        ) : null}
      </section>

      <section className="px-5 py-5 border-t border-rose-hairline">
        <h2 className="text-[0.9375rem] font-semibold text-ink-primary mb-3">
          {t.settings.dangerTitle}
        </h2>
        <Button variant="danger" fullWidth onClick={() => setResetSheetOpen(true)}>
          <Trash2 className="w-4 h-4" />
          <span>{t.settings.resetButton}</span>
        </Button>
      </section>

      <BottomSheet
        open={pendingImport !== null}
        title={t.settings.importPreviewTitle}
        onClose={() => setPendingImport(null)}
        closeLabel={t.common.close}
        footer={
          <div className="flex gap-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setPendingImport(null)}
              disabled={busy}
            >
              {t.common.cancel}
            </Button>
            <Button fullWidth onClick={() => void confirmImport()} disabled={busy}>
              {t.common.confirm}
            </Button>
          </div>
        }
      >
        <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">
          {pendingImport ? t.settings.importPreviewBody(pendingImport.logs.length) : ''}
        </p>
      </BottomSheet>

      <BottomSheet
        open={resetSheetOpen}
        title={t.settings.resetConfirmTitle}
        onClose={() => setResetSheetOpen(false)}
        closeLabel={t.common.close}
        footer={
          <div className="flex gap-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setResetSheetOpen(false)}
              disabled={busy}
            >
              {t.common.cancel}
            </Button>
            <Button variant="danger" fullWidth onClick={() => void confirmReset()} disabled={busy}>
              {t.settings.resetConfirmAction}
            </Button>
          </div>
        }
      >
        <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">
          {t.settings.resetConfirmBody}
        </p>
      </BottomSheet>
    </>
  );
}
