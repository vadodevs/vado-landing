import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SettingsCollapsibleCard } from '@/components/settings/settings-ui';
import { ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS } from '@/lib/adminFilterUi';
import {
  fetchAutoLeadsSettings,
  patchAutoLeadsSettings,
  type AutoLeadsSettings,
  type ColdEmailPromptMeta,
} from '@/lib/autoLeadsApi';
import { cn } from '@/lib/utils';

export function AdminColdEmailSettingsCard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [promptSaving, setPromptSaving] = useState(false);
  const [promptSaveError, setPromptSaveError] = useState(false);
  const [promptSavedFlash, setPromptSavedFlash] = useState(false);
  const [settings, setSettings] = useState<AutoLeadsSettings>({
    defaultAutoEnabled: true,
    coldEmailLlmEnabled: true,
    coldEmailPromptTemplate: '',
  });
  const [promptMeta, setPromptMeta] = useState<ColdEmailPromptMeta>({
    placeholders: ['contactName', 'companyName', 'companyContext', 'locale', 'country', 'email'],
    defaultTemplate: '',
  });
  const [promptDraft, setPromptDraft] = useState('');

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    const data = await fetchAutoLeadsSettings();
    if (!data) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    setSettings(data.settings);
    setPromptMeta(data.coldEmailPromptMeta);
    setPromptDraft(
      data.settings.coldEmailPromptTemplate || data.coldEmailPromptMeta.defaultTemplate,
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const promptDirty = useMemo(
    () => promptDraft.trim() !== (settings.coldEmailPromptTemplate || '').trim(),
    [promptDraft, settings.coldEmailPromptTemplate],
  );

  const onToggleColdEmailLlm = async (next: boolean) => {
    setSaving(true);
    setSaveError(false);
    const result = await patchAutoLeadsSettings({ coldEmailLlmEnabled: next });
    setSaving(false);
    if (!result) {
      setSaveError(true);
      return;
    }
    setSettings(result.settings);
    setPromptMeta(result.coldEmailPromptMeta);
  };

  const onSaveColdEmailPrompt = async () => {
    setPromptSaving(true);
    setPromptSaveError(false);
    const result = await patchAutoLeadsSettings({
      coldEmailPromptTemplate: promptDraft.trim() || promptMeta.defaultTemplate,
    });
    setPromptSaving(false);
    if (!result) {
      setPromptSaveError(true);
      return;
    }
    setSettings(result.settings);
    setPromptMeta(result.coldEmailPromptMeta);
    setPromptDraft(result.settings.coldEmailPromptTemplate);
    setPromptSavedFlash(true);
    window.setTimeout(() => setPromptSavedFlash(false), 2000);
  };

  const onResetColdEmailPrompt = () => {
    if (promptMeta.defaultTemplate) {
      setPromptDraft(promptMeta.defaultTemplate);
    }
  };

  return (
    <SettingsCollapsibleCard
      id="cold-email"
      icon={Sparkles}
      title={t('adminAutoLeads.coldEmailPromptTitle')}
      description={t('adminAutoLeads.coldEmailPromptHint')}
      action={
        <label className="inline-flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
          <span>{t('adminAutoLeads.coldEmailLlmLabel')}</span>
          <Switch
            checked={settings.coldEmailLlmEnabled}
            disabled={saving || loading}
            onCheckedChange={(next) => void onToggleColdEmailLlm(next)}
            aria-label={t('adminAutoLeads.coldEmailLlmLabel')}
          />
        </label>
      }
    >
      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('adminAutoLeads.loading')}
        </div>
      ) : loadError ? (
        <div className="space-y-2 py-2">
          <p className="text-sm text-muted-foreground">{t('adminAutoLeads.loadError')}</p>
          <Button type="button" size="sm" variant="outline" onClick={() => void loadSettings()}>
            {t('adminAutoLeads.refresh')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {saveError ? (
            <p className="text-[11px] text-rose-600 dark:text-rose-400">
              {t('adminAutoLeads.autoSaveError')}
            </p>
          ) : null}

          <p className="text-[11px] text-muted-foreground">
            {t('adminAutoLeads.coldEmailPlaceholdersLabel')}{' '}
            {promptMeta.placeholders.map((p) => (
              <code
                key={p}
                className="mr-1 inline-block rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground"
              >
                {`{{${p}}}`}
              </code>
            ))}
          </p>

          <Textarea
            value={promptDraft}
            onChange={(e) => setPromptDraft(e.target.value)}
            disabled={!settings.coldEmailLlmEnabled || promptSaving}
            rows={12}
            className="min-h-[12rem] resize-y font-mono text-[11px] leading-relaxed"
            placeholder={t('adminAutoLeads.coldEmailPromptPlaceholder')}
            aria-label={t('adminAutoLeads.coldEmailPromptTitle')}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              className={cn(ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS, 'h-8 gap-1.5 rounded-xl text-[11px]')}
              disabled={
                !settings.coldEmailLlmEnabled || promptSaving || !promptDirty || !promptDraft.trim()
              }
              onClick={() => void onSaveColdEmailPrompt()}
            >
              {promptSaving ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
              {t('adminAutoLeads.coldEmailPromptSave')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-xl text-[11px] font-semibold"
              disabled={!settings.coldEmailLlmEnabled || promptSaving || !promptMeta.defaultTemplate}
              onClick={onResetColdEmailPrompt}
            >
              {t('adminAutoLeads.coldEmailPromptReset')}
            </Button>
            {promptSavedFlash ? (
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                {t('adminAutoLeads.coldEmailPromptSaved')}
              </span>
            ) : null}
            {promptSaveError ? (
              <span className="text-[11px] text-rose-600 dark:text-rose-400">
                {t('adminAutoLeads.coldEmailPromptSaveError')}
              </span>
            ) : null}
            {!settings.coldEmailLlmEnabled ? (
              <span className="text-[11px] text-muted-foreground">
                {t('adminAutoLeads.coldEmailLlmOffHint')}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </SettingsCollapsibleCard>
  );
}
