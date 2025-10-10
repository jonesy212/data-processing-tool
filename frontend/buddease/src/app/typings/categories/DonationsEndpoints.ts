// DonationsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface DonationsEndpoints {
  makeDonation: (userId: string, amount: number) => EndpointConfig;
  getDonationHistory: (userId: string) => EndpointConfig;
}