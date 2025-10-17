// donationsConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { DonationsEndpoints } from '@/app/typings/categories/DonationsEndpoints';

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