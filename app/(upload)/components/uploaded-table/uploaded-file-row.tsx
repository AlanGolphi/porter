'use client'

import { Button } from '@/components/ui/button'
import { deleteFileFromDb } from '@/lib/db/queries'
import { UploadedFile } from '@prisma/client'
import { FileText, FileVideo, Image, QrCode, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useCallback } from 'react'
import { toast } from 'sonner'

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
  const t = useTranslations('UploadPage.CopyResult')
  const truncateFilename = useCallback((filename: string, maxLength: number = 20): string => {
    if (filename.length <= maxLength) return filename

    const lastDotIndex = filename.lastIndexOf('.')
    if (lastDotIndex === -1) {
      const halfLength = Math.floor((maxLength - 3) / 2)
      return `${filename.slice(0, halfLength)}...${filename.slice(-halfLength)}`
    }

    const extension = filename.slice(lastDotIndex)
    const nameWithoutExt = filename.slice(0, lastDotIndex)
    const availableLength = maxLength - extension.length - 3 // 3 for the ellipsis

    if (availableLength <= 0) {
      return filename // If extension is too long, show full filename
    }

    const halfLength = Math.floor(availableLength / 2)
    return `${nameWithoutExt.slice(0, halfLength)}...${nameWithoutExt.slice(-halfLength)}${extension}`
  }, [])

  const formatFileSize = useCallback((bs: bigint): string => {
    const bytes = Number(bs)
    const KB = 1024
    const MB = KB * 1024
    const GB = MB * 1024
    const TB = GB * 1024

    if (bytes < KB) {
      return `${bytes} B`
    } else if (bytes < MB) {
      return `${(bytes / KB).toFixed(1)} KB`
    } else if (bytes < GB) {
      return `${(bytes / MB).toFixed(1)} MB`
    } else if (bytes < TB) {
      return `${(bytes / GB).toFixed(1)} GB`
    } else {
      return `${(bytes / TB).toFixed(1)} TB`
    }
  }, [])

  const truncateUrl = useCallback((url: string, maxLength: number = 20): string => {
    if (url.length <= maxLength) return url

    const start = url.substring(0, 10)
    const end = url.substring(url.length - 6)
    return `${start}...${end}`
  }, [])

  const clickToCopy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        toast.success(t('CopyUrlSuccess'))
      } catch {
        toast.error(t('CopyUrlFailed'))
      }
    },
    [t],
  )

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
      <div className="flex basis-1/6 items-center justify-center">{getIcon(file.mimeType)}</div>
      <div
        className="flex basis-1/4 items-center justify-center truncate text-nowrap"
        title={file.filename}
      >
        {truncateFilename(file.filename)}
      </div>
      <div
        className="flex basis-1/4 items-center justify-center text-center"
        title={`size: ${formatFileSize(file.size)}`}
      >
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault()
            clickToCopy(file.url)
          }}
          className="truncate text-nowrap text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-500"
        >
          {truncateUrl(file.url)}
        </a>
      </div>
      <div className="flex basis-1/6 items-center justify-center gap-2 text-right">
        <QrCodePopover str={file.url} />
        <Button variant="destructive" size="sm" aria-label="Delete" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-white" />
        </Button>
      </div>
    </article>
  )
}
