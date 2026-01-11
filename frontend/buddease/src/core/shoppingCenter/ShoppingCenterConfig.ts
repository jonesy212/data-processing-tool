ShoppingCenterConfig.ts
import type { ShippingOption } from "@/core/shoppingCenter/ShippingOption";
import type { AffiliateMarketingConfig } from "@/core/shoppingCenter/shopping_config/AffiliateMarketingConfig";

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
  