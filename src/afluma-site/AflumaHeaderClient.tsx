'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import styles from './AflumaHeaderClient.module.css'

const topNavigation = [
  ['Workforce', '/workforce/'],
  ['Platform', '/platform/'],
  ['Products', '/products/'],
  ['Research', '/research/'],
  ['Company', '/company/'],
] as const

const menuNavigation = [
  ['Workforce', '/workforce/', '01'],
  ['Platform', '/platform/', '02'],
  ['Products', '/products/', '03'],
  ['Research', '/research/', '04'],
  ['Proof', '/proof/', '05'],
  ['Company', '/company/', '06'],
  ['Trust', '/trust/', '07'],
] as const

const exploreLinks = [
  ['Afluma Runs on Afluma', '/proof/afluma-runs-on-afluma/'],
  ['AgenticOS', '/platform/agenticos/'],
  ['SerenOps', '/products/serenops/'],
  ['Afluma Commerce', '/products/afluma-commerce/'],
] as const

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M5 15 15 5M7 5h8v8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span
      className={`${styles.menuIcon} ${
        open ? styles.menuIconOpen : ''
      }`}
      aria-hidden="true"
    >
      <i />
      <i />
    </span>
  )
}

function SoundWave({ playing }: { playing: boolean }) {
  return (
    <span
      className={`${styles.waveform} ${
        playing ? styles.waveformPlaying : ''
      }`}
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

export default function AflumaHeaderClient() {
  const pathname = usePathname()

  const isHome = pathname === '/'

  const [menuOpen, setMenuOpen] = useState(false)
  const [playing, setPlaying] = useState(false)

  const [overHero, setOverHero] = useState(
    isHome,
  )

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeFrame = useRef<number | null>(null)

  const fadeVolume = useCallback(
    (
      target: number,
      duration: number,
      complete?: () => void,
    ) => {
      const audio = audioRef.current

      if (!audio) return

      if (fadeFrame.current !== null) {
        cancelAnimationFrame(fadeFrame.current)
      }

      const startingVolume = audio.volume
      const startedAt = performance.now()

      const update = (now: number) => {
        const progress = Math.min(
          1,
          (now - startedAt) / duration,
        )

        const eased =
          1 - Math.pow(1 - progress, 3)

        audio.volume =
          startingVolume +
          (target - startingVolume) * eased

        if (progress < 1) {
          fadeFrame.current =
            requestAnimationFrame(update)

          return
        }

        fadeFrame.current = null
        audio.volume = target

        complete?.()
      }

      fadeFrame.current =
        requestAnimationFrame(update)
    },
    [],
  )

  const toggleSound = useCallback(async () => {
    const audio = audioRef.current

    if (!audio) return

    if (playing) {
      fadeVolume(
        0,
        450,
        () => {
          audio.pause()
          setPlaying(false)
        },
      )

      return
    }

    try {
      audio.volume = 0

      await audio.play()

      setPlaying(true)

      fadeVolume(
        0.075,
        1200,
      )
    } catch (error) {
      console.error(
        'Unable to play Afluma ambience.',
        error,
      )

      setPlaying(false)
    }
  }, [fadeVolume, playing])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    let animationFrame:
      number | null = null

    const detectSurface = () => {
      if (animationFrame !== null) {
        return
      }

      animationFrame =
        requestAnimationFrame(() => {
          animationFrame = null

          /*
           * Do NOT depend on pathname here.
           *
           * The homepage is Payload/catch-all routed, so the
           * DOM itself is the source of truth.
           */
          const heading =
            document.getElementById(
              'afluma-home-hero-title',
            )

          const hero =
            heading?.closest('section')

          if (!hero) {
            setOverHero(false)
            return
          }

          const bounds =
            hero.getBoundingClientRect()

          /*
           * Hero mode remains active while the navbar is
           * visually sitting over the hero.
           *
           * Once the hero bottom moves above ~104px,
           * immediately switch to the dark page navigation.
           */
          setOverHero(
            bounds.bottom > 104,
          )
        })
    }

    detectSurface()

    window.addEventListener(
      'scroll',
      detectSurface,
      {
        passive: true,
      },
    )

    window.addEventListener(
      'resize',
      detectSurface,
    )

    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(
          animationFrame,
        )
      }

      window.removeEventListener(
        'scroll',
        detectSurface,
      )

      window.removeEventListener(
        'resize',
        detectSurface,
      )
    }
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [menuOpen])

  useEffect(() => {
    return () => {
      if (fadeFrame.current !== null) {
        cancelAnimationFrame(
          fadeFrame.current,
        )
      }
    }
  }, [])

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/afluma-ambient.ogg"
        loop
        preload="metadata"
      />

      <header
        className={styles.header}
        data-surface={
          overHero
            ? 'hero'
            : 'page'
        }
        data-menu-open={
          menuOpen
            ? 'true'
            : 'false'
        }
      >
        <div className={styles.navShell}>

          <div className={styles.leftCluster}>
            <Link
              href="/"
              className={styles.brandPill}
              aria-label="Afluma home"
            >
              <span
                className={styles.brandWordmark}
                aria-hidden="true"
              >
                AFLUMA
              </span>
            </Link>

            <button
              type="button"
              className={`${styles.soundPill} ${
                playing
                  ? styles.soundPillPlaying
                  : ''
              }`}
              onClick={toggleSound}
              aria-pressed={playing}
              aria-label={
                playing
                  ? 'Stop ambient music'
                  : 'Play ambient music'
              }
            >
              <SoundWave playing={playing} />

              <span className={styles.soundText}>
                {playing ? 'STOP' : 'PLAY'}
              </span>
            </button>
          </div>

          <nav
            className={styles.primaryNav}
            aria-label="Main navigation"
          >
            {topNavigation.map(
              ([label, href]) => {
                const active =
                  pathname.startsWith(href)

                return (
                  <Link
                    href={href}
                    key={href}
                    className={`${styles.navPill} ${
                      active
                        ? styles.navPillActive
                        : ''
                    }`}
                  >
                    {label}
                  </Link>
                )
              },
            )}
          </nav>

          <div className={styles.rightCluster}>

            <button
              type="button"
              className={styles.askPill}
              onClick={() => {
                window.dispatchEvent(
                  new Event(
                    'afluma:ask-open',
                  ),
                )
              }}
              aria-label="Ask Afluma"
            >
              <span
                className={styles.askSpark}
                aria-hidden="true"
              >
                {'\u2726'}
              </span>

              <span>
                Ask Afluma
              </span>
            </button>
            <Link
              href="/contact/"
              className={styles.projectPill}
            >
              <span>Join the pilot</span>

              <span className={styles.projectArrow}>
                <ArrowUpRight />
              </span>
            </Link>

            <button
              type="button"
              className={`${styles.menuPill} ${
                menuOpen
                  ? styles.menuPillOpen
                  : ''
              }`}
              onClick={() => {
                setMenuOpen(
                  (current) => !current,
                )
              }}
              aria-expanded={menuOpen}
              aria-controls="afluma-menu"
            >
              <span className={styles.menuWord}>
                {menuOpen ? 'Close' : 'Menu'}
              </span>

              <MenuIcon open={menuOpen} />
            </button>
          </div>

        </div>
      </header>

      {!isHome && (
        <div
          className={styles.nonHomeSpacer}
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        className={`${styles.menuBackdrop} ${
          menuOpen
            ? styles.menuBackdropVisible
            : ''
        }`}
        onClick={() => setMenuOpen(false)}
        tabIndex={-1}
        aria-hidden="true"
      />

      <section
        id="afluma-menu"
        className={`${styles.megaMenu} ${
          menuOpen
            ? styles.megaMenuOpen
            : ''
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          className={styles.menuAtmosphere}
          aria-hidden="true"
        />

        <div className={styles.menuGrid}>

          <div className={styles.menuIntro}>
            <div className={styles.menuKicker}>
              <i />
              Afluma / AI Company
            </div>

            <h2>
              Intelligence
              <br />
              that does
              <br />
              the work.
            </h2>

            <p>
              Persistent AI coworkers, AgenticOS
              and applied AI systems designed to
              perform real work under human governance.
            </p>

            <Link
              href="/contact/"
              className={styles.menuContact}
              tabIndex={menuOpen ? 0 : -1}
            >
              Join the pilot
              <ArrowUpRight />
            </Link>
          </div>

          <div className={styles.menuNavigation}>
            <span className={styles.columnLabel}>
              Navigation
            </span>

            <div className={styles.menuLinks}>
              {menuNavigation.map(
                ([label, href, number]) => (
                  <Link
                    href={href}
                    key={href}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    <span className={styles.linkNumber}>
                      {number}
                    </span>

                    <span className={styles.linkName}>
                      {label}
                    </span>

                    <span className={styles.linkArrow}>
                      <ArrowUpRight />
                    </span>
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className={styles.menuExplore}>
            <span className={styles.columnLabel}>
              Explore
            </span>

            <h3>
              Explore the
              <br />
              Afluma system.
            </h3>

            <p>
              See the operating system, products,
              research and proof behind Afluma.
            </p>

            <div className={styles.exploreLinks}>
              {exploreLinks.map(
                ([label, href]) => (
                  <Link
                    href={href}
                    key={href}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    <span>{label}</span>

                    <span>
                      <ArrowUpRight />
                    </span>
                  </Link>
                ),
              )}
            </div>
          </div>

        </div>

        <div className={styles.menuFooter}>
          <span>Colombo Ã‚Â· Sri Lanka</span>

          <div>
            <Link
              href="/company/"
              tabIndex={menuOpen ? 0 : -1}
            >
              About
            </Link>

            <Link
              href="/careers/"
              tabIndex={menuOpen ? 0 : -1}
            >
              Careers
            </Link>

            <Link
              href="/contact/"
              tabIndex={menuOpen ? 0 : -1}
            >
              Contact
            </Link>

            <Link
              href="/insights/"
              tabIndex={menuOpen ? 0 : -1}
            >
              Insights
            </Link>
          </div>

          <span>Ã‚Â© 2026 Afluma</span>
        </div>
      </section>
    </>
  )
}