// DonationsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface DonationsEndpoints {
  makeDonation: (userId: string, amount: number) => EndpointConfig;
  getDonationHistory: (userId: string) => EndpointConfig;
}