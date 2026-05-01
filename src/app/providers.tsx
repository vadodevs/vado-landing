import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import '@/app/i18n' // inicializa i18n
import { AdminAssignedProjectsProvider } from '@/contexts/AdminAssignedProjectsContext'
import { AppNavBadgesProvider } from '@/contexts/AppNavBadgesContext'
import { queryClient } from './queryClient'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AdminAssignedProjectsProvider>
                <AppNavBadgesProvider>
                    {children}
                </AppNavBadgesProvider>
            </AdminAssignedProjectsProvider>
            <Toaster richColors />
        </QueryClientProvider>
    )
}
