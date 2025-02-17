'use client'

import { Button } from '@/components/ui/button'
import { deleteFileFromDb } from '@/lib/db/queries'
import { truncateFilename } from '@/lib/utils'
import { UploadedFile } from '@prisma/client'
import { QrCode, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { CopyableFileUrl } from '../copyable-file-url'
import RenderFileIcon from '../render-file-icon'

const QrCodePopover = dynamic(() => import('../qrcode-popover').then((mod) => mod.QRCodePopover), {
  loading: () => (
    <Button variant="outline" className="border-none" size="icon">
      <QrCode className="h-6 w-6" />
    </Button>
  ),
})

interface UploadedFileRowProps {
  file: UploadedFile
}

export function UploadedFileRow({ file }: UploadedFileRowProps) {
  const t = useTranslations('UploadPage.AriaLabel')

  const handleDelete = async () => {
    const deleteResult = await deleteFileFromDb(file.id)
    if (deleteResult.success) {
      toast.success(deleteResult.data as string)
    } else {
      toast.error(deleteResult.error)
    }
  }

  return (
    <article
      key={file.id}
      className="flex w-full justify-between border-b p-2 @container last:border-none hover:bg-card-mud/70"
    >
      <div className="hidden items-center justify-center sm:flex">
        <RenderFileIcon mimeType={file.mimeType} />
      </div>
      <div className="flex flex-col items-start @sm:w-full @sm:flex-row @sm:items-center @sm:justify-evenly">
        <div className="flex items-center justify-center text-nowrap" title={file.filename}>
          {truncateFilename(file.filename)}
        </div>
        <CopyableFileUrl url={file.url} fileSize={file.size} />
      </div>
      <div className="flex basis-1/6 items-center justify-center gap-2 text-right">
        <QrCodePopover str={file.url} />
        <Button variant="destructive" size="sm" aria-label={t('Delete')} onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-white" />
        </Button>
      </div>
    </article>
  )
}
