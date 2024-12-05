import { Skeleton } from '@/components/ui/skeleton'

export function UploadedFileRowLoading() {
  return (
    <div className="flex w-full items-center justify-between rounded-2xl bg-white p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <Skeleton className="h-8 w-8 rounded-xl" />
      <Skeleton className="h-8 w-16 rounded-xl" />
    </div>
  )
}

export function Loading() {
  return (
    <div className="flex w-full basis-2/3 flex-col items-center justify-between">
      {[...Array(6)].map((_, i) => (
        <UploadedFileRowLoading key={i} />
      ))}
    </div>
  )
}
