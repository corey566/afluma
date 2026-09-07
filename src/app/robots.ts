import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/site/seo'

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/afluma-command'] }, sitemap: absoluteUrl('/sitemap.xml') }
}
