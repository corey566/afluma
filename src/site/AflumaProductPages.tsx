import Link from 'next/link'
import { products } from './content'
import styles from './AflumaCorePages.module.css'

export const productPageMeta: Record<string, { title: string; description: string }> = Object.fromEntries(
  products.map((product) => [`products/${product.slug}`, { title: `${product.name} — Afluma`, description: product.description }]),
)

export function isAflumaProductRoute(slug: string) {
  return Object.hasOwn(productPageMeta, slug)
}

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

const productDetails: Record<string, {
  status: string
  thesis: string
  capabilities: Array<[string, string]>
  boundary: string
  links: Array<[string, string]>
}> = {
  serenops: {
    status: 'In development',
    thesis: 'SerenOps is Afluma’s AI-native infrastructure operations product: a governed control layer for understanding environments, preparing changes, executing within policy and verifying the result.',
    capabilities: [
      ['Environment context', 'Build a trustworthy picture of servers, applications, processes and dependencies before acting.'],
      ['Controlled execution', 'Bind operational actions to identity, scope, policy, approvals and explicit rollback paths.'],
      ['Verification', 'Treat the post-change state as part of the task. A change is not complete simply because a command returned successfully.'],
      ['AI operations', 'Use AI to explain, plan and assist with bounded operational work without hiding the infrastructure from human operators.'],
    ],
    boundary: 'SerenOps is under active development. Public pages describe the intended architecture and product direction; they do not imply every roadmap capability is already deployed.',
    links: [['Explore AgenticOS', '/platform/agenticos'], ['Join the pilot', '/contact']],
  },
  'afluma-commerce': {
    status: 'In development',
    thesis: 'Afluma Commerce is a Sri Lanka/South Asia-first, globally extensible commerce operating environment designed to connect selling with the operational work that follows every sale.',
    capabilities: [
      ['Unified commerce', 'Bring store, ecommerce, product, order, inventory and customer context into a common operating picture.'],
      ['Progressive product entry', 'Keep merchant workflows quick and category-driven while preserving detailed canonical product and variant data underneath.'],
      ['Multilingual by design', 'Build English, Sinhala, Tamil and Hindi support into the platform foundation rather than bolting localisation on later.'],
      ['AI-native operations', 'Create a governed environment where digital coworkers can help with catalogue, customer, workflow and operational tasks as capabilities are validated.'],
    ],
    boundary: 'POS, accounting, payroll, banking and third-party integrations are part of the wider product direction and must be described as available only when implemented and verified.',
    links: [['Explore the workforce', '/workforce'], ['Discuss Commerce', '/contact']],
  },
  'commander-os': {
    status: 'Prototype direction',
    thesis: 'Commander OS is Afluma’s local-first human control room: a focused desktop environment for context, priorities, tasks and approved AI actions.',
    capabilities: [
      ['Local-first context', 'Keep operational working data on the user’s PC by default, with explicit connections for external services.'],
      ['Human command surface', 'Make tasks, decisions, approvals and agent activity visible in one workspace rather than hiding coordination inside chat threads.'],
      ['Controlled agent access', 'Expose data and actions through permissioned connector/MCP-style interfaces so AI can help without becoming the owner of the system.'],
      ['Afluma workforce integration', 'Bring validated digital coworkers into the control room progressively as their responsibilities and authority are proven.'],
    ],
    boundary: 'Commander OS is a product direction under development. Platform support, integrations and agent capabilities should be confirmed against the current build before being treated as available.',
    links: [['Explore AgenticOS', '/platform/agenticos'], ['Join the pilot', '/contact']],
  },
}

export function AflumaProductPage({ slug }: { slug: string }) {
  const productSlug = slug.replace('products/', '')
  const product = products.find((item) => item.slug === productSlug)
  const detail = productDetails[productSlug]
  if (!product || !detail) return null

  return <div className={styles.page}>
    <section className={styles.hero}><div className={`${styles.shell} ${styles.heroGrid}`}><div><p className={styles.eyebrow}>{product.number} / {product.label}</p><h1>{product.name}<br /><em>{product.focus}.</em></h1><p className={styles.lede}>{detail.thesis}</p><div className={styles.actions}>{detail.links.map(([label, href], index) => <Link key={href} href={href} className={index === 0 ? styles.primary : styles.secondary}><span>{label}</span><Arrow /></Link>)}</div></div><aside className={styles.heroAside}><span className={styles.status}>{detail.status}</span><p>{detail.boundary}</p><div className={styles.heroStatus}><span>Human governed</span><span>Explicit scope</span><span>Observable</span><span>Evidence led</span></div></aside></div></section>

    <section className={styles.section}><div className={styles.shell}><div className={styles.heading}><p className={styles.eyebrow}>Product architecture</p><div><h2>Useful intelligence needs<br />a real operating context.</h2><p>{product.description}</p></div></div><div className={styles.trustGrid}>{detail.capabilities.map(([title, body], index) => <article className={styles.trustCard} key={title}><span>0{index + 1} / Capability direction</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>

    <section className={`${styles.section} ${styles.sectionNight}`}><div className={styles.shell}><div className={styles.heading}><p className={styles.eyebrow}>Connected system</p><div><h2>Product outside.<br />AgenticOS underneath.</h2><p>The product remains a focused operating environment. AgenticOS provides the wider identity, context, coordination and governance model that can connect approved AI work across Afluma.</p></div></div><div className={styles.flow}><strong>Human direction</strong><i>→</i><strong>{product.name}</strong><i>↔</i><strong>AgenticOS</strong></div></div></section>

    <section className={styles.cta}><div className={`${styles.shell} ${styles.ctaInner}`}><div><p className={styles.eyebrow}>{product.name} / Pilot</p><h2>Start with the workflow, not the feature list.</h2></div><Link href="/contact" className={styles.primary}><span>Discuss {product.name}</span><Arrow /></Link></div></section>
  </div>
}
