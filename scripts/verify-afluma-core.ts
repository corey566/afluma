import { getPayload } from 'payload'
import config from '../payload.config'

const payload = await getPayload({ config })

const checks = await Promise.all([
  payload.count({ collection: 'agents' as never }),
  payload.count({ collection: 'leads' as never }),
  payload.count({ collection: 'agent-runs' as never }),
  payload.count({ collection: 'approval-requests' as never }),
  payload.count({ collection: 'audit-events' as never }),
])

const [agents, leads, runs, approvals, audits] = checks

console.log('Afluma Core v0.1 verification')
console.log({
  agents: agents.totalDocs,
  leads: leads.totalDocs,
  agentRuns: runs.totalDocs,
  approvalRequests: approvals.totalDocs,
  auditEvents: audits.totalDocs,
})

if (agents.totalDocs < 10) {
  console.error('Expected 10 registered agents. Run npm run core:seed.')
  process.exit(1)
}

console.log('Afluma Core v0.1 base collections are reachable.')
process.exit(0)
