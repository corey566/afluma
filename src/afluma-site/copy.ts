import type { AnyDoc } from './types'

export const clean = (value: unknown, fallback = '') => {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text || fallback
}

export const pageHref = (doc: AnyDoc) => {
  const slug = clean(doc?.slug)
  return slug === 'home' || !slug ? '/' : `/${slug.replace(/^\/+|\/+$/g, '')}/`
}

export const titleOf = (doc: AnyDoc, fallback = 'Afluma') => clean(doc?.title, fallback)
export const summaryOf = (doc: AnyDoc, fallback = 'Afluma designs, builds and operates intelligent digital systems for modern businesses.') => clean(doc?.summary || doc?.seo?.description, fallback)
export const keywordOf = (doc: AnyDoc) => clean(doc?.seo?.primaryKeyword || doc?.section || doc?.pageType, 'intelligent digital systems')

export function outlineOf(doc: AnyDoc): string[] {
  const found: string[] = []
  for (const block of Array.isArray(doc?.layout) ? doc.layout : []) {
    if (block?.blockType === 'editorialIntro' && block?.heading) found.push(clean(block.heading))
    if (block?.blockType === 'bentoGrid') {
      for (const item of Array.isArray(block?.items) ? block.items : []) {
        if (item?.title) found.push(clean(item.title))
      }
    }
  }
  const unique = [...new Set(found.filter(Boolean))]
  return unique.slice(0, 9)
}

const sentence = (subject: string, action: string, outcome: string) => `${subject} ${action} ${outcome}`

export function sectionBody(heading: string, doc: AnyDoc): string {
  const h = heading.toLowerCase()
  const subject = titleOf(doc)
  const keyword = keywordOf(doc)
  if (/benefit|outcome|impact|value|why/.test(h)) {
    return sentence(subject, 'focuses on practical operating outcomes rather than technology for its own sake.', `The goal is to make ${keyword} easier to adopt, govern and improve as the business changes.`)
  }
  if (/process|approach|method|deliver|implementation|roadmap/.test(h)) {
    return `Work is structured around discovery, architecture, implementation, validation and continuous improvement. Decisions are documented, responsibilities stay visible, and each stage is designed to reduce unnecessary operational friction.`
  }
  if (/security|trust|privacy|govern|risk|compliance/.test(h)) {
    return `Security and governance are treated as design constraints from the beginning. Access, data handling, approvals, auditability and operational ownership are considered alongside the user experience and system architecture.`
  }
  if (/integration|architecture|platform|technology|stack/.test(h)) {
    return `${subject} is designed around connected systems rather than isolated tools. APIs, data flows, identity, observability and operational hand-offs are mapped so information can move reliably across the wider business environment.`
  }
  if (/automation|workflow|agent|ai/.test(h)) {
    return `Automation is introduced where it removes repeatable work or improves decision support, while important approvals and exceptions remain visible to people. The design favours controlled orchestration over opaque automation.`
  }
  if (/customer|experience|user|design/.test(h)) {
    return `The experience is shaped around the people who actually use the system. Information hierarchy, task flow, accessibility and clear feedback are treated as core product requirements rather than finishing touches.`
  }
  if (/data|analytics|report|insight|measure/.test(h)) {
    return `Data is organised so teams can understand what happened, what needs attention and what should happen next. Reporting is designed around useful operational questions instead of creating dashboards simply because data exists.`
  }
  if (/service|capabilit|feature|what we do/.test(h)) {
    return `${subject} combines the relevant product, engineering, automation and operating capabilities required to move from an idea or business problem to a system that can be used and improved in practice.`
  }
  if (/faq|question/.test(h)) {
    return `Scope, delivery model, ownership, integrations and support are agreed against the actual operating context. Afluma does not assume that one implementation pattern will fit every organisation.`
  }
  return `${subject} is approached as part of a wider operating system. Strategy, software, data, automation and human workflows are considered together so the result can be useful in day-to-day work, not just impressive in a presentation.`
}

export const capabilityCopy = [
  ['Custom software', 'Design and engineer products, internal platforms and connected applications around real operating needs.'],
  ['AI & automation', 'Orchestrate repetitive and complex work with clear human oversight, integrations and exception paths.'],
  ['Managed operations', 'Run defined business processes with visible ownership, reporting, controls and continuous improvement.'],
  ['Data & intelligence', 'Turn fragmented operational information into reliable context for decisions, reporting and automation.'],
] as const

export const operatingSteps = [
  ['01', 'Discover', 'Align on users, workflows, systems, constraints and the business outcome.'],
  ['02', 'Define', 'Turn the problem into an architecture, delivery plan and measurable acceptance criteria.'],
  ['03', 'Design', 'Prototype the experience, data flow and operational controls before heavy implementation.'],
  ['04', 'Build', 'Engineer, integrate and test the system with clear deployment and rollback gates.'],
  ['05', 'Operate', 'Measure real usage, resolve exceptions and improve the system after launch.'],
] as const
