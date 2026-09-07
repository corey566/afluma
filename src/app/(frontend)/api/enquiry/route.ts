import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { parseEnquiry } from '@/lib/enquiry-input'

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) return NextResponse.json({ error: 'Expected JSON.' }, { status: 415 })
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 20000) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 })
  let body: unknown
  try {
    const text = await request.text()
    if (text.length > 20000) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 })
    body = JSON.parse(text)
  } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }
  const parsed = parseEnquiry(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  if ('spam' in parsed) return NextResponse.json({ ok: true })
  try {
    const payload = await getPayload({ config })
    if (parsed.waitlist) {
      const existing = await payload.find({ collection: 'enquiries', overrideAccess: true, depth: 0, limit: 1, where: { and: [{ email: { equals: parsed.data.email } }, { message: { equals: parsed.data.message } }] } })
      if (existing.docs.length) return NextResponse.json({ ok: true })
    }
    await payload.create({ collection: 'enquiries', overrideAccess: true, data: parsed.data })
    return NextResponse.json({ ok: true })
  } catch {
    console.error('Afluma enquiry storage failed')
    return NextResponse.json({ error: 'Unable to save your enquiry. Please try again.' }, { status: 503 })
  }
}
