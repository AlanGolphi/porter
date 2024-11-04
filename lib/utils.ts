import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentDateTag() {
  return new Date().toISOString().replace(/-/g, '').split('T')[0].slice(-6)
}
