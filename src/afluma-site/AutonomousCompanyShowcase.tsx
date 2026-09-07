import Link from 'next/link'
import styles from './AutonomousCompanyShowcase.module.css'

type AutonomousCompanyShowcaseProps = {
  image: string
}

export function AutonomousCompanyShowcase({
  image,
}: AutonomousCompanyShowcaseProps) {
  return (
    <section className={styles.section}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div className={styles.headingBlock}>
            <span className={styles.eyebrow}>
              <span className={styles.dot} />
              How Afluma works
            </span>

            <h2>
              A company designed
              <br />
              to operate with
              <br />
              <span>intelligence.</span>
            </h2>
          </div>

          <div className={styles.intro}>
            <p>
              Afluma combines persistent AI coworkers, a shared AI
              operating layer, infrastructure intelligence and AI-native
              business products into one governed operating model.
            </p>

            <div className={styles.statusLine}>
              <span>Digital workforce</span>
              <span>AgenticOS</span>
              <span>Human governed</span>
            </div>
          </div>
        </div>

        <div className={styles.composition}>
          <Link href="/workforce/" className={styles.visual}>
            <img
              src={image}
              alt="Afluma digital workforce concept"
            />

            <div className={styles.visualShade} />

            <div className={styles.visualTop}>
              <span>01 / Digital workforce</span>
              <span className={styles.status}>In development</span>
            </div>

            <div className={styles.visualBottom}>
              <p>
                Persistent digital coworkers with defined identities,
                responsibilities, memory and approved capabilities.
              </p>

              <span className={styles.visualLink}>
                Meet the workforce {'\u2197'}
              </span>
            </div>
          </Link>

          <div className={styles.right}>
            <div className={styles.statement}>
              <span className={styles.microLabel}>
                One connected company model
              </span>

              <p>
                Conversation is only the interface.
                <strong> Work is the product.</strong>
                {' '}The goal is a workforce that can retain context,
                coordinate across roles and perform bounded operational
                work without removing human accountability.
              </p>
            </div>

            <div className={styles.cardGrid}>
              <Link
                href="/platform/agenticos/"
                className={`${styles.systemCard} ${styles.agenticCard}`}
              >
                <div className={styles.cardTop}>
                  <span>02 / Core platform</span>
                  <span>{'\u2197'}</span>
                </div>

                <div>
                  <strong>AgenticOS</strong>
                  <p>
                    Memory, knowledge, tasks, events, models,
                    permissions and collaboration.
                  </p>
                </div>
              </Link>

              <Link
                href="/products/serenops/"
                className={`${styles.systemCard} ${styles.serenCard}`}
              >
                <div className={styles.cardTop}>
                  <span>03 / Infrastructure</span>
                  <span>{'\u2197'}</span>
                </div>

                <div>
                  <strong>SerenOps</strong>
                  <p>
                    AI-native infrastructure intelligence with
                    controlled execution and verification.
                  </p>
                </div>
              </Link>

              <Link
                href="/products/afluma-commerce/"
                className={`${styles.systemCard} ${styles.commerceCard}`}
              >
                <div className={styles.cardTop}>
                  <span>04 / Business system</span>
                  <span>{'\u2197'}</span>
                </div>

                <div>
                  <strong>Afluma Commerce</strong>
                  <p>
                    An AI-native commerce environment where the
                    workforce can help operate a real business.
                  </p>
                </div>
              </Link>

              <div className={styles.governanceCard}>
                <div>
                  <span className={styles.governanceIcon}>
                    {'\u2726'}
                  </span>

                  <span>Human governance</span>
                </div>

                <p>
                  Autonomous does not mean uncontrolled. Important
                  actions remain permissioned, observable and
                  accountable.
                </p>
              </div>
            </div>

            <div className={styles.footer}>
              <span>
                Afluma runs on Afluma first.
              </span>

              <Link href="/proof/afluma-runs-on-afluma/">
                See the proving ground {'\u2192'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}