'use client'

import { useEffect } from 'react'

type Binding = {
  selector: string
  mode: 'text' | 'html' | 'image-src' | 'video-src' | 'href' | 'class'
  value: string
}

export function SourceSlotBinder({ rootId, bindings }: { rootId: string; bindings: Binding[] }) {
  useEffect(() => {
    const root = document.getElementById(rootId)
    if (!root) return
    for (const binding of bindings) {
      root.querySelectorAll<HTMLElement>(binding.selector).forEach((node) => {
        if (binding.mode === 'text') node.textContent = binding.value
        else if (binding.mode === 'html') node.innerHTML = binding.value
        else if (binding.mode === 'href' && node instanceof HTMLAnchorElement) node.href = binding.value
        else if (binding.mode === 'image-src' && node instanceof HTMLImageElement) node.src = binding.value
        else if (binding.mode === 'video-src' && node instanceof HTMLVideoElement) { node.src = binding.value; node.load() }
        else if (binding.mode === 'class') node.className = binding.value
      })
    }
  }, [rootId, bindings])
  return null
}
