import { getPayload } from 'payload'
import config from '../../../../payload.config'

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 16 * 1024
const MAX_NAME_LENGTH = 160
const MAX_EMAIL_LENGTH = 254
const MAX_COMPANY_LENGTH = 200
const MAX_PHONE_LENGTH = 80
const MAX_MESSAGE_LENGTH = 5_000
const MAX_BUDGET_LENGTH = 120
const MAX_HONEYPOT_LENGTH = 500

const enquiryTypes = new Set([
  'project',
  'partnership',
  'career',
  'media',
  'support',
  'other',
])

type JsonRecord = Record<string, unknown>

function response(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

function text(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function validEmail(value: string) {
  if (!value || value.length > MAX_EMAIL_LENGTH) return false
  if (/\s/.test(value)) return false
  const separator = value.lastIndexOf('@')
  return separator > 0 && separator < value.length - 1 && value.slice(separator + 1).includes('.')
}

function truthyConsent(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1'
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get('content-length') || 0)
  if (declaredLength > MAX_BODY_BYTES) return response({ ok: false, error: 'Request too large' }, 413)

  let raw = ''
  try {
    raw = await request.text()
  } catch {
    return response({ ok: false, error: 'Unable to read request' }, 400)
  }

  if (!raw || Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return response({ ok: false, error: raw ? 'Request too large' : 'Empty request' }, raw ? 413 : 400)
  }

  let input: JsonRecord
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid JSON object')
    input = parsed as JsonRecord
  } catch {
    return response({ ok: false, error: 'Invalid JSON' }, 400)
  }

  const honeypot = text(input.honeypot, MAX_HONEYPOT_LENGTH)
  // Give bots the same outward success response without storing or queueing work.
  if (honeypot) return response({ ok: true })

  const name = text(input.name, MAX_NAME_LENGTH)
  const email = text(input.email, MAX_EMAIL_LENGTH).toLowerCase()
  const company = text(input.company, MAX_COMPANY_LENGTH)
  const phone = text(input.phone, MAX_PHONE_LENGTH)
  const message = text(input.message, MAX_MESSAGE_LENGTH)
  const budgetRange = text(input.budgetRange, MAX_BUDGET_LENGTH)
  const enquiryType = text(input.enquiryType, 40)
  const consent = truthyConsent(input.consent)

  if (!name || !validEmail(email) || !message || !consent || !enquiryTypes.has(enquiryType)) {
    return response({ ok: false, error: 'Please check the required enquiry fields' }, 400)
  }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'enquiries',
      overrideAccess: true,
      data: {
        name,
        email,
        company: company || undefined,
        phone: phone || undefined,
        enquiryType: enquiryType as 'project' | 'partnership' | 'career' | 'media' | 'support' | 'other',
        budgetRange: budgetRange || undefined,
        message,
        consent: true,
        honeypot: '',
        status: 'new',
      },
    })

    return response({ ok: true }, 201)
  } catch (error) {
    // Do not include form contents or other PII in server logs.
    console.error('[Afluma] Public enquiry intake failed', {
      error: error instanceof Error ? error.message : 'unknown error',
    })
    return response({ ok: false, error: 'Unable to accept enquiry' }, 500)
  }
}
