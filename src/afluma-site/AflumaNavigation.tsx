'use client'

import Link from 'next/link'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

import styles from './AflumaNavigation.module.css'

type NavGroup = {
  number: string
  label: string
  href: string
  description: string
  children: {
    label: string
    href: string
  }[]
}

const groups: NavGroup[] = [
  {
    number: '01',
    label: 'Services',
    href: '/services/',
    description:
      'Technology, automation and operational capabilities engineered around measurable business outcomes.',
    children: [
      {
        label: 'Custom Software',
        href: '/services/custom-software-development/',
      },
      {
        label: 'AI & Automation',
        href: '/services/ai-automation/',
      },
      {
        label: 'Managed Operations',
        href: '/services/managed-operations/',
      },
      {
        label: 'Experience Design',
        href: '/services/experience-design/',
      },
      {
        label: 'Product Engineering',
        href: '/services/product-engineering/',
      },
      {
        label: 'Growth Systems',
        href: '/services/growth-systems/',
      },
    ],
  },
  {
    number: '02',
    label: 'Solutions',
    href: '/solutions/',
    description:
      'Connected intelligence, platforms and automation for complex operational environments.',
    children: [
      {
        label: 'Intelligent Automation',
        href: '/solutions/intelligent-automation/',
      },
      {
        label: 'Data & Intelligence',
        href: '/solutions/data-intelligence/',
      },
      {
        label: 'Digital Operations',
        href: '/solutions/digital-operations/',
      },
      {
        label: 'Enterprise Platforms',
        href: '/solutions/enterprise-platforms/',
      },
    ],
  },
  {
    number: '03',
    label: 'Industries',
    href: '/industries/',
    description:
      'Industry-aware systems built around the realities, regulations and operating models of each sector.',
    children: [
      {
        label: 'Financial Services',
        href: '/industries/financial-services/',
      },
      {
        label: 'Retail & Commerce',
        href: '/industries/retail-commerce/',
      },
      {
        label: 'Manufacturing',
        href: '/industries/manufacturing/',
      },
      {
        label: 'Healthcare',
        href: '/industries/healthcare/',
      },
      {
        label: 'Logistics',
        href: '/industries/logistics/',
      },
      {
        label: 'Technology',
        href: '/industries/technology/',
      },
    ],
  },
  {
    number: '04',
    label: 'Products',
    href: '/products/',
    description:
      'Afluma products for commerce, infrastructure operations and intelligent orchestration.',
    children: [
      {
        label: 'Afluma Commerce',
        href: '/products/afluma-commerce/',
      },
      {
        label: 'SerenOps',
        href: '/products/serenops/',
      },
      {
        label: 'Afluma Workflows',
        href: '/products/afluma-workflows/',
      },
    ],
  },
  {
    number: '05',
    label: 'Work',
    href: '/work/',
    description:
      'Selected transformations, implementations and measurable outcomes delivered with our partners.',
    children: [
      {
        label: 'Case Studies',
        href: '/work/case-studies/',
      },
      {
        label: 'Featured Work',
        href: '/work/',
      },
      {
        label: 'Our Approach',
        href: '/work/approach/',
      },
    ],
  },
  {
    number: '06',
    label: 'Insights',
    href: '/insights/',
    description:
      'Research and practical thinking on intelligent systems, technology and modern operations.',
    children: [
      {
        label: 'Latest Insights',
        href: '/insights/',
      },
      {
        label: 'Reports',
        href: '/resources/reports/',
      },
      {
        label: 'Research',
        href: '/resources/research/',
      },
      {
        label: 'Resources',
        href: '/resources/',
      },
    ],
  },
  {
    number: '07',
    label: 'Company',
    href: '/company/',
    description:
      'Meet Afluma, discover our story and find opportunities to build what comes next with us.',
    children: [
      {
        label: 'About Afluma',
        href: '/company/about/',
      },
      {
        label: 'Leadership & Team',
        href: '/company/team/',
      },
      {
        label: 'Careers',
        href: '/careers/',
      },
      {
        label: 'Partners',
        href: '/company/partners/',
      },
      {
        label: 'Contact',
        href: '/contact/',
      },
      {
        label: 'Security',
        href: '/security/',
      },
    ],
  },
]

const AUDIO_SRC = '/assets/audio/afluma-ambient.mp3'

type MobilePanel = 'main' | 'submenu'

export default function AflumaNavigation() {
  const [menuMounted, setMenuMounted] =
    useState(false)

  const [open, setOpen] =
    useState(false)

  const [active, setActive] =
    useState(0)

  const [mobilePanel, setMobilePanel] =
    useState<MobilePanel>('main')

  const [isMobile, setIsMobile] =
    useState(false)

  const [audioOn, setAudioOn] =
    useState(false)

  const [audioAvailable, setAudioAvailable] =
    useState(true)

  const audioRef =
    useRef<HTMLAudioElement | null>(null)

  const closeTimerRef =
    useRef<number | null>(null)

  const activeGroup = groups[active]

  /* ----------------------------------------------------------
     RESPONSIVE MODE
     ---------------------------------------------------------- */

  useEffect(() => {
    const media = window.matchMedia(
      '(max-width: 760px)',
    )

    const update = () => {
      setIsMobile(media.matches)
    }

    update()

    media.addEventListener(
      'change',
      update,
    )

    return () => {
      media.removeEventListener(
        'change',
        update,
      )
    }
  }, [])

  /* ----------------------------------------------------------
     PAGE SCROLL LOCK
     ---------------------------------------------------------- */

  useEffect(() => {
    const html = document.documentElement

    if (menuMounted) {
      html.classList.add(
        'afluma-menu-open',
      )
    } else {
      html.classList.remove(
        'afluma-menu-open',
      )
    }

    return () => {
      html.classList.remove(
        'afluma-menu-open',
      )
    }
  }, [menuMounted])

  /* ----------------------------------------------------------
     AUDIO
     ---------------------------------------------------------- */

  useEffect(() => {
    const audio = new Audio(
      AUDIO_SRC,
    )

    audio.loop = true
    audio.volume = 0

    const handleError = () => {
      setAudioAvailable(false)
    }

    audio.addEventListener(
      'error',
      handleError,
    )

    audioRef.current = audio

    return () => {
      audio.pause()

      audio.removeEventListener(
        'error',
        handleError,
      )

      audioRef.current = null
    }
  }, [])

  /* ----------------------------------------------------------
     CLEANUP
     ---------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (
        closeTimerRef.current !== null
      ) {
        window.clearTimeout(
          closeTimerRef.current,
        )
      }
    }
  }, [])

  /* ----------------------------------------------------------
     MENU OPEN
     ---------------------------------------------------------- */

  function openMenu() {
    if (
      closeTimerRef.current !== null
    ) {
      window.clearTimeout(
        closeTimerRef.current,
      )

      closeTimerRef.current = null
    }

    setMobilePanel('main')

    setMenuMounted(true)

    /*
     * Two animation frames ensure the browser
     * paints the closed state before transitioning.
     */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOpen(true)
      })
    })
  }

  /* ----------------------------------------------------------
     MENU CLOSE
     ---------------------------------------------------------- */

  function closeMenu() {
    setOpen(false)

    /*
     * Keep the menu mounted while CSS performs
     * the reverse fade + slide animation.
     */
    closeTimerRef.current =
      window.setTimeout(() => {
        setMenuMounted(false)
        setMobilePanel('main')

        closeTimerRef.current =
          null
      }, 620)
  }

  function toggleMenu() {
    if (
      menuMounted &&
      open
    ) {
      closeMenu()
      return
    }

    openMenu()
  }

  /* ----------------------------------------------------------
     MOBILE SUBMENU
     ---------------------------------------------------------- */

  function openMobileSubmenu(
    index: number,
  ) {
    setActive(index)

    requestAnimationFrame(() => {
      setMobilePanel('submenu')
    })
  }

  function backToMobileMenu() {
    setMobilePanel('main')
  }

  /* ----------------------------------------------------------
     AUDIO FADE
     ---------------------------------------------------------- */

  async function fadeAudio(
    target: number,
    duration = 650,
  ) {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    const startVolume =
      audio.volume

    const started =
      performance.now()

    return new Promise<void>(
      (resolve) => {
        const frame = (
          now: number,
        ) => {
          const progress =
            Math.min(
              1,
              (now - started) /
                duration,
            )

          const eased =
            1 -
            Math.pow(
              1 - progress,
              3,
            )

          audio.volume =
            startVolume +
            (
              target -
              startVolume
            ) *
              eased

          if (progress < 1) {
            requestAnimationFrame(
              frame,
            )
          } else {
            resolve()
          }
        }

        requestAnimationFrame(
          frame,
        )
      },
    )
  }

  async function toggleAudio() {
    const audio =
      audioRef.current

    if (!audio) {
      return
    }

    if (!audioOn) {
      try {
        await audio.play()

        await fadeAudio(
          0.2,
          800,
        )

        setAudioOn(true)
        setAudioAvailable(true)
      } catch {
        setAudioAvailable(false)
      }

      return
    }

    await fadeAudio(
      0,
      450,
    )

    audio.pause()

    setAudioOn(false)
  }

  return (
    <>
      <header
        className={styles.header}
      >
        <div
          className={styles.bar}
        >
          <div
            className={
              styles.brandSide
            }
          >
            <Link
              href="/"
              className={
                styles.brand
              }
              onClick={closeMenu}
              aria-label="Afluma home"
            >
              <img
                src="/assets/brand/afluma-symbol.png"
                alt=""
                className={
                  styles.brandMark
                }
                draggable={false}
              />

              <span
                className={
                  styles.brandWord
                }
              >
                AFLUMA
              </span>
            </Link>

            <span
              className={
                styles.headerDivider
              }
              aria-hidden="true"
            />

            <button
              type="button"
              className={[
                styles.sound,
                audioOn
                  ? styles.soundActive
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={toggleAudio}
              aria-label={
                audioOn
                  ? 'Turn ambient sound off'
                  : 'Turn ambient sound on'
              }
              title={
                audioAvailable
                  ? 'Afluma ambient sound'
                  : 'Ambient audio unavailable'
              }
            >
              <span
                className={
                  styles.wave
                }
              >
                {Array.from({
                  length: 13,
                }).map(
                  (_, index) => (
                    <i
                      key={index}
                      style={
                        {
                          '--wave-index':
                            index,
                        } as CSSProperties
                      }
                    />
                  ),
                )}
              </span>
            </button>
          </div>

          <nav
            className={
              styles.desktopNav
            }
            aria-label="Primary"
          >
            <Link href="/services/">
              Services
            </Link>

            <Link href="/solutions/">
              Solutions
            </Link>

            <Link href="/industries/">
              Industries
            </Link>
          </nav>

          <div
            className={
              styles.actions
            }
          >
            <Link
              href="/start-project/"
              className={styles.cta}
              onClick={closeMenu}
            >
              <span>
                Start a project
              </span>

              <span
                aria-hidden="true"
              >
                ↗
              </span>
            </Link>

            <button
              type="button"
              className={[
                styles.menuToggle,
                open
                  ? styles.menuToggleOpen
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={toggleMenu}
              aria-expanded={open}
              aria-controls="afluma-navigation-menu"
            >
              <span
                className={
                  styles.menuText
                }
              >
                {open
                  ? 'Close'
                  : 'Menu'}
              </span>

              <span
                className={
                  styles.bars
                }
                aria-hidden="true"
              >
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/*
       * The header is fixed.
       * This spacer reserves its visual area
       * instead of letting the hero disappear underneath it.
       */}
      <div
        className={
          styles.headerSpacer
        }
        aria-hidden="true"
      />

      {menuMounted ? (
        <div
          id="afluma-navigation-menu"
          className={[
            styles.overlay,
            open
              ? styles.overlayOpen
              : styles.overlayClosing,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={!open}
        >
          <button
            type="button"
            className={
              styles.scrim
            }
            onClick={closeMenu}
            aria-label="Close menu"
            tabIndex={open ? 0 : -1}
          />

          <section
            className={
              styles.menuSurface
            }
          >
            <div
              className={
                styles.menuGlow
              }
              aria-hidden="true"
            />

            {/*
             * DESKTOP
             */}
            <div
              className={
                styles.desktopMenu
              }
            >
              <aside
                className={
                  styles.intro
                }
              >
                <div>
                  <span
                    className={
                      styles.eyebrow
                    }
                  >
                    Afluma
                  </span>

                  <h2>
                    Intelligence
                    <br />
                    with purpose.
                  </h2>

                  <p>
                    Intelligent digital
                    systems, automation
                    and operations
                    engineered for
                    measurable outcomes.
                  </p>
                </div>

                <div
                  className={
                    styles.introBottom
                  }
                >
                  <Link
                    href="/start-project/"
                    onClick={
                      closeMenu
                    }
                    className={
                      styles.menuProject
                    }
                  >
                    Start a conversation
                    <span>↗</span>
                  </Link>

                  <a
                    href="mailto:hello@afluma.com"
                    className={
                      styles.email
                    }
                  >
                    hello@afluma.com
                  </a>
                </div>
              </aside>

              <nav
                className={
                  styles.mainNavigation
                }
                aria-label="Afluma navigation"
              >
                <span
                  className={
                    styles.columnLabel
                  }
                >
                  Navigate Afluma
                </span>

                <div
                  className={
                    styles.navigationList
                  }
                >
                  {groups.map(
                    (
                      item,
                      index,
                    ) => (
                      <div
                        key={
                          item.label
                        }
                        className={[
                          styles.navigationRow,
                          active ===
                          index
                            ? styles.navigationRowActive
                            : '',
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(' ')}
                        onMouseEnter={() =>
                          setActive(
                            index,
                          )
                        }
                        onFocus={() =>
                          setActive(
                            index,
                          )
                        }
                        style={
                          {
                            '--row-index':
                              index,
                          } as CSSProperties
                        }
                      >
                        <span
                          className={
                            styles.number
                          }
                        >
                          {
                            item.number
                          }
                        </span>

                        <Link
                          href={
                            item.href
                          }
                          onClick={
                            closeMenu
                          }
                        >
                          {
                            item.label
                          }
                        </Link>

                        <span
                          className={
                            styles.rowArrow
                          }
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </nav>

              <aside
                className={
                  styles.context
                }
              >
                <span
                  className={
                    styles.columnLabel
                  }
                >
                  {
                    activeGroup.label
                  }
                </span>

                <div
                  key={
                    activeGroup.label
                  }
                  className={
                    styles.contextInner
                  }
                >
                  <p
                    className={
                      styles.contextDescription
                    }
                  >
                    {
                      activeGroup.description
                    }
                  </p>

                  <div
                    className={
                      styles.subNavigation
                    }
                  >
                    {activeGroup.children.map(
                      (
                        child,
                        index,
                      ) => (
                        <Link
                          key={
                            child.label
                          }
                          href={
                            child.href
                          }
                          onClick={
                            closeMenu
                          }
                          style={
                            {
                              '--item-delay':
                                `${index * 42}ms`,
                            } as CSSProperties
                          }
                        >
                          <span>
                            {
                              child.label
                            }
                          </span>

                          <span>
                            →
                          </span>
                        </Link>
                      ),
                    )}
                  </div>

                  <Link
                    href={
                      activeGroup.href
                    }
                    onClick={
                      closeMenu
                    }
                    className={
                      styles.viewAll
                    }
                  >
                    View all{' '}
                    {
                      activeGroup.label
                    }
                    <span>↗</span>
                  </Link>
                </div>
              </aside>
            </div>

            {/*
             * MOBILE
             *
             * Independent horizontal panel system.
             * Submenus no longer appear underneath
             * the primary menu.
             */}
            <div
              className={
                styles.mobileMenu
              }
            >
              <div
                className={
                  styles.mobileViewport
                }
              >
                <div
                  className={[
                    styles.mobileTrack,
                    mobilePanel ===
                    'submenu'
                      ? styles.mobileTrackSub
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {/*
                   * PANEL 1
                   */}
                  <section
                    className={
                      styles.mobilePanel
                    }
                  >
                    <div
                      className={
                        styles.mobilePanelInner
                      }
                    >
                      <span
                        className={
                          styles.mobileEyebrow
                        }
                      >
                        Navigate Afluma
                      </span>

                      <nav
                        className={
                          styles.mobileNavigation
                        }
                      >
                        {groups.map(
                          (
                            item,
                            index,
                          ) => (
                            <button
                              type="button"
                              key={
                                item.label
                              }
                              onClick={() =>
                                openMobileSubmenu(
                                  index,
                                )
                              }
                              className={
                                styles.mobileNavRow
                              }
                              style={
                                {
                                  '--row-index':
                                    index,
                                } as CSSProperties
                              }
                            >
                              <span
                                className={
                                  styles.mobileNumber
                                }
                              >
                                {
                                  item.number
                                }
                              </span>

                              <span
                                className={
                                  styles.mobileNavLabel
                                }
                              >
                                {
                                  item.label
                                }
                              </span>

                              <span
                                className={
                                  styles.mobileArrow
                                }
                              >
                                →
                              </span>
                            </button>
                          ),
                        )}
                      </nav>

                      <div
                        className={
                          styles.mobileBottom
                        }
                      >
                        <Link
                          href="/start-project/"
                          onClick={
                            closeMenu
                          }
                        >
                          Start a
                          conversation
                          <span>
                            ↗
                          </span>
                        </Link>

                        <a
                          href="mailto:hello@afluma.com"
                        >
                          hello@afluma.com
                        </a>
                      </div>
                    </div>
                  </section>

                  {/*
                   * PANEL 2
                   */}
                  <section
                    className={
                      styles.mobilePanel
                    }
                  >
                    <div
                      className={
                        styles.mobilePanelInner
                      }
                    >
                      <button
                        type="button"
                        className={
                          styles.mobileBack
                        }
                        onClick={
                          backToMobileMenu
                        }
                      >
                        <span>
                          ←
                        </span>

                        <span>
                          Back
                        </span>
                      </button>

                      <div
                        className={
                          styles.mobileSubHeader
                        }
                      >
                        <span>
                          {
                            activeGroup.number
                          }
                        </span>

                        <h2>
                          {
                            activeGroup.label
                          }
                        </h2>

                        <p>
                          {
                            activeGroup.description
                          }
                        </p>
                      </div>

                      <nav
                        className={
                          styles.mobileSubLinks
                        }
                      >
                        {activeGroup.children.map(
                          (
                            child,
                            index,
                          ) => (
                            <Link
                              key={
                                child.label
                              }
                              href={
                                child.href
                              }
                              onClick={
                                closeMenu
                              }
                              style={
                                {
                                  '--item-delay':
                                    `${index * 45}ms`,
                                } as CSSProperties
                              }
                            >
                              <span>
                                {
                                  child.label
                                }
                              </span>

                              <span>
                                ↗
                              </span>
                            </Link>
                          ),
                        )}
                      </nav>

                      <Link
                        className={
                          styles.mobileViewAll
                        }
                        href={
                          activeGroup.href
                        }
                        onClick={
                          closeMenu
                        }
                      >
                        Explore all{' '}
                        {
                          activeGroup.label
                        }

                        <span>
                          →
                        </span>
                      </Link>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <footer
              className={
                styles.menuFooter
              }
            >
              <span>
                Colombo · Sri Lanka
              </span>

              <nav>
                <Link
                  href="/company/about/"
                  onClick={closeMenu}
                >
                  About
                </Link>

                <Link
                  href="/careers/"
                  onClick={closeMenu}
                >
                  Careers
                </Link>

                <Link
                  href="/contact/"
                  onClick={closeMenu}
                >
                  Contact
                </Link>

                <Link
                  href="/insights/"
                  onClick={closeMenu}
                >
                  Insights
                </Link>
              </nav>

              <span>
                © 2026 Afluma
              </span>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  )
}