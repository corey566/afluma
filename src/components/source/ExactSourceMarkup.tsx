import type { CSSProperties } from 'react'

type SlotValue = string | number | boolean | null | undefined

type ExactSourceMarkupProps = {
  html: string
  slots?: Record<string, SlotValue>
  className?: string
  style?: CSSProperties
}

const replaceSlots = (source: string, slots: Record<string, SlotValue>) => {
  let output = source
  for (const [key, value] of Object.entries(slots)) {
    const safe = value == null ? '' : String(value)
    output = output.replaceAll(`{{${key}}}`, safe).replaceAll(`{=$${key}}`, safe)
  }
  return output.replace(/\{=\$[a-zA-Z0-9_-]+\}/g, '')
}

/**
 * Renders trusted markup compiled directly from the user-supplied NextSaaS source.
 * The original class names, data attributes, section order and media placement remain intact.
 * Content slots are patched from Payload data before rendering.
 */
export function ExactSourceMarkup({ html, slots = {}, className, style }: ExactSourceMarkupProps) {
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: replaceSlots(html, slots) }} />
}
