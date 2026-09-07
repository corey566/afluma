const srcOf = (media: any, fallback?: string) => typeof media === 'object' && media?.url ? media.url : fallback || ''
export function MediaAsset({ media, fallback, alt = '', className = '' }: { media?: any; fallback?: string; alt?: string; className?: string }) {
  const src = srcOf(media, fallback)
  if (!src) return null
  const mime = typeof media === 'object' ? String(media?.mimeType || '') : ''
  if (mime.startsWith('video/') || /\.mp4($|\?)/i.test(src)) return <video className={className} src={src} autoPlay muted loop playsInline preload="metadata" aria-label={alt || undefined} />
  return <img className={className} src={src} alt={alt} loading="lazy" />
}
