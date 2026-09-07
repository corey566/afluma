import Link from 'next/link'
import { getGlobal } from '@/lib/content'

export async function Header({ draft = false }: { draft?: boolean }) {
  let header: any = null
  try { header = await getGlobal('header', draft) } catch {}
  const items = header?.items?.length ? header.items : [
    { label: 'Platform', href: '/products' },
    { label: 'Services', href: '/services' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Industries', href: '/industries' },
    { label: 'Resources', href: '/insights' },
    { label: 'Company', href: '/about' },
  ]
  return <header className="afp-site-header">
    <div className="afp-nav-shell">
      <Link className="afp-brand" href="/" aria-label="Afluma home"><img src="/assets/brand/afluma-logo.png" alt="Afluma" /></Link>
      <nav className="afp-nav-links" aria-label="Primary navigation">{items.map((item: any) => <Link key={`${item.href}-${item.label}`} href={item.href}>{item.label}<span aria-hidden="true">⌄</span></Link>)}</nav>
      <div className="afp-nav-actions"><Link className="afp-signin" href="/admin">Sign in</Link><Link className="afp-nav-cta" href={header?.cta?.href || '/start-project'}>{header?.cta?.label || 'Start a project'} <span>→</span></Link></div>
    </div>
  </header>
}
