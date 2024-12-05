'use client'

import { Button } from '@/components/ui/button'
import { UploadedFile } from '@prisma/client'
import { FileText, FileVideo, Image, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'

interface UploadedFileRowProps {
  file: UploadedFile
}

export function UploadedFileRow({ file }: UploadedFileRowProps) {
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

  const clickToCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }, [])

  const getIcon = useCallback((mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-6 w-6" />
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="h-6 w-6" />
    } else {
      return <FileText className="h-6 w-6" />
    }
  }, [])

  return (
    <article
      key={file.id}
      className="flex h-14 w-full justify-between border-b p-2 last:border-none hover:bg-gray-50"
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
          className="truncate text-nowrap text-blue-500 hover:text-blue-700"
        >
          {truncateUrl(file.url)}
        </a>
      </div>
      <div className="flex basis-1/6 items-center justify-center text-right">
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 text-white" />
        </Button>
      </div>
    </article>
  )
}
