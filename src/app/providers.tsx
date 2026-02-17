import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import '@/app/i18n' // inicializa i18n
import { queryClient } from './queryClient'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster richColors />
        </QueryClientProvider>
    )
}
