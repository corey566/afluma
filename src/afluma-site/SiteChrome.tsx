import AflumaHeaderClient from './AflumaHeaderClient'
import AflumaNavigation from './AflumaNavigation'
import Link from 'next/link'

const Chevron = () => <svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.25"/></svg>

export function AflumaHeader() {
  return <AflumaHeaderClient />
}
export function AflumaFooter() {
  return <footer className="a7-footer">
    <div className="a7-shell">
      <div className="a7-footer__grid">
        <div className="a7-footer__brand">
          <img src="/assets/brand/afluma-logo.png" alt="Afluma" />
          <p>Intelligent digital systems, products and operations designed to make modern businesses work better.</p>
        </div>
        <FooterColumn title="Services" links={[["Custom software","/services/custom-software-development/"],["AI & automation","/services/ai-automation/"],["Managed operations","/services/managed-business-operations/"],["Data & analytics","/services/data-analytics-reporting/"]]}/>
        <FooterColumn title="Solutions" links={[["Solutions hub","/solutions/"],["Industries","/industries/"],["Afluma Commerce","/products/afluma-commerce/"],["SerenOps","/products/serenops/"]]}/>
        <FooterColumn title="Resources" links={[["Insights","/insights/"],["Work","/work/"],["Security","/security/"],["Responsible AI","/responsible-ai/"]]}/>
        <FooterColumn title="Company" links={[["About","/about/"],["Careers","/careers/"],["Partners","/partners/"],["Contact","/contact/"]]}/>
      </div>
      <div className="a7-footer__bottom"><span>Â© 2026 Afluma. All rights reserved.</span><span><Link href="/privacy/">Privacy</Link><Link href="/terms/">Terms</Link><Link href="/cookies/">Cookies</Link></span></div>
    </div>
  </footer>
}

function FooterColumn({title,links}:{title:string,links:[string,string][]}) {
  return <div className="a7-footer__column"><h3>{title}</h3>{links.map(([label,href]) => <Link href={href} key={href}>{label}</Link>)}</div>
}
