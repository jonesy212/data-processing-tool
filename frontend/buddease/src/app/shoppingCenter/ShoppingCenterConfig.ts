// ShoppingCenterConfig.ts
import { ShippingOption } from "@/app/shoppingCenter/ShippingOption";
import { AffiliateMarketingConfig } from "@/app/shoppingCenter/shopping_config/AffiliateMarketingConfig";

interface ShoppingCenterConfig {
    name: string;
    description: string;
    logoUrl?: string;
    productCategories?: string[];
    shippingOptions?: ShippingOption[];
    affiliateMarketing?: AffiliateMarketingConfig;
    // Add more configuration options as needed
  }
  
  
  
  export default ShoppingCenterConfig;
  