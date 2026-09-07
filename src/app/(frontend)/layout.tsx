import { siteOrigin } from '@/site/seo'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import '@/site/site.css'
import { Header } from '@/site/Header'
import { Footer } from '@/site/Footer'
import AskAflumaShell from '@/afluma-site/AskAflumaShell'

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: 'Afluma — Intelligence in motion', template: '%s | Afluma' },
  description: 'Afluma is building an AI workforce connected by AgenticOS, with people in command.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main" tabIndex={-1}>{children}</main><Footer /><AskAflumaShell /></body></html>
}


