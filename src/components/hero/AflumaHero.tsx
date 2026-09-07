import Link from 'next/link'
import styles from './AflumaHero.module.css'

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

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M4 10h11M11 6l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Spark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2c.7 5.7 4.3 9.3 10 10-5.7.7-9.3 4.3-10 10-.7-5.7-4.3-9.3-10-10 5.7-.7 9.3-4.3 10-10Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function AflumaHero() {
  return (
    <section
      className={styles.heroSection}
      aria-labelledby="afluma-home-hero-title"
    >
      <div className={styles.heroFrame}>

        {/* Responsive hero artwork */}
        <picture className={styles.heroPicture} aria-hidden="true">
          <source
            media="(min-width: 1024px)"
            srcSet="/hero/hero-desktop.png"
          />

          <source
            media="(min-width: 768px)"
            srcSet="/hero/hero-tablet.png"
          />

          <img
            src="/hero/hero-mobile.png"
            alt=""
            className={styles.heroImage}
          />
        </picture>

        {/* Readability / atmosphere */}
        <div className={styles.desktopOverlay} aria-hidden="true" />
        <div className={styles.desktopGlow} aria-hidden="true" />
        <div className={styles.tabletOverlay} aria-hidden="true" />
        <div className={styles.mobileOverlay} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />

        {/* Desktop */}
        <div className={styles.desktopContent}>
          <div className={styles.desktopCopy}>

            <div className={styles.eyebrow}>
              <span className={styles.spark}>
                <Spark />
              </span>

              <span>Afluma / Autonomous AI company</span>
            </div>

            <h1
              id="afluma-home-hero-title"
              className={styles.desktopTitle}
            >
              A workforce
              <br />
              built from
              <br />
              intelligence.
            </h1>

            <p className={styles.desktopDescription}>
              Afluma is building persistent AI coworkers that communicate,
              collaborate and perform real work across a company under
              human governance.
            </p>

            <div className={styles.actions}>
              <Link href="/workforce/" className={styles.primaryButton}>
                <span>Meet the workforce</span>

                <span className={styles.buttonIcon}>
                  <ArrowUpRight />
                </span>
              </Link>

              <Link href="/proof/afluma-runs-on-afluma/" className={styles.secondaryButton}>
                <span>See how Afluma works</span>

                <span className={styles.secondaryIcon}>
                  <ArrowRight />
                </span>
              </Link>
            </div>

            <div className={styles.capabilityRail}>
              <span className={styles.capabilityLabel}>
                Built around
              </span>

              <div className={styles.capabilityList}>
                <span>AI workforce</span>
                <span>AgenticOS</span>
                <span>SerenOps</span>
                <span>Commerce</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop side information */}
        <aside
          className={styles.desktopCards}
          aria-label="Afluma platform and development status"
        >
          <div className={styles.featureCard}>
            <div className={styles.cardTop}>
              <span>01 / In development</span>

              <span className={styles.cardSpark}>
                <Spark />
              </span>
            </div>

            <h2>Afluma runs on Afluma</h2>

            <p>
              Our first proving ground is our own company, where digital
              coworkers are being built to perform real operational work.
            </p>
          </div>

          <Link href="/platform/agenticos/" className={styles.miniCard}>
            <div>
              <span>02 / Core platform</span>
              <strong>AgenticOS</strong>
            </div>

            <span className={styles.miniArrow}>
              <ArrowUpRight />
            </span>
          </Link>
        </aside>

        {/* Tablet */}
        <div className={styles.tabletContent}>
          <div className={styles.tabletCopy}>

            <div className={styles.eyebrow}>
              <span className={styles.spark}>
                <Spark />
              </span>

              <span>Afluma / Autonomous AI company</span>
            </div>

            <h1 className={styles.tabletTitle}>
              A workforce
              <br />
              built from
              <br />
              intelligence.
            </h1>

            <p className={styles.tabletDescription}>
              Persistent AI coworkers designed to communicate,
              collaborate and perform real work under human governance.
            </p>

            <div className={styles.tabletActions}>
              <Link href="/workforce/" className={styles.primaryButton}>
                <span>Meet the workforce</span>

                <span className={styles.buttonIcon}>
                  <ArrowUpRight />
                </span>
              </Link>

              <Link href="/proof/afluma-runs-on-afluma/" className={styles.tabletSecondary}>
                See how Afluma works

                <span>
                  <ArrowRight />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className={styles.mobileContent}>
          <div className={styles.mobileCopy}>

            <div className={styles.mobileEyebrow}>
              <span className={styles.spark}>
                <Spark />
              </span>

              <span>Afluma / Autonomous AI company</span>
            </div>

            <h1 className={styles.mobileTitle}>
              A workforce
              <br />
              built from
              <br />
              intelligence.
            </h1>

            <p className={styles.mobileDescription}>
              Persistent AI coworkers designed to communicate,
              collaborate and perform real work.
            </p>

            <Link href="/workforce/" className={styles.mobilePrimary}>
              <span>Meet the workforce</span>

              <span>
                <ArrowUpRight />
              </span>
            </Link>

            <Link href="/proof/afluma-runs-on-afluma/" className={styles.mobileSecondary}>
              <span>See it working</span>

              <span>
                <ArrowRight />
              </span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}