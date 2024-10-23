import { TradingPlatform } from "../crypto/TradingPlatform";

interface TraderCallsProps {
    // Define props here, if any
    onSelectPlatform: (platform: TradingPlatform | null) => void; // Adjusted type to accept null
    selectedPlatform: TradingPlatform | null; // Adjusted type to accept null
}
  
export type { TraderCallsProps };
