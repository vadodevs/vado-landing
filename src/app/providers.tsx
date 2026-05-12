import { lazy, Suspense } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { queryClient } from './queryClient'

const Toaster = lazy(async () => {
  const { Toaster: T } = await import('sonner')
  return { default: T }
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <Suspense fallback={null}>
          <Toaster richColors />
        </Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
