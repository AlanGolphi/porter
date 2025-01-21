import { MetadataRoute } from 'next'

const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
if (!NEXT_PUBLIC_SITE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL environment variable is not defined')
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: NEXT_PUBLIC_SITE_URL!,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${NEXT_PUBLIC_SITE_URL}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${NEXT_PUBLIC_SITE_URL}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
