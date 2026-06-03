import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Search, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  fetchInboxGroupInfo,
  openInboxParticipantChat,
  type InboxGroupInfoDto,
} from '@/lib/adminInboxApi';

type InboxGroupInfoSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string | null;
  groupName: string;
  onOpenMemberChat: (conversationId: string) => void;
};

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

export function InboxGroupInfoSheet({
  open,
  onOpenChange,
  conversationId,
  groupName,
  onOpenMemberChat,
}: InboxGroupInfoSheetProps) {
  const { t } = useTranslation();
  const [info, setInfo] = useState<InboxGroupInfoDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberQuery, setMemberQuery] = useState('');
  const [openingJid, setOpeningJid] = useState<string | null>(null);

  const loadInfo = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    const res = await fetchInboxGroupInfo(conversationId);
    setLoading(false);
    if (!res.ok) {
      setInfo(null);
      setError(res.message ?? t('adminCanales.inboxGroupLoadError'));
      return;
    }
    setInfo(res.data);
  }, [conversationId, t]);

  useEffect(() => {
    if (!open || !conversationId) {
      setMemberQuery('');
      return;
    }
    void loadInfo();
  }, [open, conversationId, loadInfo]);

  const filteredMembers = useMemo(() => {
    const members = info?.members ?? [];
    const q = memberQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        (m.phone?.toLowerCase().includes(q) ?? false),
    );
  }, [info?.members, memberQuery]);

  const handleMemberClick = async (member: InboxGroupInfoDto['members'][number]) => {
    if (!conversationId || openingJid) return;
    setOpeningJid(member.jid);
    setError(null);
    const res = await openInboxParticipantChat(conversationId, member.jid);
    setOpeningJid(null);
    if (!res.ok) {
      setError(res.message ?? t('adminCanales.inboxGroupLoadError'));
      return;
    }
    onOpenMemberChat(res.data.conversationId);
  };

  const title = info?.subject?.trim() || groupName;
  const memberLabel = info?.memberCount
    ? t('adminCanales.inboxGroupMemberCount', { count: info.memberCount })
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-white/[0.06] bg-zinc-950 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-white/[0.06] px-4 pt-4 pb-3">
          <SheetTitle className="flex items-center gap-2 text-base text-zinc-50">
            <Users className="size-4 text-teal-400" aria-hidden />
            {t('adminCanales.inboxGroupInfo')}
          </SheetTitle>
          <SheetDescription className="text-left text-xs text-zinc-400">
            {t('adminCanales.inboxGroupInfoDesc')}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
            <p className="truncate text-[15px] font-semibold text-zinc-50">{title}</p>
            {memberLabel ? (
              <p className="mt-0.5 text-[12px] text-zinc-500">{memberLabel}</p>
            ) : null}
            {info?.description ? (
              <p className="mt-2 line-clamp-4 text-[12px] leading-relaxed text-zinc-400">
                {info.description}
              </p>
            ) : null}
          </div>

          <div className="relative shrink-0 px-3 py-2">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
              aria-hidden
            />
            <Input
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder={t('adminCanales.inboxGroupSearchMembers')}
              className="h-9 border-white/10 bg-zinc-900 pl-9 text-sm text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t('adminCanales.inboxGroupLoading')}
              </div>
            ) : error ? (
              <p className="px-4 py-8 text-center text-sm text-rose-400/90">{error}</p>
            ) : filteredMembers.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                {t('adminCanales.inboxGroupNoMembers')}
              </p>
            ) : (
              <ul className="flex flex-col">
                {filteredMembers.map((member) => {
                  const busy = openingJid === member.jid;
                  return (
                    <li key={member.jid}>
                      <button
                        type="button"
                        disabled={busy}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                          'hover:bg-white/[0.06] active:bg-white/[0.08]',
                          busy && 'opacity-60',
                        )}
                        onClick={() => void handleMemberClick(member)}
                      >
                        <span
                          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[13px] font-medium text-zinc-200"
                          aria-hidden
                        >
                          {memberInitials(member.displayName)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-[14px] font-medium text-zinc-100">
                              {member.displayName}
                            </span>
                            {member.isAdmin ? (
                              <span className="shrink-0 rounded bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-medium text-teal-300">
                                {t('adminCanales.inboxGroupAdmin')}
                              </span>
                            ) : null}
                          </span>
                          {member.phone ? (
                            <span className="mt-0.5 block truncate text-[12px] text-zinc-500">
                              {member.phone}
                            </span>
                          ) : null}
                        </span>
                        {busy ? (
                          <Loader2 className="size-4 shrink-0 animate-spin text-zinc-500" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
