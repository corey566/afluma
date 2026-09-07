import { getPayload } from 'payload'
import config from '../payload.config'
import { agents } from '../src/afluma-core/agents/registry'

const payload = await getPayload({ config })

for (const agent of agents) {
  const existing = await payload.find({
    collection: 'agents' as never,
    limit: 1,
    overrideAccess: true,
    where: {
      agentId: {
        equals: agent.id,
      },
    } as never,
  })

  const data = {
    agentId: agent.id,
    name: agent.name,
    role: agent.role,
    mission: agent.mission,
    status: 'development',
    authorityLevel: agent.defaultAuthority,
    capabilities: [...agent.capabilities],
    publicPersona: agent.publicPersona,
    disclosure: agent.disclosure,
    canWriteLongTermMemory: agent.canWriteLongTermMemory,
    escalationAgentIds: [...agent.escalationAgentIds],
  }

  if (existing.docs[0]?.id) {
    await payload.update({
      collection: 'agents' as never,
      id: existing.docs[0].id,
      data: data as never,
      overrideAccess: true,
    })
  } else {
    await payload.create({
      collection: 'agents' as never,
      data: data as never,
      overrideAccess: true,
    })
  }
}

console.log(`Afluma Core: synchronized ${agents.length} agent definitions.`)
process.exit(0)
