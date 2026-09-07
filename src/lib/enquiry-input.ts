const enquiryTypes = ['project', 'partnership', 'career', 'media', 'support', 'other'] as const
type EnquiryType = (typeof enquiryTypes)[number]
const productNames: Record<string, string> = { serenops: 'SerenOps', 'afluma-commerce': 'Afluma Commerce', 'commander-os': 'Commander OS' }
export type EnquiryInput = { name: string; email: string; company: string; message: string; enquiryType: EnquiryType; consent: true; honeypot: ''; status: 'new' }

export function parseEnquiry(body: unknown): { data: EnquiryInput; waitlist: boolean } | { error: string } | { spam: true } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Invalid request.' }
  const values = body as Record<string, unknown>
  if (typeof values.honeypot === 'string' && values.honeypot.trim()) return { spam: true }
  const field = (key: string) => typeof values[key] === 'string' ? values[key].trim() : ''
  const name = field('name')
  const email = field('email').toLowerCase()
  const company = field('company')
  const waitlist = values.formType === 'waitlist'
  const product = productNames[field('product')]
  const message = waitlist && product ? `Product waitlist: ${product}. Consent: availability updates for this product only.` : field('message')
  const type = waitlist ? 'other' : field('enquiryType')
  if (waitlist && !product) return { error: 'Choose a recognised product.' }
  if (!name || name.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || company.length > 200 || !message || message.length > 5000) return { error: 'Check the name, email and message fields.' }
  if (values.consent !== true && values.consent !== 'true') return { error: 'Consent is required.' }
  if (!enquiryTypes.includes(type as EnquiryType)) return { error: 'Choose a recognised enquiry type.' }
  return { data: { name, email, company, message, enquiryType: type as EnquiryType, consent: true, honeypot: '', status: 'new' }, waitlist }
}
