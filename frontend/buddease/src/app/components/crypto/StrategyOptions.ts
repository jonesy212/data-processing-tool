// StrategyOptions.ts

import TradingStrategy from "./TradingStrategy";

const initialCapital: number = 10000; // Example value
// Now you can use strategyOptions in your code
const tradingStrategy = new TradingStrategy(
  {
    entryThreshold: 0.7,
    exitThreshold: 0.3,
    ...strategyOptions,
  },
  initialCapital
);

export { tradingStrategy };
