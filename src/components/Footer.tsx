import Link from 'next/link'
import { getGlobal } from '@/lib/content'

export async function Footer({ draft = false }: { draft?: boolean }) {
  let footer: any = null
  try { footer = await getGlobal('footer', draft) } catch {}
  const columns = footer?.columns?.length ? footer.columns : [
    { heading: 'Platform', links: [{ label: 'Products', href: '/products' }, { label: 'Afluma Commerce', href: '/products/afluma-commerce' }, { label: 'SerenOps', href: '/products/serenops' }, { label: 'Security', href: '/security' }] },
    { heading: 'Services', links: [{ label: 'Custom Software', href: '/services/custom-software-development' }, { label: 'AI & Automation', href: '/services/ai-automation' }, { label: 'Managed Operations', href: '/services/managed-business-operations' }, { label: 'Data & Analytics', href: '/services/data-analytics-reporting' }] },
    { heading: 'Resources', links: [{ label: 'Insights', href: '/insights' }, { label: 'Work', href: '/work' }, { label: 'Quality', href: '/quality-engineering' }, { label: 'Responsible AI', href: '/responsible-ai' }] },
    { heading: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Leadership', href: '/about/leadership' }, { label: 'Careers', href: '/careers' }, { label: 'Contact', href: '/contact' }] },
  ]
  return <footer className="afp-site-footer"><div className="afp-footer-shell"><div className="afp-footer-brand"><img src="/assets/brand/afluma-logo.png" alt="Afluma"/><p>{footer?.description || 'Afluma designs, builds and operates intelligent digital systems for modern businesses.'}</p><span>Build. Automate. Operate. Grow.</span></div>{columns.map((column:any)=><div className="afp-footer-column" key={column.heading}><h3>{column.heading}</h3>{column.links?.map((link:any)=><Link href={link.href} key={`${column.heading}-${link.href}`}>{link.label}</Link>)}</div>)}<div className="afp-footer-news"><h3>Stay updated</h3><p>Useful research, product updates and operating perspectives.</p><form><input type="email" placeholder="Enter your email" aria-label="Email address"/><button type="button" aria-label="Subscribe">→</button></form></div></div><div className="afp-footer-bottom"><span>© {new Date().getFullYear()} Afluma. All rights reserved.</span><span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link></span></div></footer>
}
