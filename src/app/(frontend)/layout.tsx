import type { ReactNode } from 'react'
import './globals.css'

import AflumaLoader from '@/afluma-site/AflumaLoader'
import { AflumaFooter, AflumaHeader } from '@/afluma-site/SiteChrome'
import AskAflumaShell from '@/afluma-site/AskAflumaShell'

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AflumaLoader />

        <div className="a7-site">
          <AflumaHeader />

          <main>{children}</main>

          <AflumaFooter />
          <AskAflumaShell />
        </div>
      </body>
    </html>
  )
}