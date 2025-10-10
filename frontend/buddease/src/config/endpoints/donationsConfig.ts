// donationsConfig.ts
import { DonationsEndpoints } from '../types/categories/DonationsEndpoints';
import { BASE_URL } from './baseUrl';

export const donationsConfig: DonationsEndpoints = {
  makeDonation: (userId: string, amount: number) => ({ 
    path: `${BASE_URL}/api/donations/make-donation/${userId}/${amount}`, 
    method: "POST" 
  }),
  getDonationHistory: (userId: string) => ({ 
    path: `${BASE_URL}/api/donations/donation-history/${userId}`, 
    method: "GET" 
  }),
};