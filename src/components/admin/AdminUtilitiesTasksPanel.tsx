import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  LayoutGrid,
  List,
  ListTodo,
  Plus,
  RotateCcw,
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
  createUtilityTaskApi,
  deleteUtilityTaskApi,
  fetchUtilityTasks,
  patchUtilityTaskApi,
  type UtilityTask,
} from '@/lib/adminUtilitiesApi';
import { ADMIN_FIELD_INPUT_CLASS, ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';
import { cn } from '@/lib/utils';

type TaskViewMode = 'cards' | 'list';
type TaskSection = 'todo' | 'done';

type TaskFormState = {
  title: string;
  description: string;
};

const EMPTY_FORM: TaskFormState = {
  title: '',
  description: '',
};

function formatDateLabel(isoDate: string, locale: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function TaskActions({
  task,
  t,
  onToggleStatus,
  onDelete,
}: {
  task: UtilityTask;
  t: TFunction;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isDone = task.status === 'done';

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          'size-8',
          isDone ? 'text-muted-foreground hover:text-foreground' : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400',
        )}
        onClick={() => onToggleStatus(task.id)}
        aria-label={
          isDone
            ? t('adminUtilities.tasksReopenAria', { title: task.title })
            : t('adminUtilities.tasksCompleteAria', { title: task.title })
        }
      >
        {isDone ? <RotateCcw className="size-4" aria-hidden /> : <CheckCircle2 className="size-4" aria-hidden />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(task.id)}
        aria-label={t('adminUtilities.tasksDeleteAria', { title: task.title })}
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

function TaskCard({
  task,
  locale,
  t,
  onToggleStatus,
  onDelete,
}: {
  task: UtilityTask;
  locale: string;
  t: TFunction;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isDone = task.status === 'done';

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm',
        isDone && 'opacity-90',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          {isDone ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          ) : (
            <Circle className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
          )}
          <h3
            className={cn(
              'min-w-0 text-base font-semibold text-foreground',
              isDone && 'text-muted-foreground line-through',
            )}
          >
            {task.title}
          </h3>
        </div>
        <TaskActions task={task} t={t} onToggleStatus={onToggleStatus} onDelete={onDelete} />
      </div>
      {task.description ? (
        <p className="mt-2 flex-1 pl-6 text-sm leading-relaxed text-muted-foreground">{task.description}</p>
      ) : (
        <p className="mt-2 flex-1 pl-6 text-sm italic text-muted-foreground">
          {t('adminUtilities.tasksNoDescription')}
        </p>
      )}
      {isDone && task.completedAt ? (
        <p className="mt-4 pl-6 text-[11px] text-muted-foreground">
          {t('adminUtilities.tasksCompletedOn', {
            date: formatDateLabel(task.completedAt, locale),
          })}
        </p>
      ) : null}
    </article>
  );
}

function TaskListRow({
  task,
  locale,
  t,
  onToggleStatus,
  onDelete,
}: {
  task: UtilityTask;
  locale: string;
  t: TFunction;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isDone = task.status === 'done';

  return (
    <article
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm',
        isDone && 'opacity-90',
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {isDone ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          ) : (
            <Circle className="size-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
          )}
          <h3
            className={cn(
              'text-sm font-semibold text-foreground',
              isDone && 'text-muted-foreground line-through',
            )}
          >
            {task.title}
          </h3>
        </div>
        {task.description ? (
          <p className="pl-6 text-sm text-muted-foreground">{task.description}</p>
        ) : (
          <p className="pl-6 text-sm italic text-muted-foreground">{t('adminUtilities.tasksNoDescription')}</p>
        )}
        {isDone && task.completedAt ? (
          <p className="pl-6 text-[11px] text-muted-foreground">
            {t('adminUtilities.tasksCompletedOn', {
              date: formatDateLabel(task.completedAt, locale),
            })}
          </p>
        ) : null}
      </div>
      <TaskActions task={task} t={t} onToggleStatus={onToggleStatus} onDelete={onDelete} />
    </article>
  );
}

export function AdminUtilitiesTasksPanel() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [section, setSection] = useState<TaskSection>('todo');
  const [viewMode, setViewMode] = useState<TaskViewMode>('cards');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TaskFormState>(EMPTY_FORM);
  const [tasks, setTasks] = useState<UtilityTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const data = await fetchUtilityTasks();
    setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const todoTasks = useMemo(() => tasks.filter((task) => task.status === 'todo'), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((task) => task.status === 'done'), [tasks]);
  const visibleTasks = section === 'todo' ? todoTasks : doneTasks;
  const isDoneSection = section === 'done';

  const resetForm = () => setForm(EMPTY_FORM);

  const handleAddTask = async () => {
    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      toast.error(t('adminUtilities.tasksFormError'));
      return;
    }

    setSaving(true);
    const created = await createUtilityTaskApi({ title, description });
    setSaving(false);

    if (!created) {
      toast.error(t('adminUtilities.tasksSaveError'));
      return;
    }

    await loadTasks();
    toast.success(t('adminUtilities.tasksAdded'));
    resetForm();
    setDialogOpen(false);
    setSection('todo');
  };

  const handleToggleStatus = async (id: string) => {
    const current = tasks.find((task) => task.id === id);
    if (!current) return;

    const nextStatus = current.status === 'todo' ? 'done' : 'todo';
    const updated = await patchUtilityTaskApi(id, { status: nextStatus });
    if (!updated) {
      toast.error(t('adminUtilities.tasksSaveError'));
      return;
    }

    await loadTasks();
    toast.success(
      nextStatus === 'done'
        ? t('adminUtilities.tasksMarkedDone')
        : t('adminUtilities.tasksMarkedTodo'),
    );
  };

  const handleDeleteTask = async (id: string) => {
    const ok = await deleteUtilityTaskApi(id);
    if (!ok) {
      toast.error(t('adminUtilities.tasksSaveError'));
      return;
    }

    await loadTasks();
    toast.success(t('adminUtilities.tasksDeleted'));
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300">
            <ListTodo className="size-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-foreground">{t('adminUtilities.tasksTitle')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('adminUtilities.tasksSubtitle')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-xl border border-border bg-muted/30 p-0.5"
            role="group"
            aria-label={t('adminUtilities.tasksViewToggleAria')}
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
              {t('adminUtilities.tasksViewCards')}
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
              {t('adminUtilities.tasksViewList')}
            </Button>
          </div>
          {!isDoneSection ? (
            <Button
              type="button"
              className={cn(ADMIN_PRIMARY_BTN_CLASS, 'h-9 gap-1.5 rounded-xl px-3 text-xs')}
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="size-4" aria-hidden />
              {t('adminUtilities.tasksAdd')}
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className="inline-flex rounded-xl border border-border bg-muted/20 p-0.5"
        role="group"
        aria-label={t('adminUtilities.tasksSectionToggleAria')}
      >
        <Button
          type="button"
          size="sm"
          variant={section === 'todo' ? 'default' : 'ghost'}
          className={cn(
            'h-8 gap-1.5 rounded-lg px-3 text-xs',
            section === 'todo' && ADMIN_PRIMARY_BTN_CLASS,
          )}
          onClick={() => setSection('todo')}
          aria-pressed={section === 'todo'}
        >
          <Circle className="size-3.5" aria-hidden />
          {t('adminUtilities.tasksSectionTodo', { count: todoTasks.length })}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={section === 'done' ? 'default' : 'ghost'}
          className={cn(
            'h-8 gap-1.5 rounded-lg px-3 text-xs',
            section === 'done' && ADMIN_PRIMARY_BTN_CLASS,
          )}
          onClick={() => setSection('done')}
          aria-pressed={section === 'done'}
        >
          <CheckCircle2 className="size-3.5" aria-hidden />
          {t('adminUtilities.tasksSectionDone', { count: doneTasks.length })}
        </Button>
      </div>

      {loading ? (
        <p className="rounded-xl border border-dashed border-border/70 px-4 py-12 text-center text-sm text-muted-foreground">
          {t('adminUtilities.tasksLoading')}
        </p>
      ) : visibleTasks.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                locale={locale}
                t={t}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleTasks.map((task) => (
              <TaskListRow
                key={task.id}
                task={task}
                locale={locale}
                t={t}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )
      ) : (
        <p className="rounded-xl border border-dashed border-border/70 px-4 py-12 text-center text-sm text-muted-foreground">
          {isDoneSection ? t('adminUtilities.tasksDoneEmpty') : t('adminUtilities.tasksEmpty')}
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
            <DialogTitle>{t('adminUtilities.tasksFormTitle')}</DialogTitle>
            <DialogDescription>{t('adminUtilities.tasksFormDescription')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="utility-task-title">{t('adminUtilities.tasksFieldTitle')}</Label>
              <Input
                id="utility-task-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder={t('adminUtilities.tasksFieldTitlePlaceholder')}
                className={ADMIN_FIELD_INPUT_CLASS}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utility-task-description">{t('adminUtilities.tasksFieldDescription')}</Label>
              <Textarea
                id="utility-task-description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t('adminUtilities.tasksFieldDescriptionPlaceholder')}
                className="resize-y rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {t('adminUtilities.tasksCancel')}
            </Button>
            <Button
              type="button"
              className={ADMIN_PRIMARY_BTN_CLASS}
              disabled={saving}
              onClick={() => void handleAddTask()}
            >
              {saving ? t('adminUtilities.tasksSaving') : t('adminUtilities.tasksSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
