export type FounderCommandMetrics = {
  newLeads: number
  triagedLeads: number
  awaitingYara: number
  pendingApprovals: number
  runningAgents: number
  failedAgentRuns: number
  totalAgents: number
}

export function FounderCommandCenter({
  metrics,
}: {
  metrics: FounderCommandMetrics
}) {
  const cards = [
    ['New leads', metrics.newLeads],
    ['Triaged leads', metrics.triagedLeads],
    ['Awaiting Yara', metrics.awaitingYara],
    ['Pending approvals', metrics.pendingApprovals],
    ['Running agent tasks', metrics.runningAgents],
    ['Failed agent tasks', metrics.failedAgentRuns],
    ['Registered agents', metrics.totalAgents],
  ] as const

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#090b10',
        color: '#f7f7f5',
        padding: '48px',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <header style={{ marginBottom: 36 }}>
          <p
            style={{
              textTransform: 'uppercase',
              letterSpacing: '.18em',
              opacity: 0.62,
              fontSize: 12,
            }}
          >
            Afluma internal · development
          </p>
          <h1 style={{ fontSize: 48, margin: '10px 0 8px' }}>
            Founder Command Center
          </h1>
          <p style={{ opacity: 0.72, maxWidth: 760, lineHeight: 1.6 }}>
            The first operating surface for Afluma Core and AgenticOS.
            This route is intentionally disabled in production until
            authenticated founder access is implemented.
          </p>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {cards.map(([label, value]) => (
            <article
              key={label}
              style={{
                border: '1px solid #2b303b',
                borderRadius: 18,
                padding: 22,
                background: '#10131a',
              }}
            >
              <small style={{ opacity: 0.65 }}>{label}</small>
              <strong
                style={{
                  display: 'block',
                  fontSize: 36,
                  marginTop: 8,
                }}
              >
                {value}
              </strong>
            </article>
          ))}
        </section>

        <section
          style={{
            marginTop: 28,
            border: '1px solid #2b303b',
            borderRadius: 18,
            padding: 24,
            background: '#10131a',
          }}
        >
          <h2 style={{ marginTop: 0 }}>v0.1 operating loop</h2>
          <p style={{ lineHeight: 1.8, opacity: 0.8 }}>
            Website enquiry → Payload Enquiry → AgenticOS job queue →
            Mei intake → Contact / Organization / Lead → Yara or Esme
            routing → audit trail.
          </p>
        </section>
      </div>
    </main>
  )
}
