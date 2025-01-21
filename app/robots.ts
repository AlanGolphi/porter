import type { MetadataRoute } from 'next'

const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
if (!NEXT_PUBLIC_SITE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL environment variable is not defined')
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '*',
    },
    sitemap: `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    host: NEXT_PUBLIC_SITE_URL,
  }
}
