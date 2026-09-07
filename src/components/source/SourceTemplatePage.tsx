import fs from 'node:fs/promises'
import path from 'node:path'
import Script from 'next/script'
import { ExactSourceMarkup } from './ExactSourceMarkup'
import { SourceSlotBinder } from './SourceSlotBinder'

type AssignedAsset = { publicPath?: string | null; status?: string; kind?: string; assignedSlot?: string }
type Binding = { selector: string; mode: 'text' | 'html' | 'image-src' | 'video-src' | 'href' | 'class'; value: string }
type SourceTemplatePageProps = {
  resolvedPath: string
  family: string
  slots?: Record<string, string | number | boolean | null | undefined>
  assignedAssets?: AssignedAsset[]
  bindings?: Binding[]
}

const replaceMedia = (markup: string, assets: AssignedAsset[]) => {
  const usable = assets.filter(asset => asset.publicPath && asset.status !== 'excluded')
  if (!usable.length) return markup
  let cursor = 0
  return markup.replace(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'][^>]*>)/gi, (match, start, original, end) => {
    if (/logo|favicon|icon|badge/i.test(original)) return match
    const asset = usable[cursor++ % usable.length]
    return asset?.publicPath ? `${start}${asset.publicPath}${end}` : match
  })
}

export async function SourceTemplatePage({ resolvedPath, family, slots, assignedAssets = [], bindings = [] }: SourceTemplatePageProps) {
  const absolute = path.join(process.cwd(), resolvedPath)
  const source = await fs.readFile(absolute, 'utf8')
  const html = replaceMedia(source, assignedAssets)
  const rootId = `source-${family}-${Buffer.from(resolvedPath).toString('base64url').slice(0, 14)}`
  return <>
    <link rel="stylesheet" href={`/nexsas-runtime/${family}/assets/main.css`} />
    <div id={rootId}><ExactSourceMarkup className={`nexsas-source-page source-family-${family}`} html={html} slots={slots} /></div>
    <SourceSlotBinder rootId={rootId} bindings={bindings} />
    <Script src={`/nexsas-runtime/${family}/assets/main.js`} strategy="afterInteractive" />
  </>
}
