import { useQuery } from '@tanstack/react-query'

export function useHello() {
  return useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const res = await fetch('/api/hello')
      return res.json()
    }
  })
}
