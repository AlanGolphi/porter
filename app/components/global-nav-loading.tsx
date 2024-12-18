import { Skeleton } from '@/components/ui/skeleton'

export default function GlobalNavLoading() {
  return (
    <Skeleton className="fixed left-4 top-4 z-50 h-16 w-[calc(100%-2rem)] min-w-72 rounded-2xl bg-card-mud px-4 py-2 md:h-[calc(100dvh-2rem)] md:w-20 md:min-w-0" />
  )
}
