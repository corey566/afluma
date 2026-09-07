'use client'

import { useEffect } from 'react'

const replacements: Array<[string, string]> = [
  ['Ã‚Â·', '·'],
  ['Ã‚Â©', '©'],
  ['Â©', '©'],
  ['Ã‚Â', ''],
]

function sanitizeText(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()

  while (node) {
    const value = node.nodeValue
    if (value) {
      let next = value
      for (const [broken, fixed] of replacements) next = next.replaceAll(broken, fixed)
      if (next !== value) node.nodeValue = next
    }
    node = walker.nextNode()
  }
}

function guardAskAfluma() {
  const button = document.querySelector<HTMLButtonElement>('button[aria-label="Ask Afluma"]')
  if (!button) return

  button.disabled = true
  button.setAttribute('aria-disabled', 'true')
  button.setAttribute('title', 'Ask Afluma is being prepared for launch')

  const textSpans = button.querySelectorAll('span')
  const label = textSpans[textSpans.length - 1]
  if (label?.textContent?.trim() === 'Ask Afluma') label.textContent = 'Ask Afluma · soon'
}

export default function HeaderRuntimeGuard() {
  useEffect(() => {
    const apply = () => {
      guardAskAfluma()
      sanitizeText(document.body)
    }

    apply()

    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return null
}
