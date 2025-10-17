// paymentConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { PaymentEndpoints } from '@/app/typings/categories/PaymentEndpoints';

export const paymentConfig: PaymentEndpoints = {
  initiatePayment: { path: `${BASE_URL}/api/payment/initiate`, method: "POST" },
  verifyPayment: { path: `${BASE_URL}/api/payment/verify`, method: "POST" },
  cancelPayment: { path: `${BASE_URL}/api/payment/cancel`, method: "POST" },
  processRefund: { path: `${BASE_URL}/api/payment/refund`, method: "POST" },
  getPaymentStatus: { path: `${BASE_URL}/api/payment/status`, method: "GET" },
  addPaymentMethod: { path: `${BASE_URL}/api/payment/method/add`, method: "POST" },
  removePaymentMethod: { path: `${BASE_URL}/api/payment/method/remove`, method: "DELETE" },
  updatePaymentMethod: { path: `${BASE_URL}/api/payment/method/update`, method: "PUT" },
  listPaymentMethods: { path: `${BASE_URL}/api/payment/methods`, method: "GET" },
  getUserPayments: { path: `${BASE_URL}/api/payment/user`, method: "GET" },
  getPaymentDetails: (paymentId: string) => ({ path: `${BASE_URL}/api/payment/${paymentId}`, method: "GET" }),
  generateInvoice: { path: `${BASE_URL}/api/payment/invoice/generate`, method: "POST" },
  sendInvoice: { path: `${BASE_URL}/api/payment/invoice/send`, method: "POST" },
  viewInvoice: { path: `${BASE_URL}/api/payment/invoice/view`, method: "GET" },
  trackInvoice: { path: `${BASE_URL}/api/payment/invoice/track`, method: "GET" },
  markInvoicePaid: { path: `${BASE_URL}/api/payment/invoice/mark-paid`, method: "POST" },
  updateInvoiceStatus: { path: `${BASE_URL}/api/payment/invoice/update-status`, method: "PUT" },
  getInvoiceHistory: { path: `${BASE_URL}/api/payment/invoice/history`, method: "GET" },
};