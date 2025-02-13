'use client'

import { Button } from '@/components/ui/button'
import { deleteFileFromDb } from '@/lib/db/queries'
import { truncateFilename } from '@/lib/utils'
import { UploadedFile } from '@prisma/client'
import { FileText, FileVideo, Image, QrCode, Trash2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { CopyableFileUrl } from '../copyable-file-url'

const QrCodePopover = dynamic(() => import('../qrcode-popover').then((mod) => mod.QRCodePopover), {
  loading: () => (
    <Button variant="outline" className="border-none" aria-label="QR Code" size="icon">
      <QrCode className="h-6 w-6" />
    </Button>
  ),
})

interface UploadedFileRowProps {
  file: UploadedFile
}

export function UploadedFileRow({ file }: UploadedFileRowProps) {
  const getIcon = useCallback((mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-6 w-6" />
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="h-6 w-6" />
    } else {
      return <FileText className="h-6 w-6" />
    }
  }, [])

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
      className="flex h-14 w-full justify-between border-b p-2 last:border-none hover:bg-card-mud/70"
    >
      <div className="hidden items-center justify-center sm:flex">{getIcon(file.mimeType)}</div>
      <div className="flex basis-1/4 items-center justify-center text-nowrap" title={file.filename}>
        {truncateFilename(file.filename)}
      </div>
      <CopyableFileUrl url={file.url} fileSize={file.size} />
      <div className="flex basis-1/6 items-center justify-center gap-2 text-right">
        <QrCodePopover str={file.url} />
        <Button variant="destructive" size="sm" aria-label="Delete" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-white" />
        </Button>
      </div>
    </article>
  )
}
