export type ToolContext = {
  agentId: string
  correlationId: string
  tenantId?: string
  approved?: boolean
}

export interface EmailAdapter {
  send(input: { to: string; subject: string; text: string }, context: ToolContext): Promise<{ id: string; status: 'mocked' | 'sent' }>
}

export interface PaymentAdapter {
  createInvoice(input: { currency: string; amount: number; description: string; customerRef?: string }, context: ToolContext): Promise<{ invoiceId: string; status: 'mocked' | 'created' }>
}
