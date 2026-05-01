import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { AppThemeSettingsCard } from '@/components/app/AppThemeSettingsCard';
import { getStoredAppTheme, type AppThemeMode } from '@/lib/appTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { devAuthorizedFetch, getDevAccessToken } from '@/lib/devAuth';

export default function AppDevSettings() {
  const { t } = useTranslation();
  const [themeMode, setThemeMode] = useState<AppThemeMode>('light');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

  useEffect(() => {
    setThemeMode(getStoredAppTheme());
  }, []);

  const changePassword = () => {
    const pw = newPassword.trim();
    if (!pw) {
      setPasswordError('Escribe una nueva contraseña.');
      setPasswordSuccess(null);
      return;
    }
    if (pw.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      setPasswordSuccess(null);
      return;
    }
    if (!apiBase || !getDevAccessToken()) {
      setPasswordError('No se pudo actualizar la contraseña: sesión o API no disponible.');
      setPasswordSuccess(null);
      return;
    }
    setSavingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    void devAuthorizedFetch(`${apiBase}/users/developers/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword: pw }),
    })
      .then((res) => {
        if (!res || !res.ok) throw new Error(String(res?.status ?? 0));
        setNewPassword('');
        setShowPassword(false);
        setPasswordSuccess('Contraseña actualizada correctamente.');
      })
      .catch(() => {
        setPasswordError('No se pudo actualizar la contraseña. Intenta nuevamente.');
      })
      .finally(() => setSavingPassword(false));
  };

  return (
    <AppShell
      pathWithoutLang="/app/dev/settings"
      title={t('sidebarDemo.navSettings')}
      description={t('seo.appDev')}
    >
      <section id="settings" className="scroll-mt-24">
        <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{t('sidebarDemo.navSettings')}</h2>
        <AppThemeSettingsCard mode={themeMode} onChange={setThemeMode} />
        <div className="mt-4 max-w-xl rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Cambiar contraseña</p>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            Define una nueva contraseña para tu cuenta.
          </p>
          <div className="space-y-2">
            <Label htmlFor="dev-settings-password" className="text-xs text-zinc-500 dark:text-zinc-400">
              Nueva contraseña
            </Label>
            <div className="relative">
              <Input
                id="dev-settings-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 pr-10"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0.5 top-0.5 size-9 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Mínimo 8 caracteres.</p>
            {passwordError ? (
              <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
                {passwordError}
              </p>
            ) : null}
            {passwordSuccess ? (
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400" role="status">
                {passwordSuccess}
              </p>
            ) : null}
            <div className="pt-1">
              <Button type="button" onClick={changePassword} disabled={savingPassword} className="h-10 rounded-xl">
                {savingPassword ? 'Guardando...' : 'Actualizar contraseña'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
