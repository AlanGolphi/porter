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
