import { action, makeAutoObservable } from "mobx";
import { endpoints } from "@/app/api/ApiEndpoints";

const API_BASE_URL = endpoints.affiliateMarketing;

class AffiliateMarketingService {
  private static instance: AffiliateMarketingService;
  private affiliateCommissionRate: number;

  constructor() {
    makeAutoObservable(this);
    this.affiliateCommissionRate = getDefaultCommissionRate();
  }

  public static getInstance(): AffiliateMarketingService {
    if (!this.instance) {
      this.instance = new AffiliateMarketingService();
    }
    return this.instance;
  }

  @action
  public setCommissionRate(rate: number): void {
    this.affiliateCommissionRate = rate;
  }

  @action
  public getCommissionRate(): number {
    return this.affiliateCommissionRate;
  }

  @action
  public generateAffiliateLink(productId: string): string {
    const affiliateId = getUserId();
    return `${API_BASE_URL}/generate-link?product=${productId}&affiliateId=${affiliateId}`;
  }

  @action
  public trackReferralCommission(commissionAmount: number): void {
    recordCommission(commissionAmount);
  }

  @action
  public async fetchCommissionRate(): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/commission-rate`);
      const data = await response.json();
      return data.rate;
    } catch (error) {
      console.error("Error fetching commission rate:", error);
      return getDefaultCommissionRate(); // Return default rate on error
    }
  }

  @action
  public async updateCommissionRate(rate: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/update-commission-rate`, {
        method: "POST",
        body: JSON.stringify({ rate }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        this.setCommissionRate(rate);
      } else {
        console.error("Failed to update commission rate:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating commission rate:", error);
    }
  }
}

function getDefaultCommissionRate(): number {
  return 0.1;
}

function getUserId(): string {
  return "user123";
}

function recordCommission(commissionAmount: number): void {
  console.log("Commission recorded:", commissionAmount);
}

const affiliateMarketingService = new AffiliateMarketingService();

export { AffiliateMarketingService, affiliateMarketingService };
