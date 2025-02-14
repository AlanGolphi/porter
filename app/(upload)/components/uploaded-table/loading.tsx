import { Skeleton } from '@/components/ui/skeleton'
import { TableHeader } from './table-header'

export function UploadedFileRowLoading() {
  return (
    <div className="flex w-full items-center justify-between rounded-2xl bg-card-mud px-2 py-4 @container">
      <div className="hidden items-center justify-center sm:flex">
        <Skeleton className="h-6 w-6 rounded-lg" />
      </div>
      <div className="flex flex-col items-start @sm:w-full @sm:flex-row @sm:items-center @sm:justify-evenly">
        <div className="flex items-center justify-center">
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="flex items-center justify-center">
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
      <div className="flex basis-1/6 items-center justify-center gap-2 text-right">
        <Skeleton className="h-6 w-6 rounded-lg" />
        <Skeleton className="h-8 w-10 rounded-lg" />
      </div>
    </div>
  )
}

export function Loading() {
  return (
    <div className="flex w-full basis-2/3 flex-col rounded-2xl bg-card-mud p-4 lg:h-full">
      <TableHeader />
      <div className="flex w-full basis-2/3 flex-col items-center justify-start">
        {[...Array(6)].map((_, i) => (
          <UploadedFileRowLoading key={i} />
        ))}
      </div>
    </div>
  )
}
