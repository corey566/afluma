import { Action } from '@/site/SitePage'

export default function NotFound() {
  return <section className="shell not-found"><span className="eyebrow">404 / Page not found</span><h1>Let’s find a useful direction.</h1><p>This page isn’t available. Explore the workforce, browse our products or return to Afluma.</p><div className="actions"><Action href="/">Back to Afluma</Action><Action href="/products" secondary>Explore products</Action></div></section>
}

