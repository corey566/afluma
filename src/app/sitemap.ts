import type { MetadataRoute } from 'next'
import { publicRoutes, absoluteUrl } from '@/site/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes().map((slug) => ({ url: absoluteUrl(`/${slug}`) }))
}
