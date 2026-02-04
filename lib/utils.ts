import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = text.match(urlRegex)
  return matches ? [...new Set(matches)] : []
}

export function getSourceFromUrl(url: string): 'TIKTOK' | 'INSTAGRAM' | 'OTHER' {
  const hostname = new URL(url).hostname.toLowerCase()
  if (hostname.includes('tiktok.com')) return 'TIKTOK'
  if (hostname.includes('instagram.com')) return 'INSTAGRAM'
  return 'OTHER'
}

