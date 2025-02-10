import { getUser, getUserUploadedFiles } from '@/lib/db/queries'
import { UploadedFile } from '@prisma/client'
import { PackageOpen } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { UploadedFileRowLoading } from './loading'
import { TableHeader } from './table-header'

const UploadedFileRow = dynamic(
  () => import('./uploaded-file-row').then((mod) => mod.UploadedFileRow),
  {
    loading: () => <UploadedFileRowLoading />,
  },
)

export default async function UploadedTable({ page }: { page: number }) {
  const t = await getTranslations('UploadPage')
  const user = await getUser()
  if (!user) {
    redirect('/sign-in')
  }
  const files: UploadedFile[] = await getUserUploadedFiles(page, 10)

  return (
    <div className="flex w-full basis-2/3 flex-col rounded-2xl bg-card-mud p-4 lg:h-full lg:w-auto lg:min-w-0">
      <TableHeader />
      {files.length > 0 ? (
        <div className="flex w-full basis-2/3 flex-col items-center justify-start">
          {files.map((file) => (
            <UploadedFileRow key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="flex w-full basis-2/3 flex-col items-center justify-center">
          <PackageOpen className="h-12 w-12" strokeWidth={1} />
          <span className="text-center">{t('Upload.NoFilesUploaded')}</span>
        </div>
      )}
    </div>
  )
}
