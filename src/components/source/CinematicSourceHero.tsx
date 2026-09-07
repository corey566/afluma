'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

type Chapter = { label: string; start: number }
type HeroAction = { label: string; href: string; style?: 'primary' | 'secondary' }

type Props = {
  eyebrow?: string
  title: string
  accent?: string
  description?: string
  mediaUrl: string
  posterUrl?: string
  actions?: HeroAction[]
  chapters?: Chapter[]
}

export function CinematicSourceHero({ eyebrow, title, accent, description, mediaUrl, posterUrl, actions = [], chapters = [] }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [activeChapter, setActiveChapter] = useState(0)
  const safeChapters = useMemo(() => chapters.length ? chapters : [{ label: 'Overview', start: 0 }], [chapters])

  useEffect(() => {
    const node = video.current
    if (!node) return
    const update = () => {
      const duration = Number.isFinite(node.duration) && node.duration > 0 ? node.duration : 1
      setProgress(node.currentTime / duration)
      let next = 0
      safeChapters.forEach((chapter, index) => { if (node.currentTime >= chapter.start) next = index })
      setActiveChapter(next)
    }
    node.addEventListener('timeupdate', update)
    return () => node.removeEventListener('timeupdate', update)
  }, [safeChapters])

  const togglePlayback = async () => {
    const node = video.current
    if (!node) return
    if (node.paused) { await node.play(); setPlaying(true) } else { node.pause(); setPlaying(false) }
  }

  const jumpTo = async (index: number) => {
    const node = video.current
    if (!node) return
    node.currentTime = safeChapters[index]?.start || 0
    setActiveChapter(index)
    if (node.paused) { await node.play(); setPlaying(true) }
  }

  return (
    <section className="source-cinema-shell" aria-label="Featured Afluma experience">
      <div className="source-cinema-frame">
        <video ref={video} src={mediaUrl} poster={posterUrl} autoPlay muted={muted} loop playsInline preload="metadata" />
        <div className="source-cinema-shade" />
        <div className="source-cinema-tools">
          <button type="button" onClick={() => { const next = !muted; setMuted(next); if (video.current) video.current.muted = next }} aria-label={muted ? 'Enable sound' : 'Mute sound'}>{muted ? 'Sound off' : 'Sound on'}</button>
          <button type="button" onClick={togglePlayback} aria-label={playing ? 'Pause video' : 'Play video'}>{playing ? 'Pause' : 'Play'}</button>
        </div>
        <div className="source-cinema-copy">
          {eyebrow && <span>{eyebrow}</span>}
          <h1>{title} {accent && <em>{accent}</em>}</h1>
          {description && <p>{description}</p>}
          <div className="source-cinema-actions">{actions.map((action) => <Link key={action.href} className={`button ${action.style || 'primary'}`} href={action.href}>{action.label}<b>→</b></Link>)}</div>
        </div>
        <div className="source-cinema-chapters">
          {safeChapters.map((chapter, index) => <button type="button" key={`${chapter.label}-${index}`} className={activeChapter === index ? 'active' : ''} onClick={() => jumpTo(index)}><small>{String(index + 1).padStart(2, '0')}</small><span>{chapter.label}</span></button>)}
          <div className="source-cinema-progress"><i style={{ transform: `scaleX(${progress})` }} /></div>
        </div>
      </div>
    </section>
  )
}
