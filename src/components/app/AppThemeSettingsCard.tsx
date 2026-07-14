import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type AppThemeMode, setStoredAppTheme } from '@/lib/appTheme';
import { persistThemePreference } from '@/lib/userPreferencesSync';
import { Button } from '@/components/ui/button';
import {
  SettingsSectionCard,
  SettingsSectionHeader,
  settingsIconToggleClass,
} from '@/components/settings/settings-ui';

type Props = {
  mode: AppThemeMode;
  onChange: (mode: AppThemeMode) => void;
};

export function AppThemeSettingsCard({ mode, onChange }: Props) {
  const { t } = useTranslation();

  const pick = (next: AppThemeMode) => {
    setStoredAppTheme(next);
    onChange(next);
    void persistThemePreference(next);
  };

  return (
    <SettingsSectionCard id="settings">
      <SettingsSectionHeader
        icon={Sun}
        title={t('adminSettings.themeTitle')}
        description={t('adminSettings.themeDescription')}
        className="mb-2"
      />
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant={mode === 'light' ? 'default' : 'outline'}
          className={settingsIconToggleClass(mode === 'light')}
          onClick={() => pick('light')}
        >
          <Sun className="size-3.5" aria-hidden />
          {t('adminSettings.themeLight')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'dark' ? 'default' : 'outline'}
          className={settingsIconToggleClass(mode === 'dark')}
          onClick={() => pick('dark')}
        >
          <Moon className="size-3.5" aria-hidden />
          {t('adminSettings.themeDark')}
        </Button>
      </div>
    </SettingsSectionCard>
  );
}
