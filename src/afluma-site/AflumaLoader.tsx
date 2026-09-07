'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import styles from './AflumaLoader.module.css'

const PixelBlast = dynamic(
  () => import('@/components/reactbits/PixelBlast/PixelBlast'),
  {
    ssr: false,
  },
)

const LOGO_SRC = '/assets/brand/afluma-logo.png'

type LoaderPhase = 'enter' | 'hold' | 'dissolve'

export default function AflumaLoader() {
  const [visible, setVisible] = useState(true)
  const [phase, setPhase] = useState<LoaderPhase>('enter')
  const [showPixelBlast, setShowPixelBlast] = useState(false)

  useEffect(() => {
    const html = document.documentElement

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const mobile = window.matchMedia(
      '(max-width: 760px)',
    ).matches

    html.classList.add('afluma-loader-active')

    setShowPixelBlast(
      !mobile && !reducedMotion,
    )

    if (reducedMotion) {
      const timer = window.setTimeout(() => {
        html.classList.remove(
          'afluma-loader-active',
        )

        setVisible(false)
      }, 500)

      return () => {
        window.clearTimeout(timer)

        html.classList.remove(
          'afluma-loader-active',
        )
      }
    }

    const holdTimer = window.setTimeout(() => {
      setPhase('hold')
    }, 650)

    const dissolveTimer = window.setTimeout(() => {
      setPhase('dissolve')
    }, 2050)

    const removeTimer = window.setTimeout(() => {
      html.classList.remove(
        'afluma-loader-active',
      )

      setVisible(false)
    }, 3150)

    return () => {
      window.clearTimeout(holdTimer)
      window.clearTimeout(dissolveTimer)
      window.clearTimeout(removeTimer)

      html.classList.remove(
        'afluma-loader-active',
      )
    }
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div
      className={styles.loader}
      data-phase={phase}
      role="status"
      aria-label="Loading Afluma"
      aria-live="polite"
    >
      <div
        className={styles.pixelField}
        aria-hidden="true"
      >
        {showPixelBlast ? (
          <PixelBlast
            variant="square"
            pixelSize={3}
            color="#B497CF"
            patternScale={2}
            patternDensity={1}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            rippleIntensityScale={1}
            speed={0.5}
            transparent
            edgeFade={0.5}
          />
        ) : null}
      </div>

      <div
        className={styles.ambient}
        aria-hidden="true"
      />

      <div
        className={styles.vignette}
        aria-hidden="true"
      />

      <div className={styles.identity}>
        <img
          src={LOGO_SRC}
          alt="Afluma"
          className={styles.logo}
          draggable={false}
        />

        <span className={styles.tagline}>
          Intelligent systems, built for impact.
        </span>
      </div>

      <div
        className={styles.dissolveLight}
        aria-hidden="true"
      />
    </div>
  )
}