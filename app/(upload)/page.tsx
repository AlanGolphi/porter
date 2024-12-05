import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import UploadedTable from './components/uploaded-table'
import { Loading } from './components/uploaded-table/loading'

const UploadSection = dynamic(() => import('./components/upload-section'), {
  loading: () => <Skeleton className="w-full basis-1/3 rounded-2xl bg-white lg:h-full" />,
})

export default async function UploadPage({ searchParams }: { searchParams: SearchParams }) {
  const search = await searchParams
  const page = Number(search.page) || 1
  return (
    <section className="flex w-full flex-col items-center justify-start gap-4 lg:flex-row">
      <UploadSection />
      <Suspense fallback={<Loading />}>
        <UploadedTable page={page} />
      </Suspense>
    </section>
  )
}

type SearchParams = Promise<{ [key: string]: string } & { page?: string }>
