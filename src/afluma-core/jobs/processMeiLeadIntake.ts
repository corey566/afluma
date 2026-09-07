import type { TaskConfig } from 'payload'

import {
  analyzeMeiIntake,
  type MeiIntakeInput,
} from '../intake/mei'
import { ModelRouter } from '../model-router/router'
import { OllamaProvider } from '../model-router/ollama'
import { RuleBasedProvider } from '../model-router/rule-based'

export const processMeiLeadIntake: TaskConfig<'processMeiLeadIntake'> = {
  slug: 'processMeiLeadIntake',
  retries: 2,

  inputSchema: [
    { name: 'enquiryId', type: 'text', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'enquiryType', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    { name: 'consent', type: 'checkbox' },
  ],

  handler: async ({ input, req }) => {
    const startedAt = Date.now()
    const correlationId = crypto.randomUUID()

    const typedInput = {
      ...(input as unknown as MeiIntakeInput),
      enquiryId: String((input as { enquiryId: string }).enquiryId),
      source: 'website' as const,
    }

    // Job retries and admin re-runs must not create duplicate leads.
    const existingLead = await req.payload.find({
      collection: 'leads',
      limit: 1,
      overrideAccess: true,
      where: {
        sourceEnquiryId: {
          equals: typedInput.enquiryId,
        },
      } as never,
    })

    if (existingLead.docs[0]?.id) {
      return {
        output: {
          correlationId,
          leadId: existingLead.docs[0].id,
          route: 'existing',
          idempotent: true,
        },
      }
    }

    const run = await req.payload.create({
      collection: 'agent-runs',
      data: {
        correlationId,
        agentId: 'agent.mei.nova',
        capability: 'reasoning.business',
        status: 'running',
        input: typedInput,
      } as never,
      overrideAccess: true,
    })

    const router = new ModelRouter([
      new OllamaProvider({
        enabled: process.env.AFLUMA_OLLAMA_ENABLED === 'true',
        modelByCapability: {
          'reasoning.business':
            process.env.AFLUMA_REASONING_MODEL ?? 'qwen3:4b',
        },
      }),
      // Zero-cost fallback keeps the company workflow functional
      // before Ollama or a larger local model is installed.
      new RuleBasedProvider(),
    ])

    try {
      const routed = await analyzeMeiIntake(router, typedInput)
      const result = routed.analysis

      let organizationId: string | number | undefined

      if (typedInput.company?.trim()) {
        const companyName = typedInput.company.trim()

        const organizations = await req.payload.find({
          collection: 'organizations',
          limit: 1,
          overrideAccess: true,
          where: {
            name: {
              equals: companyName,
            },
          } as never,
        })

        organizationId = organizations.docs[0]?.id

        if (!organizationId) {
          const organization = await req.payload.create({
            collection: 'organizations',
            data: {
              name: companyName,
              status: 'prospect',
            } as never,
            overrideAccess: true,
          })

          organizationId = organization.id
        }
      }

      const contacts = await req.payload.find({
        collection: 'contacts',
        limit: 1,
        overrideAccess: true,
        where: {
          email: {
            equals: typedInput.email,
          },
        } as never,
      })

      let contactId = contacts.docs[0]?.id

      if (!contactId) {
        const contact = await req.payload.create({
          collection: 'contacts',
          data: {
            name: typedInput.name,
            email: typedInput.email,
            phone: typedInput.phone,
            organization: organizationId,
            source: 'website',
            consentToContact: Boolean(typedInput.consent),
          } as never,
          overrideAccess: true,
        })

        contactId = contact.id
      }

      const lead = await req.payload.create({
        collection: 'leads',
        data: {
          subject:
            `${typedInput.company || typedInput.name}: ` +
            `${result.businessNeed || typedInput.enquiryType || 'Enquiry'}`,
          contact: contactId,
          organization: organizationId,
          sourceEnquiryId: typedInput.enquiryId,
          stage: 'triaged',
          priority:
            result.urgency === 'high'
              ? 'high'
              : result.urgency === 'low'
                ? 'low'
                : 'normal',
          assignedAgentId: result.recommendedNextAgent,
          businessNeed: result.businessNeed,
          aiSummary: result.summary,
          missingInformation: result.missingInformation,
          safetyFlags: result.safetyFlags,
          triageProvider: routed.provider,
          triageModel: routed.model,
        } as never,
        overrideAccess: true,
      })

      await req.payload.create({
        collection: 'audit-events',
        data: {
          eventType: 'lead.intake.triaged',
          actorType: 'agent',
          actorId: 'agent.mei.nova',
          correlationId,
          targetType: 'lead',
          targetId: String(lead.id),
          summary: result.summary,
          metadata: {
            enquiryId: typedInput.enquiryId,
            route: result.recommendedNextAgent,
            provider: routed.provider,
            model: routed.model,
          },
        } as never,
        overrideAccess: true,
      })

      await req.payload.update({
        collection: 'agent-runs',
        id: run.id,
        data: {
          status: 'completed',
          output: result,
          provider: routed.provider,
          model: routed.model,
          durationMs: Date.now() - startedAt,
        } as never,
        overrideAccess: true,
      })

      return {
        output: {
          correlationId,
          leadId: lead.id,
          route: result.recommendedNextAgent,
          provider: routed.provider,
          model: routed.model,
          idempotent: false,
        },
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown Mei intake failure'

      await req.payload.update({
        collection: 'agent-runs',
        id: run.id,
        data: {
          status: 'failed',
          error: message,
          durationMs: Date.now() - startedAt,
        } as never,
        overrideAccess: true,
      })

      await req.payload.create({
        collection: 'audit-events',
        data: {
          eventType: 'lead.intake.failed',
          actorType: 'agent',
          actorId: 'agent.mei.nova',
          correlationId,
          targetType: 'enquiry',
          targetId: typedInput.enquiryId,
          summary: message,
        } as never,
        overrideAccess: true,
      })

      throw error
    }
  },
}

