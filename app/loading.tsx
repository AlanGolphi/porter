import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-start gap-4 pt-8">
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-24 w-1/2" />
        <Skeleton className="h-24 w-1/2" />
      </div>
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-24 w-1/2" />
        <Skeleton className="h-24 w-1/2" />
      </div>
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-24 w-1/2" />
        <Skeleton className="h-24 w-1/2" />
      </div>
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-24 w-1/2" />
        <Skeleton className="h-24 w-1/2" />
      </div>
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-24 w-1/2" />
        <Skeleton className="h-24 w-1/2" />
      </div>
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-24 w-1/2" />
        <Skeleton className="h-24 w-1/2" />
      </div>
    </div>
  )
}
