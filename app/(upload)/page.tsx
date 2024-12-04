import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

const UploadSection = dynamic(() => import('./components/upload-section'), {
  loading: () => <Skeleton className="h-24 w-full rounded-2xl bg-zinc-50" />,
})

export default async function Upload() {
  return (
    <section className="w-full pt-4">
      <UploadSection />
    </section>
  )
}
