import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { FounderCommandCenter } from '@/afluma-core/ui/FounderCommandCenter'

export const dynamic = 'force-dynamic'

export default async function AflumaCommandPage() {
  // v0.1 is intentionally localhost/development-only.
  // Do not expose founder metrics publicly.
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const payload = await getPayload({ config })

  const [
    newLeads,
    triagedLeads,
    awaitingYara,
    pendingApprovals,
    runningAgents,
    failedAgentRuns,
    registeredAgents,
  ] = await Promise.all([
    payload.count({
      collection: 'leads' as never,
      where: { stage: { equals: 'new' } } as never,
    }),
    payload.count({
      collection: 'leads' as never,
      where: { stage: { equals: 'triaged' } } as never,
    }),
    payload.count({
      collection: 'leads' as never,
      where: {
        and: [
          { stage: { equals: 'triaged' } },
          { assignedAgentId: { equals: 'agent.yara.halo' } },
        ],
      } as never,
    }),
    payload.count({
      collection: 'approval-requests' as never,
      where: { status: { equals: 'pending' } } as never,
    }),
    payload.count({
      collection: 'agent-runs' as never,
      where: { status: { equals: 'running' } } as never,
    }),
    payload.count({
      collection: 'agent-runs' as never,
      where: { status: { equals: 'failed' } } as never,
    }),
    payload.count({
      collection: 'agents' as never,
    }),
  ])

  return (
    <FounderCommandCenter
      metrics={{
        newLeads: newLeads.totalDocs,
        triagedLeads: triagedLeads.totalDocs,
        awaitingYara: awaitingYara.totalDocs,
        pendingApprovals: pendingApprovals.totalDocs,
        runningAgents: runningAgents.totalDocs,
        failedAgentRuns: failedAgentRuns.totalDocs,
        totalAgents: registeredAgents.totalDocs,
      }}
    />
  )
}
