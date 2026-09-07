'use client'

import { FormEvent, useState } from 'react'

export function ContactForm() {
  const [state,setState]=useState<'idle'|'sending'|'sent'|'error'>('idle')
  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault(); setState('sending'); const formElement=e.currentTarget
    const form=new FormData(formElement)
    const payload=Object.fromEntries(form.entries())
    try {
      const res=await fetch('/api/enquiry',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
      if(!res.ok) throw new Error('Request failed')
      setState('sent'); formElement.reset()
    } catch { setState('error') }
  }
  return <form className="a7-contact-form" onSubmit={submit}>
    <div className="a7-fields"><label>Full name<input name="name" required autoComplete="name"/></label><label>Work email<input name="email" type="email" required autoComplete="email"/></label><label>Company<input name="company" autoComplete="organization"/></label><label>What can we help with?<select name="enquiryType" defaultValue="project"><option value="project">Project</option><option value="partnership">Partnership</option><option value="support">Support</option><option value="career">Career</option><option value="other">Other</option></select></label><label className="a7-field--wide">Project or enquiry<textarea name="message" required rows={5}/></label><input name="honeypot" tabIndex={-1} autoComplete="off" className="a7-honeypot"/><label className="a7-consent a7-field--wide"><input type="checkbox" name="consent" value="true" required/> I agree that Afluma may use this information to respond to my enquiry.</label></div><button className="a7-button a7-button--primary" disabled={state==='sending'}>{state==='sending'?'Sendingâ€¦':'Send enquiry â†’'}</button>{state==='sent'?<p className="a7-form-status">Thanks â€” your enquiry has been received.</p>:null}{state==='error'?<p className="a7-form-status a7-form-status--error">The form could not be submitted. Please try again.</p>:null}
  </form>
}

