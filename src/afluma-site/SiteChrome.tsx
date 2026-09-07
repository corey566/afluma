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
          <p>Building a human-governed AI workforce, AgenticOS and focused AI-native products for real company work.</p>
        </div>
        <FooterColumn title="System" links={[["AI Workforce","/workforce/"],["AgenticOS","/platform/agenticos/"],["Afluma runs on Afluma","/proof/afluma-runs-on-afluma/"]]}/>
        <FooterColumn title="Products" links={[["SerenOps","/products/serenops/"],["Afluma Commerce","/products/afluma-commerce/"],["Commander OS","/products/commander-os/"]]}/>
        <FooterColumn title="Research & trust" links={[["Research","/research/"],["Trust","/trust/"],["Responsible AI","/responsible-ai/"],["Security","/security/"]]}/>
        <FooterColumn title="Company" links={[["About Afluma","/company/"],["Careers","/careers/"],["Contact","/contact/"]]}/>
      </div>
      <div className="a7-footer__bottom"><span>© 2026 Afluma. All rights reserved.</span><span><Link href="/privacy/">Privacy</Link><Link href="/terms/">Terms</Link><Link href="/cookies/">Cookies</Link></span></div>
    </div>
  </footer>
}

function FooterColumn({title,links}:{title:string,links:[string,string][]}) {
  return <div className="a7-footer__column"><h3>{title}</h3>{links.map(([label,href]) => <Link href={href} key={href}>{label}</Link>)}</div>
}
