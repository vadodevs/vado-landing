import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  BellRing,
  CalendarDays,
  LayoutGrid,
  List,
  Plus,
  Trash2,
} from 'lucide-react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/hooks/useLocale';
import {
  archiveUtilityReminderApi,
  createUtilityReminderApi,
  deleteUtilityReminderApi,
  fetchUtilityReminders,
  type UtilityReminder,
  type UtilityReminderArchiveReason,
} from '@/lib/adminUtilitiesApi';
import { ADMIN_FIELD_INPUT_CLASS, ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';
import { cn } from '@/lib/utils';

type ReminderViewMode = 'cards' | 'list';
type ReminderSection = 'active' | 'archived';

type ReminderFormState = {
  title: string;
  description: string;
  dueDate: string;
};

const EMPTY_FORM: ReminderFormState = {
  title: '',
  description: '',
  dueDate: '',
};

function compareByDueDate(a: UtilityReminder, b: UtilityReminder): number {
  return a.dueDate.localeCompare(b.dueDate);
}

function compareByArchivedAtDesc(a: UtilityReminder, b: UtilityReminder): number {
  const aDate = a.archivedAt ?? '';
  const bDate = b.archivedAt ?? '';
  return bDate.localeCompare(aDate);
}

function isOverdue(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T12:00:00`);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function formatDueDate(dueDate: string, locale: string): string {
  const date = new Date(`${dueDate}T12:00:00`);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function ReminderDueBadge({
  dueDate,
  locale,
  t,
  archived = false,
}: {
  dueDate: string;
  locale: string;
  t: TFunction;
  archived?: boolean;
}) {
  const overdue = !archived && isOverdue(dueDate);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
        archived
          ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
          : overdue
            ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
            : 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
      )}
    >
      <CalendarDays className="size-3 shrink-0" aria-hidden />
      {archived
        ? t('adminUtilities.remindersDueOn', { date: formatDueDate(dueDate, locale) })
        : overdue
          ? t('adminUtilities.remindersOverdue')
          : formatDueDate(dueDate, locale)}
    </span>
  );
}

function ReminderArchiveReasonBadge({
  reason,
  t,
}: {
  reason: UtilityReminderArchiveReason | null;
  t: TFunction;
}) {
  if (!reason) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      {reason === 'due_date'
        ? t('adminUtilities.remindersArchivedByDueDate')
        : t('adminUtilities.remindersArchivedManually')}
    </span>
  );
}

function ReminderActions({
  reminderId,
  title,
  t,
  onArchive,
  onDelete,
  showArchive,
}: {
  reminderId: string;
  title: string;
  t: TFunction;
  onArchive?: (id: string) => void;
  onDelete: (id: string) => void;
  showArchive: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {showArchive && onArchive ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          onClick={() => onArchive(reminderId)}
          aria-label={t('adminUtilities.remindersArchiveAria', { title })}
        >
          <Archive className="size-4" aria-hidden />
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(reminderId)}
        aria-label={t('adminUtilities.remindersDeleteAria', { title })}
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

function ReminderCard({
  reminder,
  locale,
  t,
  archived,
  onArchive,
  onDelete,
}: {
  reminder: UtilityReminder;
  locale: string;
  t: TFunction;
  archived: boolean;
  onArchive?: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm',
        archived && 'opacity-90',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-base font-semibold text-foreground">{reminder.title}</h3>
        <ReminderActions
          reminderId={reminder.id}
          title={reminder.title}
          t={t}
          onArchive={onArchive}
          onDelete={onDelete}
          showArchive={!archived}
        />
      </div>
      {reminder.description ? (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{reminder.description}</p>
      ) : (
        <p className="mt-2 flex-1 text-sm italic text-muted-foreground">
          {t('adminUtilities.remindersNoDescription')}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ReminderDueBadge dueDate={reminder.dueDate} locale={locale} t={t} archived={archived} />
        {archived ? <ReminderArchiveReasonBadge reason={reminder.archiveReason} t={t} /> : null}
      </div>
      {archived && reminder.archivedAt ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {t('adminUtilities.remindersArchivedOn', {
            date: formatDueDate(reminder.archivedAt, locale),
          })}
        </p>
      ) : null}
    </article>
  );
}

function ReminderListRow({
  reminder,
  locale,
  t,
  archived,
  onArchive,
  onDelete,
}: {
  reminder: UtilityReminder;
  locale: string;
  t: TFunction;
  archived: boolean;
  onArchive?: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm',
        archived && 'opacity-90',
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{reminder.title}</h3>
          <ReminderDueBadge dueDate={reminder.dueDate} locale={locale} t={t} archived={archived} />
          {archived ? <ReminderArchiveReasonBadge reason={reminder.archiveReason} t={t} /> : null}
        </div>
        {reminder.description ? (
          <p className="text-sm text-muted-foreground">{reminder.description}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground">{t('adminUtilities.remindersNoDescription')}</p>
        )}
        {archived && reminder.archivedAt ? (
          <p className="text-[11px] text-muted-foreground">
            {t('adminUtilities.remindersArchivedOn', {
              date: formatDueDate(reminder.archivedAt, locale),
            })}
          </p>
        ) : null}
      </div>
      <ReminderActions
        reminderId={reminder.id}
        title={reminder.title}
        t={t}
        onArchive={onArchive}
        onDelete={onDelete}
        showArchive={!archived}
      />
    </article>
  );
}

export function AdminUtilitiesRemindersPanel() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [section, setSection] = useState<ReminderSection>('active');
  const [viewMode, setViewMode] = useState<ReminderViewMode>('cards');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ReminderFormState>(EMPTY_FORM);
  const [reminders, setReminders] = useState<UtilityReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadReminders = useCallback(async () => {
    setLoading(true);
    const data = await fetchUtilityReminders();
    setReminders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadReminders();
  }, [loadReminders]);

  const activeReminders = useMemo(
    () => reminders.filter((item) => !item.archivedAt).sort(compareByDueDate),
    [reminders],
  );

  const archivedReminders = useMemo(
    () => reminders.filter((item) => item.archivedAt).sort(compareByArchivedAtDesc),
    [reminders],
  );

  const visibleReminders = section === 'active' ? activeReminders : archivedReminders;

  const resetForm = () => setForm(EMPTY_FORM);

  const handleAddReminder = async () => {
    const title = form.title.trim();
    const description = form.description.trim();
    const dueDate = form.dueDate.trim();

    if (!title || !dueDate) {
      toast.error(t('adminUtilities.remindersFormError'));
      return;
    }

    setSaving(true);
    const created = await createUtilityReminderApi({ title, description, dueDate });
    setSaving(false);

    if (!created) {
      toast.error(t('adminUtilities.remindersSaveError'));
      return;
    }

    await loadReminders();
    toast.success(t('adminUtilities.remindersAdded'));
    resetForm();
    setDialogOpen(false);
    setSection('active');
  };

  const handleArchiveReminder = async (id: string) => {
    const updated = await archiveUtilityReminderApi(id);
    if (!updated) {
      toast.error(t('adminUtilities.remindersSaveError'));
      return;
    }

    await loadReminders();
    toast.success(t('adminUtilities.remindersArchived'));
  };

  const handleDeleteReminder = async (id: string) => {
    const ok = await deleteUtilityReminderApi(id);
    if (!ok) {
      toast.error(t('adminUtilities.remindersSaveError'));
      return;
    }

    await loadReminders();
    toast.success(t('adminUtilities.remindersDeleted'));
  };

  const isArchivedSection = section === 'archived';

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
            <BellRing className="size-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-foreground">{t('adminUtilities.remindersTitle')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('adminUtilities.remindersSubtitle')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-xl border border-border bg-muted/30 p-0.5"
            role="group"
            aria-label={t('adminUtilities.remindersViewToggleAria')}
          >
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              className={cn(
                'h-8 gap-1.5 rounded-lg px-3 text-xs',
                viewMode === 'cards' && ADMIN_PRIMARY_BTN_CLASS,
              )}
              onClick={() => setViewMode('cards')}
              aria-pressed={viewMode === 'cards'}
            >
              <LayoutGrid className="size-3.5" aria-hidden />
              {t('adminUtilities.remindersViewCards')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className={cn(
                'h-8 gap-1.5 rounded-lg px-3 text-xs',
                viewMode === 'list' && ADMIN_PRIMARY_BTN_CLASS,
              )}
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
            >
              <List className="size-3.5" aria-hidden />
              {t('adminUtilities.remindersViewList')}
            </Button>
          </div>
          {!isArchivedSection ? (
            <Button
              type="button"
              className={cn(ADMIN_PRIMARY_BTN_CLASS, 'h-9 gap-1.5 rounded-xl px-3 text-xs')}
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="size-4" aria-hidden />
              {t('adminUtilities.remindersAdd')}
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className="inline-flex rounded-xl border border-border bg-muted/20 p-0.5"
        role="group"
        aria-label={t('adminUtilities.remindersSectionToggleAria')}
      >
        <Button
          type="button"
          size="sm"
          variant={section === 'active' ? 'default' : 'ghost'}
          className={cn(
            'h-8 gap-1.5 rounded-lg px-3 text-xs',
            section === 'active' && ADMIN_PRIMARY_BTN_CLASS,
          )}
          onClick={() => setSection('active')}
          aria-pressed={section === 'active'}
        >
          <BellRing className="size-3.5" aria-hidden />
          {t('adminUtilities.remindersSectionActive', { count: activeReminders.length })}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={section === 'archived' ? 'default' : 'ghost'}
          className={cn(
            'h-8 gap-1.5 rounded-lg px-3 text-xs',
            section === 'archived' && ADMIN_PRIMARY_BTN_CLASS,
          )}
          onClick={() => setSection('archived')}
          aria-pressed={section === 'archived'}
        >
          <Archive className="size-3.5" aria-hidden />
          {t('adminUtilities.remindersSectionArchived', { count: archivedReminders.length })}
        </Button>
      </div>

      {loading ? (
        <p className="rounded-xl border border-dashed border-border/70 px-4 py-12 text-center text-sm text-muted-foreground">
          {t('adminUtilities.remindersLoading')}
        </p>
      ) : visibleReminders.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                locale={locale}
                t={t}
                archived={isArchivedSection}
                onArchive={handleArchiveReminder}
                onDelete={handleDeleteReminder}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleReminders.map((reminder) => (
              <ReminderListRow
                key={reminder.id}
                reminder={reminder}
                locale={locale}
                t={t}
                archived={isArchivedSection}
                onArchive={handleArchiveReminder}
                onDelete={handleDeleteReminder}
              />
            ))}
          </div>
        )
      ) : (
        <p className="rounded-xl border border-dashed border-border/70 px-4 py-12 text-center text-sm text-muted-foreground">
          {isArchivedSection
            ? t('adminUtilities.remindersArchivedEmpty')
            : t('adminUtilities.remindersEmpty')}
        </p>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent useAppDark className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('adminUtilities.remindersFormTitle')}</DialogTitle>
            <DialogDescription>{t('adminUtilities.remindersFormDescription')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="utility-reminder-title">{t('adminUtilities.remindersFieldTitle')}</Label>
              <Input
                id="utility-reminder-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder={t('adminUtilities.remindersFieldTitlePlaceholder')}
                className={ADMIN_FIELD_INPUT_CLASS}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utility-reminder-description">
                {t('adminUtilities.remindersFieldDescription')}
              </Label>
              <Textarea
                id="utility-reminder-description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t('adminUtilities.remindersFieldDescriptionPlaceholder')}
                className="resize-y rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utility-reminder-due-date">
                {t('adminUtilities.remindersFieldDueDate')}
              </Label>
              <Input
                id="utility-reminder-due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                className={ADMIN_FIELD_INPUT_CLASS}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {t('adminUtilities.remindersCancel')}
            </Button>
            <Button
              type="button"
              className={ADMIN_PRIMARY_BTN_CLASS}
              disabled={saving}
              onClick={() => void handleAddReminder()}
            >
              {saving ? t('adminUtilities.remindersSaving') : t('adminUtilities.remindersSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
