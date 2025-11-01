// PaymentEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface PaymentEndpoints extends EndpointCategoryConfig {
  initiatePayment: EndpointConfig;
  verifyPayment: EndpointConfig;
  cancelPayment: EndpointConfig;
  processRefund: EndpointConfig;
  getPaymentStatus: EndpointConfig;
  addPaymentMethod: EndpointConfig;
  removePaymentMethod: EndpointConfig;
  updatePaymentMethod: EndpointConfig;
  listPaymentMethods: EndpointConfig;
  getUserPayments: EndpointConfig;
  getPaymentDetails: (paymentId: string) => EndpointConfig;
  generateInvoice: EndpointConfig;
  sendInvoice: EndpointConfig;
  viewInvoice: EndpointConfig;
  trackInvoice: EndpointConfig;
  markInvoicePaid: EndpointConfig;
  updateInvoiceStatus: EndpointConfig;
  getInvoiceHistory: EndpointConfig;
}