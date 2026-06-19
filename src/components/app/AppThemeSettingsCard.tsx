import { Moon, Sun } from 'lucide-react';
import { type AppThemeMode, setStoredAppTheme } from '@/lib/appTheme';
import { persistThemePreference } from '@/lib/userPreferencesSync';
import { cn } from '@/lib/utils';

type Props = {
  mode: AppThemeMode;
  onChange: (mode: AppThemeMode) => void;
};

export function AppThemeSettingsCard({ mode, onChange }: Props) {
  const pick = (next: AppThemeMode) => {
    setStoredAppTheme(next);
    onChange(next);
    void persistThemePreference(next);
  };
  const isDark = mode === 'dark';

  return (
    <div
      className={cn(
        'max-w-xl rounded-2xl border p-4',
        isDark ? 'border-zinc-700/80 bg-zinc-900 text-zinc-100' : 'border-border bg-card text-foreground',
      )}
    >
      <p className="mb-1 text-sm font-semibold">Apariencia</p>
      <p className={cn('mb-3 text-sm', isDark ? 'text-zinc-400' : 'text-muted-foreground')}>
        Selecciona cómo quieres ver el panel interno.
      </p>
      <div
        className={cn(
          'inline-flex w-full rounded-xl border p-1',
          isDark ? 'border-zinc-700/80 bg-zinc-800/70' : 'border-border bg-muted/40',
        )}
      >
        <button
          type="button"
          onClick={() => pick('light')}
          className={cn(
            'flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors',
            mode === 'light'
              ? isDark
                ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                : 'bg-background text-foreground shadow-sm'
              : isDark
                ? 'text-zinc-400 hover:text-zinc-100'
                : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Sun className="size-4" />
          Claro
        </button>
        <button
          type="button"
          onClick={() => pick('dark')}
          className={cn(
            'flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors',
            mode === 'dark'
              ? isDark
                ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                : 'bg-background text-foreground shadow-sm'
              : isDark
                ? 'text-zinc-400 hover:text-zinc-100'
                : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Moon className="size-4" />
          Oscuro
        </button>
      </div>
    </div>
  );
}
