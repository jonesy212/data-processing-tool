// DonationsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface DonationsEndpoints extends EndpointCategoryConfig {
  makeDonation: (userId: string, amount: number) => EndpointConfig;
  getDonationHistory: (userId: string) => EndpointConfig;
}