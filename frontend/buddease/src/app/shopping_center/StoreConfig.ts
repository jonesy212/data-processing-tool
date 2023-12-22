import { ShippingOption } from "./ShippingOption";
import { AffiliateMarketingConfig } from "./shopping_config/AffiliateMarketingConfig";

// StoreConfig.ts
interface StoreConfig {
    name: string;
    description: string;
    logoUrl?: string;
    productCategories?: string[];
    shippingOptions?: ShippingOption[];
    affiliateMarketing?: AffiliateMarketingConfig;
    // Add more configuration options as needed
  }
  
  
  
  export default StoreConfig;
  