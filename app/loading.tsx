import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  // 创建一个重复的骨架屏数组，用于网格布局
  const skeletons = Array.from({ length: 16 }, (_, i) => (
    <div key={i} className="p-4">
      <Skeleton className="h-[200px] w-full rounded-xl" />
    </div>
  ))

  return (
    <div className="min-h-screen w-full p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {skeletons}
      </div>
    </div>
  )
}
