'use client'

import { type FormEvent, useState } from 'react'

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'sending') return
    const form = event.currentTarget
    setState('sending')
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
        signal: AbortSignal.timeout(20000),
      })
      if (!response.ok) throw new Error('Enquiry was not accepted')
      setState('sent')
      form.reset()
    } catch { setState('error') }
  }
  return <form className="a7-contact-form" onSubmit={submit} aria-label="Contact Afluma" aria-busy={state === 'sending'}>
    <div className="a7-fields">
      <label>Full name<input name="name" required maxLength={160} autoComplete="name" /></label>
      <label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
      <label>Company (optional)<input name="company" maxLength={200} autoComplete="organization" /></label>
      <label>What can we help with?<select name="enquiryType" defaultValue="project"><option value="project">Project or product</option><option value="partnership">Partnership</option><option value="support">Support</option><option value="career">Career</option><option value="other">Other</option></select></label>
      <label className="a7-field--wide">Tell us about it<textarea name="message" required maxLength={5000} rows={5} /></label>
      <input name="honeypot" aria-hidden="true" tabIndex={-1} autoComplete="off" className="a7-honeypot" />
      <label className="a7-consent a7-field--wide"><input type="checkbox" name="consent" value="true" required />I agree that Afluma may use this information to respond to my enquiry.</label>
    </div><button className="button" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send enquiry'}<span aria-hidden="true">↗</span></button>
    <div role="status" aria-live="polite">{state === 'sent' && <p className="a7-form-status">Thank you. Your enquiry has been received.</p>}{state === 'error' && <p className="a7-form-status a7-form-status--error">We couldn’t confirm your submission. Your message is still here. Please try again.</p>}</div>
  </form>
}


