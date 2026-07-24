import { useEffect, useState } from 'react'
import { PanelLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  SettingsSectionCard,
  SettingsSectionHeader,
} from '@/components/settings/settings-ui'
import {
  ADMIN_SIDEBAR_TOGGLEABLE_SECTIONS,
  ADMIN_SIDEBAR_VISIBILITY_CHANGE_EVENT,
  DEFAULT_ADMIN_SIDEBAR_VISIBILITY,
  type AdminSidebarSectionId,
  type AdminSidebarVisibility,
  readAdminSidebarVisibility,
} from '@/lib/adminSidebarVisibility'
import { persistSidebarVisibilityPreference } from '@/lib/userPreferencesSync'

const SECTION_LABEL_KEY: Record<AdminSidebarSectionId, string> = {
  general: 'sidebarDemo.navSectionGeneral',
  talent: 'sidebarDemo.navSectionTalent',
  sales: 'sidebarDemo.navSectionSales',
  channels: 'sidebarDemo.navSectionChannels',
  utilities: 'sidebarDemo.navSectionUtilities',
}

export function AdminSidebarVisibilityCard() {
  const { t } = useTranslation()
  const [visibility, setVisibility] = useState<AdminSidebarVisibility>(() =>
    readAdminSidebarVisibility(),
  )

  useEffect(() => {
    const sync = () => setVisibility(readAdminSidebarVisibility())
    window.addEventListener(ADMIN_SIDEBAR_VISIBILITY_CHANGE_EVENT, sync)
    return () => window.removeEventListener(ADMIN_SIDEBAR_VISIBILITY_CHANGE_EVENT, sync)
  }, [])

  const toggle = (id: AdminSidebarSectionId, next: boolean) => {
    const updated = { ...readAdminSidebarVisibility(), [id]: next }
    setVisibility(updated)
    void persistSidebarVisibilityPreference(updated)
  }

  const allVisible = ADMIN_SIDEBAR_TOGGLEABLE_SECTIONS.every((id) => visibility[id])

  return (
    <SettingsSectionCard id="sidebar-visibility">
      <SettingsSectionHeader
        icon={PanelLeft}
        title={t('adminSettings.sidebarVisibilityTitle')}
        description={t('adminSettings.sidebarVisibilityDescription')}
        className="mb-3"
      />

      <ul className="space-y-2">
        {ADMIN_SIDEBAR_TOGGLEABLE_SECTIONS.map((id) => {
          const checked = visibility[id] !== false
          const labelId = `sidebar-vis-${id}`
          return (
            <li
              key={id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5"
            >
              <Label htmlFor={labelId} className="cursor-pointer text-sm font-medium text-foreground">
                {t(SECTION_LABEL_KEY[id])}
              </Label>
              <Switch
                id={labelId}
                checked={checked}
                onCheckedChange={(v) => toggle(id, v === true)}
                aria-label={t('adminSettings.sidebarVisibilityToggleAria', {
                  section: t(SECTION_LABEL_KEY[id]),
                })}
              />
            </li>
          )
        })}
      </ul>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {t('adminSettings.sidebarVisibilityHint')}
      </p>

      {!allVisible ? (
        <button
          type="button"
          className="mt-2 text-[11px] font-semibold text-foreground hover:underline"
          onClick={() => {
            setVisibility({ ...DEFAULT_ADMIN_SIDEBAR_VISIBILITY })
            void persistSidebarVisibilityPreference({ ...DEFAULT_ADMIN_SIDEBAR_VISIBILITY })
          }}
        >
          {t('adminSettings.sidebarVisibilityShowAll')}
        </button>
      ) : null}
    </SettingsSectionCard>
  )
}
