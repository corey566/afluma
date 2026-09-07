import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from 'lexical'
import { Sections, Action } from './SitePage'
import type { EditorialSection } from './content'


type ContentBlock = { blockType: string; heading?: string; body?: string; manualItems?: { question: string; answer: string }[]; items?: { title: string; body: string }[] }
export type CmsDocument = { slug?: string; title?: string; summary?: string; layout?: ContentBlock[]; content?: SerializedEditorState; workflow?: { status?: string }; editorialStatus?: string }

// Imported editorial briefs are not finished copy. Never manufacture paragraphs from headings.
const isBrief = (text: string) => /Add reviewed copy|Each section is editable|Explain what|Set terms for|Explain cookies|article focused on|showing how to/i.test(text)
export function cmsSections(doc: CmsDocument): EditorialSection[] {
  return (doc.layout || []).flatMap((block) => {
    if (block.blockType === 'editorialIntro' && block.heading && block.body && !isBrief(block.body)) return [{ title: block.heading, body: block.body }]
    if (block.blockType === 'bentoGrid') return (block.items || []).filter((item) => item.body && !isBrief(item.body)).map((item) => ({ title: item.title, body: item.body }))
    return []
  })
}

export function hasReviewedContent(doc: CmsDocument) {
  return ['approved', 'published'].includes(doc.editorialStatus || doc.workflow?.status || '') && (cmsSections(doc).length > 0 || Boolean(doc.content?.root?.children?.length))
}

export function CmsPage({ doc }: { doc: CmsDocument }) {
  const sections = cmsSections(doc)
  return <><section className="shell page-intro"><p className="eyebrow">Afluma</p><h1>{doc.title}</h1>{doc.summary && !isBrief(doc.summary) && <p className="lede">{doc.summary}</p>}</section><Sections sections={sections} />{doc.content?.root && <div className="shell cms-content"><RichText data={doc.content} /></div>}{doc.layout?.filter((block) => block.blockType === 'faq').map((block, index) => <section className="shell cms-content" key={index}><h2>{block.heading}</h2>{block.manualItems?.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>)}</>
}

export const legalTitles: Record<string, string> = { privacy: 'Privacy information', terms: 'Website terms', cookies: 'Cookie information' }

export function LegalPage({ slug, doc }: { slug: string; doc?: CmsDocument }) {
  if (doc && hasReviewedContent(doc)) return <CmsPage doc={doc} />
  return <><section className="shell page-intro"><p className="eyebrow">Website information</p><h1>{legalTitles[slug]}</h1><p className="lede">The full {slug === 'terms' ? 'website terms are' : 'policy is'} being prepared.</p></section><section className="shell cms-content"><div className="legal-notice"><p>This page is not a final legal policy. Please contact Afluma if you need the applicable terms or data-handling details before sharing information.</p></div>{slug === 'privacy' && <section><h2>About the enquiry form</h2><p>The form asks for your name, email, optional company, enquiry type and message. Submitting the form sends this information to Afluma’s enquiry system so it can be used to respond to your request. Please avoid including sensitive information in your message.</p></section>}<Action href="/contact">Contact Afluma</Action></section></>
}

