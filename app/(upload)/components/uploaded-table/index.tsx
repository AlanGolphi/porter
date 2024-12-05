import { db } from '@/lib/db'
import { UploadedFile } from '@prisma/client'
import dynamic from 'next/dynamic'
import { UploadedFileRowLoading } from './loading'

const UploadedFileRow = dynamic(
  () => import('./uploaded-file-row').then((mod) => mod.UploadedFileRow),
  {
    loading: () => <UploadedFileRowLoading />,
  },
)

export default async function UploadedTable({ page }: { page: number }) {
  const files: UploadedFile[] = await db.uploadedFile.findMany({
    take: 10,
    skip: (page - 1) * 10,
  })

  return (
    <div className="flex w-full basis-2/3 flex-col rounded-2xl bg-white p-4 lg:h-full">
      <header className="flex w-full border-b p-2">
        <nav className="flex w-full justify-between">
          <span>Filename</span>
          <span>URL</span>
          <span>Action</span>
        </nav>
      </header>
      <div className="flex w-full basis-2/3 flex-col items-center justify-start gap-2">
        {files.map((file) => (
          <UploadedFileRow key={file.id} file={file} />
        ))}
      </div>
    </div>
  )
}
