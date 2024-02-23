// Define interfaces for advertisements and campaigns
interface Advertisement {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    // Add other properties as needed...
  }
  
  interface Campaign {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    advertisements: Advertisement[];
    // Add other properties as needed...
  }
  
  // Service to manage advertisements and campaigns
  class AdvertisementService {
    private advertisements: Advertisement[];
    private campaigns: Campaign[];
  
    constructor() {
      // Initialize advertisements and campaigns
      this.advertisements = [];
      this.campaigns = [];
    }
  
    // Add advertisement
    addAdvertisement(advertisement: Advertisement): void {
      this.advertisements.push(advertisement);
    }
  
    // Remove advertisement
    removeAdvertisement(advertisementId: string): void {
      this.advertisements = this.advertisements.filter(ad => ad.id !== advertisementId);
    }
  
    // Get all advertisements
    getAllAdvertisements(): Advertisement[] {
      return this.advertisements;
    }
  
    // Add campaign
    addCampaign(campaign: Campaign): void {
      this.campaigns.push(campaign);
    }
  
    // Remove campaign
    removeCampaign(campaignId: string): void {
      this.campaigns = this.campaigns.filter(camp => camp.id !== campaignId);
    }
  
    // Get all campaigns
    getAllCampaigns(): Campaign[] {
      return this.campaigns;
    }
  
    // Get campaign by ID
    getCampaignById(campaignId: string): Campaign | undefined {
      return this.campaigns.find(camp => camp.id === campaignId);
    }
  
    // Add advertisement to campaign
    addAdvertisementToCampaign(campaignId: string, advertisement: Advertisement): void {
      const campaign = this.getCampaignById(campaignId);
      if (campaign) {
        campaign.advertisements.push(advertisement);
      }
    }
  
    // Remove advertisement from campaign
    removeAdvertisementFromCampaign(campaignId: string, advertisementId: string): void {
      const campaign = this.getCampaignById(campaignId);
      if (campaign) {
        campaign.advertisements = campaign.advertisements.filter(ad => ad.id !== advertisementId);
      }
    }
  }
  
  // Usage:
  const advertisementService = new AdvertisementService();
  
  // Add advertisements
  const ad1: Advertisement = { id: "1", title: "Ad 1", description: "Description 1", imageUrl: "image1.jpg" };
  advertisementService.addAdvertisement(ad1);
  
  const ad2: Advertisement = { id: "2", title: "Ad 2", description: "Description 2", imageUrl: "image2.jpg" };
  advertisementService.addAdvertisement(ad2);
  
  // Get all advertisements
  const allAds = advertisementService.getAllAdvertisements();
  console.log(allAds);
  
  // Create a campaign
  const campaign1: Campaign = {
    id: "campaign1",
    title: "Campaign 1",
    description: "Campaign Description 1",
    startDate: new Date(),
    endDate: new Date(),
    advertisements: []
  };
  
  // Add advertisements to campaign
  advertisementService.addAdvertisementToCampaign(campaign1.id, ad1);
  advertisementService.addAdvertisementToCampaign(campaign1.id, ad2);
  
  // Get campaign by ID
  const retrievedCampaign = advertisementService.getCampaignById(campaign1.id);
  console.log(retrievedCampaign);
  
  // Remove advertisement from campaign
  advertisementService.removeAdvertisementFromCampaign(campaign1.id, ad1.id);
  
  // Remove advertisements
  advertisementService.removeAdvertisement(ad1.id);
  advertisementService.removeAdvertisement(ad2.id);
  