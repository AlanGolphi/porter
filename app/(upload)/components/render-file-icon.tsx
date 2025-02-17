'use client'

import { FileText, FileVideo, Image } from 'lucide-react'

export default function RenderFileIcon({
  mimeType,
  iconSize = 6,
}: {
  mimeType: string
  iconSize?: number
}) {
  const fileSizeClasses = `h-${iconSize} w-${iconSize}`

  if (mimeType.startsWith('image/')) {
    return <Image className={fileSizeClasses} />
  } else if (mimeType.startsWith('video/')) {
    return <FileVideo className={fileSizeClasses} />
  } else {
    return <FileText className={fileSizeClasses} />
  }
}
