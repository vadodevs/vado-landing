import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileSpreadsheet, Loader2, Search, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createCompanySubmission,
  type CompanyContact,
} from '@/lib/companyAdminContact';
import {
  downloadCompanyLeadsExcel,
  downloadCompanyLeadsExcelTemplate,
  isValidImportEmail,
  readCompanyLeadsExcelFile,
  type CompanyLeadExcelRow,
} from '@/lib/companyLeadsExcel';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: CompanyContact[];
  onImported: () => void;
};

export function CompanyLeadsExcelDialog({
  open,
  onOpenChange,
  contacts,
  onImported,
}: Props) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [previewRows, setPreviewRows] = useState<CompanyLeadExcelRow[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [leadSearch, setLeadSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelectedIds(new Set(contacts.map((c) => c.id)));
    setLeadSearch('');
  }, [open, contacts]);

  const visibleContacts = useMemo(() => {
    const q = leadSearch.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
      const hay = `${c.nombre} ${c.correo} ${c.empresa}`.toLowerCase();
      return hay.includes(q);
    });
  }, [contacts, leadSearch]);

  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    visibleContacts.length > 0 && visibleContacts.every((c) => selectedIds.has(c.id));
  const someVisibleSelected =
    visibleContacts.some((c) => selectedIds.has(c.id)) && !allVisibleSelected;

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const c of visibleContacts) {
        if (checked) next.add(c.id);
        else next.delete(c.id);
      }
      return next;
    });
  };

  const resetImport = () => {
    setPreviewRows(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetImport();
      setLeadSearch('');
    }
    onOpenChange(next);
  };

  const handleExport = () => {
    const selected = contacts.filter((c) => selectedIds.has(c.id));
    if (selected.length === 0) {
      toast.error(t('adminCompany.excelExportNoneSelected'));
      return;
    }
    downloadCompanyLeadsExcel(selected);
    toast.success(t('adminCompany.excelExportDone', { count: selected.length }));
  };

  const handleTemplate = () => {
    downloadCompanyLeadsExcelTemplate();
    toast.message(t('adminCompany.excelTemplateDownloaded'));
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    const parsed = await readCompanyLeadsExcelFile(file);
    if (!parsed.ok) {
      toast.error(parsed.error);
      resetImport();
      return;
    }
    if (parsed.rows.length === 0) {
      toast.error(t('adminCompany.excelImportNoRows'));
      resetImport();
      return;
    }
    setFileName(file.name);
    setPreviewRows(parsed.rows);
  };

  const runImport = async () => {
    if (!previewRows || previewRows.length === 0) return;
    setImporting(true);
    let created = 0;
    let skipped = 0;
    let failed = 0;

    try {
      for (const row of previewRows) {
        const nombre = row.nombre.trim();
        const correo = row.correo.trim();
        if (!nombre || !correo || !isValidImportEmail(correo)) {
          skipped += 1;
          continue;
        }
        const result = await createCompanySubmission({
          nombre,
          correo,
          empresa: row.empresa.trim() || undefined,
          telefono: row.telefono.trim() || undefined,
          servicio: row.servicio.trim() || undefined,
          mensaje:
            [row.mensaje, row.sector && `Sector: ${row.sector}`, row.ciudad && `Ciudad: ${row.ciudad}`]
              .filter(Boolean)
              .join('\n')
              .trim() || undefined,
        });
        if (result.ok) created += 1;
        else failed += 1;
      }

      toast.success(t('adminCompany.excelImportSummary', { created, skipped, failed }));
      if (created > 0) {
        onImported();
        handleOpenChange(false);
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        useAppDark
        className="flex max-h-[min(92vh,42rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 border-b border-border/60 px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
            {t('adminCompany.excelDialogTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t('adminCompany.excelDialogBody')}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <section className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('adminCompany.excelExportSection')}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {t('adminCompany.excelExportSelectedCount', { count: selectedCount })}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{t('adminCompany.excelExportSelectHint')}</p>

            {contacts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 px-3 py-6 text-center text-sm text-muted-foreground">
                {t('adminCompany.excelExportEmpty')}
              </p>
            ) : (
              <>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder={t('adminCompany.excelLeadSearch')}
                    aria-label={t('adminCompany.excelLeadSearch')}
                    className={cn(
                      'h-9 w-full rounded-xl border border-border/70 bg-muted/30 pr-3 pl-9 text-sm',
                      'text-foreground outline-none placeholder:text-muted-foreground',
                      'focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                  />
                </div>

                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <Checkbox
                    checked={
                      allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false
                    }
                    disabled={visibleContacts.length === 0}
                    onCheckedChange={(v) => toggleAllVisible(v === true)}
                    aria-label={t('adminCompany.excelSelectAll')}
                  />
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-foreground hover:underline"
                    disabled={visibleContacts.length === 0}
                    onClick={() => toggleAllVisible(!allVisibleSelected)}
                  >
                    {allVisibleSelected
                      ? t('adminCompany.excelDeselectAll')
                      : t('adminCompany.excelSelectAll')}
                  </button>
                  <span className="text-[11px] text-muted-foreground">
                    ({visibleContacts.length})
                  </span>
                </div>

                <ul className="max-h-[min(36vh,14rem)] space-y-1 overflow-y-auto rounded-xl border border-border/60 p-1.5">
                  {visibleContacts.length === 0 ? (
                    <li className="px-2 py-4 text-center text-xs text-muted-foreground">
                      {t('adminCompany.excelLeadSearchEmpty')}
                    </li>
                  ) : (
                    visibleContacts.map((contact) => {
                      const checked = selectedIds.has(contact.id);
                      return (
                        <li key={contact.id}>
                          <label
                            className={cn(
                              'flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5',
                              checked ? 'bg-emerald-500/10' : 'hover:bg-muted/40',
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => toggleOne(contact.id, v === true)}
                              className="mt-0.5"
                              aria-label={contact.nombre}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-foreground">
                                {contact.nombre}
                              </span>
                              <span className="block truncate text-[11px] text-muted-foreground">
                                {contact.correo}
                                {contact.empresa && contact.empresa !== '—'
                                  ? ` · ${contact.empresa}`
                                  : ''}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })
                  )}
                </ul>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2"
                  disabled={selectedCount === 0}
                  onClick={handleExport}
                >
                  <Download className="size-4" aria-hidden />
                  {t('adminCompany.excelExportAction')}
                  {selectedCount > 0 ? ` (${selectedCount})` : ''}
                </Button>
              </>
            )}
          </section>

          <section className="space-y-2 border-t border-border/60 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('adminCompany.excelImportSection')}
            </h3>
            <p className="text-sm text-muted-foreground">{t('adminCompany.excelImportHint')}</p>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleTemplate}
            >
              <FileSpreadsheet className="size-4" aria-hidden />
              {t('adminCompany.excelTemplateAction')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" aria-hidden />
              {t('adminCompany.excelUploadAction')}
            </Button>

            {previewRows ? (
              <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5 text-sm">
                <p className="font-medium text-foreground">
                  {fileName ?? t('adminCompany.excelFileReady')}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('adminCompany.excelPreviewCount', { count: previewRows.length })}
                </p>
                <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                  {previewRows.slice(0, 5).map((row, i) => (
                    <li key={`${row.correo}-${i}`} className="truncate">
                      {row.nombre || '—'} · {row.correo || 'sin correo'}
                      {row.empresa ? ` · ${row.empresa}` : ''}
                    </li>
                  ))}
                  {previewRows.length > 5 ? <li>… +{previewRows.length - 5}</li> : null}
                </ul>
              </div>
            ) : null}
          </section>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/60 px-5 py-3 sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
            {t('adminCompany.excelClose')}
          </Button>
          <Button
            type="button"
            disabled={!previewRows?.length || importing}
            onClick={() => void runImport()}
            className="gap-1.5"
          >
            {importing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="size-4" aria-hidden />
            )}
            {importing ? t('adminCompany.excelImporting') : t('adminCompany.excelImportAction')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
