'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { QrCode } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import * as QRCode from 'qrcode'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export function QRCodePopover({ str }: { str: string }) {
  const t = useTranslations('UploadPage')
  const [open, setOpen] = useState(false)
  const [dataUrl, setDataUrl] = useState<string>('')
  const [error, setError] = useState<boolean>(false)

  const generateQrCode = useCallback(async () => {
    if (!str || open || dataUrl) return
    QRCode.toDataURL(str, (err, url) => {
      if (err) {
        setError(true)
      } else {
        setDataUrl(url)
        setError(false)
      }
    })
  }, [dataUrl, open, str])

  const copyToClipboard = useCallback(async () => {
    if (!dataUrl) return
    try {
      const response = await fetch(dataUrl)
      const blob = await response.blob()

      const clipboardItem = new ClipboardItem({ [blob.type]: blob })
      await navigator.clipboard.write([clipboardItem])
      toast.success(t('Copy.CopyQrCodeSuccess'))
    } catch {
      toast.error(t('Copy.CopyQrCodeFailed'))
    }
  }, [dataUrl, t])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          aria-label={t('AriaLabel.QrCode')}
          className="border-none"
          onClick={generateQrCode}
        >
          <QrCode className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex h-auto w-48 flex-col items-center justify-center p-2">
        {error ? (
          <QrCode className="h-44 w-44 text-red-300" />
        ) : dataUrl ? (
          <Image src={dataUrl} alt="QR Code" width={176} height={176} />
        ) : (
          <QrCode className="h-44 w-44 animate-pulse" />
        )}
        <button
          onClick={copyToClipboard}
          disabled={error || !dataUrl}
          aria-label={t('Copy.CopyQrCode')}
          className={`text-sm text-blue-500 hover:text-blue-400 hover:underline disabled:cursor-not-allowed disabled:text-blue-300`}
        >
          {t('Copy.CopyQrCode')}
        </button>
      </PopoverContent>
    </Popover>
  )
}
