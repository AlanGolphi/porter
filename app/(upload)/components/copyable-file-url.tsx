'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { truncateFilename } from '@/lib/utils'
import { Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { toast } from 'sonner'

interface CopyableFileUrlProps {
  fileSize: bigint
  url: string
  maxLength?: number
}

export function CopyableFileUrl({ url, fileSize, maxLength = 20 }: CopyableFileUrlProps) {
  const t = useTranslations('UploadPage.Copy')
  const urlObject = new URL(url)
  const renderUrl = urlObject.pathname.split('/').pop() || ''

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

  if (!renderUrl) return null

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger>
          <div
            className="flex items-center justify-center text-center"
            title={`size: ${formatFileSize(fileSize)}`}
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault()
                clickToCopy(url)
              }}
              className="gap-1 text-nowrap text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-500"
            >
              {truncateFilename(renderUrl, maxLength)}
            </a>
          </div>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-1">
          <Copy className="h-4 w-4 text-white dark:text-black" />
          <p>{t('ClickToCopyUrl')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
