import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import '@/app/i18n' // inicializa i18n
import { AdminAssignedProjectsProvider } from '@/contexts/AdminAssignedProjectsContext'
import { AppNavBadgesProvider } from '@/contexts/AppNavBadgesContext'
import { AppSideChatStateProvider } from '@/contexts/AppSideChatStateContext'
import { queryClient } from './queryClient'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AdminAssignedProjectsProvider>
                <AppNavBadgesProvider>
                    <AppSideChatStateProvider>{children}</AppSideChatStateProvider>
                </AppNavBadgesProvider>
            </AdminAssignedProjectsProvider>
            <Toaster position="top-center" richColors style={{ zIndex: 99990 }} />
        </QueryClientProvider>
    )
}
