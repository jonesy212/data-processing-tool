// donationsConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { DonationsEndpoints } from '@/core/typings/categories/DonationsEndpoints';

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