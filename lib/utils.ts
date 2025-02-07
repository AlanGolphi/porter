import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentDateTag() {
  return new Date().toISOString().replace(/-/g, '').split('T')[0].slice(-6)
}

/**
 * Calculate the required TTL for a file based on its size.
 * @param fileSize - The size of the file in bytes.
 * @returns The required TTL in seconds.
 * @see https://developers.cloudflare.com/api/operations/r2-create-temp-access-credentials
 */
export const calculateRequiredTTL = (fileSize: number): number => {
  const estimatedSeconds = Math.min(Math.ceil(fileSize / (1024 * 1024)) + 30, 604800)
  return Math.min(Math.max(estimatedSeconds, 900), 3600)
}

export function getLocaleFromCookie(cookie: string) {
  if (!cookie) return 'en'
  const splitCookie = cookie.split(';')
  const localeCookie = splitCookie.find((c) => c.includes('locale'))
  if (!localeCookie) return 'en'
  const locale = localeCookie.split('=')[1]
  return locale || 'en'
}

export const truncateFilename = (filename: string, maxLength: number = 20): string => {
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
}
