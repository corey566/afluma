'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { drive, generated } from './assets'
import type { Action } from './types'

type Props = {
  eyebrow?: string
  title: string
  accent?: string
  description: string
  theme?: 'light' | 'dark'
  media?: string
  video?: boolean
  actions?: Action[]
  tabs?: string[]
  chapters?: string[]
  sideLabel?: string
}

export function CinematicHero({eyebrow='Afluma',title,accent,description,theme='light',media=generated.heroAndroid,video=false,actions=[{label:'Start a project',href:'/start-project/'}],tabs=['Overview','Capabilities','Outcomes'],chapters=['Discover','Design','Build','Operate'],sideLabel='Operating model'}:Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing,setPlaying] = useState(true)
  const toggle = () => {
    const el=ref.current
    if (!el) return
    if (el.paused) { void el.play(); setPlaying(true) } else { el.pause(); setPlaying(false) }
  }
  return <section className={`a7-hero-wrap ${theme==='dark'?'a7-hero-wrap--dark':''}`}>
    <div className="a7-shell">
      <div className="a7-cinema">
        {video ? <video ref={ref} className="a7-cinema__motion" autoPlay muted loop playsInline poster={generated.nebula}><source src={drive.motion} type="video/mp4"/></video> : null}
        <div className="a7-cinema__wash"/>
        <div className="a7-cinema__top">
          <span className="a7-cinema__mark">A</span>
          <div className="a7-cinema__tabs">{tabs.map((tab,i)=><span className={i===0?'is-active':''} key={tab}>{tab}</span>)}</div>
          <div className="a7-cinema__tools"><span>◌</span><span>⌁</span><Link href="/contact/">Talk to Afluma</Link></div>
        </div>
        <div className="a7-cinema__content">
          <div className="a7-cinema__copy">
            <span className="a7-kicker a7-kicker--on-dark">{eyebrow}</span>
            <h1>{title}{accent ? <> <em>{accent}</em></> : null}</h1>
            <p>{description}</p>
            <div className="a7-actions">{actions.map((action)=><Link className={action.secondary?'a7-button a7-button--outline-dark':'a7-button a7-button--primary'} href={action.href} key={action.href}>{action.label} <span>→</span></Link>)}{video?<button type="button" className="a7-play" onClick={toggle}><span>{playing?'Ⅱ':'▶'}</span>{playing?'Pause motion':'Play motion'}</button>:null}</div>
          </div>
          <div className="a7-cinema__visual"><img src={media} alt=""/></div>
          <aside className="a7-cinema__status"><span>{sideLabel}</span><strong>Connected</strong><p>Clear workflows, visible ownership and controlled automation.</p></aside>
        </div>
        <div className="a7-cinema__chapters">{chapters.map((chapter,i)=><div key={chapter}><b>0{i+1}</b><span>{chapter}</span></div>)}</div>
      </div>
    </div>
  </section>
}
