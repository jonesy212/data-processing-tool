// apiWebBaseConfig.ts
import { ApiWebBaseEndpoints } from '@/app/typings/categories/ApiWebBaseEndpoints';

export const apiWebBaseConfig: ApiWebBaseEndpoints = {
  login: { path: "/login", method: "POST" },
  logout: { path: "/logout", method: "POST" },
  register: { path: "/register", method: "POST" },
  forgotPassword: { path: "/forgot-password", method: "POST" },
  resetPassword: { path: "/reset-password", method: "POST" },
  verifyEmail: { path: "/verify-email", method: "GET" },
  resendVerificationEmail: { path: "/resend-verification-email", method: "POST" },
};