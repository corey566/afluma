'use client'

import Image from 'next/image'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const links = [
  ['Workforce', '/workforce'], ['AgenticOS', '/platform/agenticos'],
  ['Products', '/products'], ['Services', '/services'], ['Company', '/about'],
] as const

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus() }
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open])
  return <header className="site-header">
    <div className="shell header-inner">
      <Link href="/" aria-label="Afluma home" onClick={() => setOpen(false)} className="brand"><Image unoptimized src="/assets/brand/afluma-wordmark.webp" width={392} height={46} alt="Afluma" /></Link>
      <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'} <span aria-hidden="true">{open ? '−' : '+'}</span></button>
      <nav id="site-navigation" aria-label="Main navigation" className={open ? 'navigation is-open' : 'navigation'}>
        {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/contact" className="button small" onClick={() => setOpen(false)}>Let’s talk <span aria-hidden="true">↗</span></Link>
      </nav>
    </div>
  </header>
}



