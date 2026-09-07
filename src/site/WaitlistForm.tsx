'use client'

import { type FormEvent, useState } from 'react'

export function WaitlistForm({ product, name }: { product: string; name: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'sending' || state === 'sent') return
    setState('sending')
    const form = event.currentTarget
    try {
      const response = await fetch('/api/enquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(new FormData(form).entries()), formType: 'waitlist', product }), signal: AbortSignal.timeout(20000) })
      if (!response.ok) throw new Error('Registration failed')
      setState('sent')
      form.reset()
    } catch { setState('error') }
  }
  return <form className="a7-contact-form waitlist-form" aria-label={`Join the ${name} waitlist`} onSubmit={submit} aria-busy={state === 'sending'}><h2>Be part of what’s next.</h2><p>Register your interest in {name}. We’ll use these details to contact you about this product’s availability.</p><div className="a7-fields"><label>Your name<input name="name" required maxLength={160} autoComplete="name" /></label><label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email" /></label><label className="a7-consent a7-field--wide"><input name="consent" type="checkbox" value="true" required />I agree to receive availability updates for {name}.</label><input className="a7-honeypot" name="honeypot" tabIndex={-1} aria-hidden="true" autoComplete="off" /></div><button className="button" disabled={state === 'sending' || state === 'sent'}>{state === 'sending' ? 'Registering…' : state === 'sent' ? 'You’re on the list' : 'Join the waitlist'} <span aria-hidden="true">↗</span></button><div role="status" aria-live="polite">{state === 'sent' && <p className="a7-form-status">Your interest has been registered. No launch date or access is guaranteed.</p>}{state === 'error' && <p className="a7-form-status a7-form-status--error">We couldn’t confirm your registration. Please try again.</p>}</div></form>
}
