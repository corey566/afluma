import AflumaHeaderClient from './AflumaHeaderClient'
import Link from 'next/link'

export function AflumaHeader() {
  return <AflumaHeaderClient />
}

export function AflumaFooter() {
  return <footer className="a7-footer">
    <div className="a7-shell">
      <div className="a7-footer__grid">
        <div className="a7-footer__brand">
          <img src="/assets/brand/afluma-logo.png" alt="Afluma" />
          <p>Persistent AI coworkers, AgenticOS and AI-native products designed to perform useful work under human governance.</p>
        </div>
        <FooterColumn title="Platform" links={[["AgenticOS","/platform/agenticos/"],["Platform overview","/platform/"],["Trust & governance","/trust/"]]}/>
        <FooterColumn title="Workforce" links={[["Digital workforce","/workforce/"],["Afluma runs on Afluma","/proof/afluma-runs-on-afluma/"],["Research","/research/"]]}/>
        <FooterColumn title="Products" links={[["Afluma Commerce","/products/afluma-commerce/"],["SerenOps","/products/serenops/"],["Products overview","/products/"]]}/>
        <FooterColumn title="Company" links={[["Company","/company/"],["Proof","/proof/"],["Careers","/careers/"],["Contact","/contact/"]]}/>
      </div>
      <div className="a7-footer__bottom"><span>© 2026 Afluma. All rights reserved.</span><span><Link href="/privacy/">Privacy</Link><Link href="/terms/">Terms</Link><Link href="/cookies/">Cookies</Link></span></div>
    </div>
  </footer>
}

function FooterColumn({title,links}:{title:string,links:[string,string][]}) {
  return <div className="a7-footer__column"><h3>{title}</h3>{links.map(([label,href]) => <Link href={href} key={href}>{label}</Link>)}</div>
}
