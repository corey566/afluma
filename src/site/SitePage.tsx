import Image from 'next/image'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ContactForm } from '@/afluma-site/ContactForm'
import { products, workforce, type SitePage as PageData, type EditorialSection } from './content'
import { services, industries, regions } from './catalogue'
import { WaitlistForm } from './WaitlistForm'
import { productDestination } from './seo'
import { reading } from './reading'
import { articles } from './articles'

export function Action({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link href={href} className={`button${secondary ? ' secondary' : ''}`}>{children}<span aria-hidden="true">↗</span></Link>
}

function Intro({ eyebrow, title, description }: Pick<PageData, 'eyebrow' | 'title' | 'description'>) {
  return <section className="page-intro shell"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lede">{description}</p></section>
}

export function CallToAction() {
  return <section className="cta-section"><div className="shell cta-inner"><div><p className="eyebrow">Start with the work</p><h2>What could your<br />business become?</h2><p>Bring the challenge. Let’s find the next useful step.</p></div><Action href="/contact">Talk to Afluma</Action></div></section>
}

export function Sections({ sections }: { sections: EditorialSection[] }) {
  return <div className="shell editorial-sections">{sections.map((section, index) => <section className="editorial-row" key={section.title}><span className="index">{String(index + 1).padStart(2, '0')}</span><h2>{section.title}</h2><div><p>{section.body}</p>{section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}</div></section>)}</div>
}

function Ecosystem({ compact = false }: { compact?: boolean }) {
  return <section className="section ecosystem"><div className="shell"><div className="section-heading"><div><p className="eyebrow">One connected ecosystem</p><h2>Intelligence at the core.<br />Purpose in every product.</h2></div><p>Different environments. A common direction: turn context into useful work, with human oversight throughout.</p></div>
    <Link className="platform-band" href="/platform/agenticos"><div className="platform-symbol" aria-hidden="true">A</div><div><span className="eyebrow">The central operating layer</span><h3>AgenticOS</h3><p>Identity. Knowledge. Coordination. Governance.</p></div><span className="circle-arrow" aria-hidden="true">↗</span></Link>
    <div className="product-grid">{products.map((product) => <Link href={`/products/${product.slug}`} key={product.slug} className={`product-card product-${product.slug}`}><div className="card-top"><span>{product.number} / {product.label}</span><span aria-hidden="true">↗</span></div><div className="product-graphic" aria-hidden="true"><i /><i /><i /></div><div><h3>{product.name}</h3><p>{product.description}</p></div><span className="card-link">Explore {product.name} <span aria-hidden="true">→</span></span></Link>)}</div>
    {!compact && <p className="caption">These pages describe Afluma’s product direction. Discuss availability, scope and integrations with us.</p>}
  </div></section>
}

function WorkforceList({ featured = false }: { featured?: boolean }) {
  const chosen = featured ? workforce.filter((agent) => ['Yara Halo', 'Kai Vector', 'Lumina'].includes(agent.name)) : workforce
  return <div className={featured ? 'agent-grid featured-agents' : 'agent-grid'}>{chosen.map((agent, index) => <Link className="agent-card" href={`/workforce/${agent.slug}`} key={agent.id}>
    <div className="agent-mark"><span>{agent.initials}</span><small>AI / {String(index + 1).padStart(2, '0')}</small></div><div className="agent-copy"><span className="eyebrow">AI teammate at Afluma</span><h3>{agent.name}</h3><p className="agent-role">{agent.role}</p><p>{agent.mission}</p><span className="card-link">Meet {agent.name.split(' ')[0]} <span aria-hidden="true">↗</span></span></div>
  </Link>)}</div>
}

function Workflow() {
  const steps = [
    ['Understand', 'Mei + Yara', 'Clarify the request and the business context.'],
    ['Shape', 'Aether + Amara', 'Define the approach and the experience.'],
    ['Build', 'Kai + Leila', 'Coordinate engineering and delivery.'],
    ['Review', 'People + specialists', 'Check the result and approve the next action.'],
  ]
  return <section className="section workflow-section"><div className="shell"><div className="section-heading"><div><p className="eyebrow">How the roles connect</p><h2>A handoff.<br />Not a dead end.</h2></div><p>An illustrative workflow: each role contributes a defined output, carries context forward and knows when to ask for a decision.</p></div><ol className="workflow">{steps.map(([title, names, body], index) => <li key={title}><span className="index">0{index + 1}</span><h3>{title}</h3><p className="workflow-names">{names}</p><p>{body}</p></li>)}</ol><div className="governance-line"><span aria-hidden="true">✦</span><p>Human judgment stays in the loop. Authority is defined by the task, not the persona.</p><Link href="/responsible-ai">Our principles ↗</Link></div></div></section>
}

function Home() {
  return <>
    <section className="home-hero"><div className="shell hero-grid"><div className="hero-copy"><p className="eyebrow">Afluma / Intelligence in motion</p><h1>A workforce<br />built from<br /><em>intelligence.</em></h1><p className="lede">Persistent AI teammates. One operating layer. A new way to connect the work of a company.</p><div className="actions"><Action href="/workforce">Meet the workforce</Action><Action href="/platform/agenticos" secondary>Explore AgenticOS</Action></div><p className="hero-note"><span aria-hidden="true">✦</span> Building toward autonomy. Governed by people.</p></div>
      <div className="hero-art"><div className="art-label"><span>AFLUMA / THE OPERATING MODEL</span><span>01 — ∞</span></div><Image src="/assets/brand/afluma-symbol-clean.webp" width={780} height={660} sizes="(max-width: 600px) 65vw, (max-width: 1100px) 40vw, 560px" alt="Afluma’s violet ribbon-A symbol" preload /><div className="art-caption"><span>Many responsibilities.<br /><strong>One shared intelligence.</strong></span><span className="circle-arrow" aria-hidden="true">↗</span></div></div>
    </div><div className="shell hero-bottom"><span>AI workforce</span><span>AgenticOS</span><span>SerenOps</span><span>Afluma Commerce</span><span>Commander OS</span></div></section>
    <section className="section company-thesis"><div className="shell thesis-grid"><p className="eyebrow">The company we’re building</p><div><h2>Conversation is the interface.<br /><span>Work is the purpose.</span></h2><p>Afluma is building digital teammates that retain their roles, share context and contribute across a business. AgenticOS connects their work; our products give it a practical place to happen.</p><Link className="text-link" href="/about">Get to know Afluma <span aria-hidden="true">↗</span></Link></div></div></section>
    <Ecosystem compact />
    <section className="section workforce-section"><div className="shell"><div className="section-heading"><div><p className="eyebrow">Meet the workforce</p><h2>Responsibility<br />has a name.</h2></div><div><p>Strategy, engineering, research and beyond. Every digital persona has a defined mission and a place in the wider team.</p><Link className="text-link" href="/workforce">Explore all ten teammates ↗</Link></div></div><WorkforceList featured /><p className="caption">Afluma digital personas. Role descriptions explain the intended workforce model, not live deployment status.</p></div></section>
    <Workflow />
    <section className="section"><div className="shell two-up"><div><p className="eyebrow">Build with Afluma</p><h2>From a hard problem<br />to a useful system.</h2><p>Product engineering, workflow automation and operational design connect your business needs to a practical implementation.</p><Action href="/services">Explore our services</Action></div><div className="approach-list"><div><span>01</span><h3>Define the work.</h3><p>Start with users, context and a clear outcome.</p></div><div><span>02</span><h3>Build with boundaries.</h3><p>Agree scope, access and acceptance criteria.</p></div><div><span>03</span><h3>Verify, then improve.</h3><p>Review the result before expanding the system.</p></div></div></div></section>
    <CallToAction />
  </>
}

export function PersonaPage({ agent }: { agent: (typeof workforce)[number] }) {
  const peers = agent.escalationAgentIds.map((id) => workforce.find((person) => person.id === id)).filter((person) => person !== undefined)
  return <><section className="shell persona-intro"><div><Link href="/workforce" className="text-link">← The workforce</Link><p className="eyebrow">AI teammate at Afluma</p><h1>{agent.name}</h1><p className="lede">{agent.role}</p><p>{agent.mission}</p></div><div className="persona-identity"><span>{agent.initials}</span><p>AFLUMA DIGITAL PERSONA</p></div></section><Sections sections={[
    { title: 'A defined responsibility.', body: agent.mission },
    { title: 'Context, tools and boundaries.', body: 'This role is part of Afluma’s intended AI workforce. Tool access and operational authority are granted per implementation. A profile describes the role; it does not imply that every capability is currently deployed.' },
    { title: 'Human accountability.', body: 'This is a digital persona created by Afluma. Work requiring commercial commitments, sensitive access or consequential changes must be routed to the appropriate human decision-maker.' },
  ]} />{peers.length > 0 && <section className="section tint"><div className="shell"><p className="eyebrow">Collaboration & handoffs</p><h2>Connected to the wider team.</h2><div className="peer-links">{peers.map((peer) => <Link key={peer.id} href={`/workforce/${peer.slug}`}><h3>{peer.name}</h3><p>{peer.role}</p><span aria-hidden="true">↗</span></Link>)}</div></div></section>}<CallToAction /></>
}

export function SitePage({ page }: { page: PageData }) {
  if (page.slug === '') return <Home />
  const isProduct = page.slug.startsWith('products/')
  const product = products.find((item) => page.slug === `products/${item.slug}`)
  const directory = page.slug === 'services' ? services.map((item) => ({title:item.title,body:item.summary,href:`/services/${item.slug}`})) : page.slug === 'industries' ? industries.map((item) => ({title:item.title,body:item.workflow,href:`/industries/${item.slug}`})) : page.slug === 'locations' ? regions.map((item) => ({title:item.title,body:item.focus,href:`/locations/${item.slug}`})) : []
  return <><Intro {...page} />
    {page.slug === 'blog' && <section className="shell directory-grid">{articles.map((article) => <Link key={article.slug} href={`/blog/${article.slug}`}><p className="eyebrow">Afluma practical guide</p><h2>{article.title}</h2><p>{article.description}</p><span className="text-link">Read the guide ↗</span></Link>)}</section>}
    {page.slug === 'blog/clear-service-pages-for-search-and-ai' && <div className="shell research-note"><p>Source for the search guidance: <a className="text-link" href="https://developers.google.com/search/docs/fundamentals/ai-optimization-guide">Google Search Central’s generative AI optimization guide ↗</a></p></div>}
    {page.slug === 'news' && <section className="shell directory-grid">{reading.map((item) => <a href={item.url} key={item.url} target="_blank" rel="noreferrer"><p className="eyebrow">{item.publisher} · <time dateTime={item.date}>{item.date}</time></p><h2>{item.title}</h2><p>{item.summary}</p><span className="text-link">Read at {item.publisher} ↗</span></a>)}<div><p>Selected on 8 September 2026. This is a curated list, not an automatically refreshed news feed. Publisher findings are not Afluma performance claims.</p><Link className="text-link" href="/research">Afluma research perspectives ↗</Link></div></section>}
    {page.slug === 'services' && <nav className="shell explore-strip" aria-label="Service context"><Link href="/industries">Explore industries ↗</Link><Link href="/locations">Explore regions ↗</Link><Link href="/workforce">Meet the AI workforce ↗</Link></nav>}
    {directory.length > 0 && <section className="shell directory-grid">{directory.map((item) => <Link href={item.href} key={item.href}><h2>{item.title}</h2><p>{item.body}</p><span className="text-link">Explore <span aria-hidden="true">↗</span></span></Link>)}</section>}
    {page.slug === 'workforce' && <><section className="section workforce-section"><div className="shell"><WorkforceList /><p className="caption">Digital personas, not human employees. Operational availability is confirmed separately.</p></div></section><Workflow /></>}
    {page.slug === 'products' && <Ecosystem />}
    {page.slug === 'platform/agenticos' && <div className="shell system-map"><span>Human direction</span><span>AgenticOS<br /><small>Identity · Context · Coordination · Governance</small></span><span>AI workforce</span></div>}
    {isProduct && <div className="shell product-context"><span>Part of the Afluma ecosystem</span><Link href="/platform/agenticos">Connected through AgenticOS ↗</Link><span>Coming soon</span></div>}
    {product && <section className="shell product-launch"><div><h2>Coming soon.</h2><p>Explore the product direction and register your interest. Features below describe planned capabilities; availability and launch timing will be confirmed separately.</p></div><Action href={productDestination(product.slug)}>Explore {product.name}</Action></section>}
    {page.slug === 'contact' ? <section className="shell contact-layout"><aside><h2>A little context helps.</h2><p>What are you trying to improve? Which systems are involved? What would a useful outcome look like?</p><p>For product enquiries, include the product name and your intended use.</p><Link href="/privacy" className="text-link">Privacy information ↗</Link></aside><ContactForm /></section> : <Sections sections={page.sections} />}
    {(page.slug === 'work' || page.slug === 'platform/agenticos') && <Ecosystem />}
    {page.slug === 'research' && <div className="shell research-note"><p>These are Afluma design perspectives. They are not presented as published research findings or measured product results.</p><Link href="/responsible-ai">Read our AI principles ↗</Link></div>}
    {product && <section className="shell product-faq"><h2>Product questions</h2><details><summary>Is {product.name} available now?</summary><p>{product.name} is coming soon. Join the waitlist for availability updates; registration does not guarantee an invitation or a launch date.</p></details><details><summary>What will the product include?</summary><p>The planned capabilities are described on this page. Final features, supported integrations and pricing will be confirmed before access is offered.</p></details><details><summary>How does it connect to Afluma?</summary><p>{product.name} is part of the Afluma ecosystem, with AgenticOS as the central operating layer for the wider AI workforce direction.</p></details></section>}
    {page.slug !== 'contact' && <CallToAction />}
  </>
}

export function LaunchPage({ product }: { product: (typeof products)[number] }) {
  return <><section className="shell page-intro"><p className="eyebrow">{product.label} / Coming soon</p><h1>{product.name}</h1><p className="lede">{product.description}</p><Link className="text-link" href={`/products/${product.slug}`}>Explore the product overview ↗</Link></section><section className="shell launch-grid"><div><h2>What’s taking shape.</h2><p>Planned capabilities</p><ul>{product.sections[0].items?.map((item) => <li key={item}>{item}</li>)}</ul><p>Launch timing, pricing and final feature availability have not been announced.</p></div><WaitlistForm product={product.slug} name={product.name} /></section></>
}


