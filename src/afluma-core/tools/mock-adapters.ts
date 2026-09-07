import type { EmailAdapter, PaymentAdapter } from './types'

export const mockEmailAdapter: EmailAdapter = {
  async send(input, context) {
    console.info('[Afluma MockEmail]', { input, context })
    return { id: `mock-email-${crypto.randomUUID()}`, status: 'mocked' }
  },
}

export const mockPaymentAdapter: PaymentAdapter = {
  async createInvoice(input, context) {
    console.info('[Afluma MockPayment]', { input, context })
    return { invoiceId: `mock-invoice-${crypto.randomUUID()}`, status: 'mocked' }
  },
}
