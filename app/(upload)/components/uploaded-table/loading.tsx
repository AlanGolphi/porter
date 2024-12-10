import { Skeleton } from '@/components/ui/skeleton'

export function UploadedFileRowLoading() {
  return (
    <div className="flex h-14 w-full items-center justify-between rounded-2xl bg-white px-2 py-4">
      <div className="flex basis-1/6 items-center justify-center">
        <Skeleton className="h-6 w-6 rounded-lg" />
      </div>
      <div className="flex basis-1/4 items-center justify-center truncate">
        <Skeleton className="h-6 w-full" />
      </div>
      <div className="flex basis-1/4 items-center justify-center text-center">
        <Skeleton className="h-6 w-full" />
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
    <div className="flex w-full basis-2/3 flex-col rounded-2xl bg-white p-4 lg:h-full">
      <header className="flex w-full border-b p-2">
        <nav className="flex w-full justify-between">
          <span className="basis-1/6 text-center">Type</span>
          <span className="basis-1/4 text-center">Filename</span>
          <span className="basis-1/4 text-center">URL</span>
          <span className="basis-1/6 text-center">Action</span>
        </nav>
      </header>
      <div className="flex w-full basis-2/3 flex-col items-center justify-start">
        {[...Array(6)].map((_, i) => (
          <UploadedFileRowLoading key={i} />
        ))}
      </div>
    </div>
  )
}
