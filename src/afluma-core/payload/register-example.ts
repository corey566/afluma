/**
 * EXAMPLE ONLY — merge these imports into the real payload.config.ts after auditing it.
 * Do not replace an existing `collections` array blindly.
 */
import {
  Organizations,
  Contacts,
  Leads,
  AgentRuns,
  ApprovalRequests,
  AuditEvents,
  KnowledgeDocuments,
} from './collections'
import { processMeiLeadIntake } from '../jobs'

export const aflumaCoreCollections = [
  Organizations,
  Contacts,
  Leads,
  AgentRuns,
  ApprovalRequests,
  AuditEvents,
  KnowledgeDocuments,
]

export const aflumaCoreJobs = {
  tasks: [processMeiLeadIntake],
}
