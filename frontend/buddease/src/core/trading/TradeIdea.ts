// TradeIdea.ts
import { FilterCriteria } from '@/core/pages/searches/FilterCriteria';
import { SearchCriteria } from "@/core/pages/searches/SearchCriteria";
import type { TradingStrategyOptions } from '@/core/trading/TradingStrategy';

enum FeedbackTradePhaseEnum {
  COLLECTION = 'collection',
  ANALYSIS = 'analysis',
  IMPLEMENTATION = 'implementation',
  REVIEW = 'review'
}

// Trade Idea Interface
interface TradeIdea {
  id?: string;
  title: string;
  description: string;
  symbol: string;
  tradeType: 'LONG' | 'SHORT' | 'SWING' | 'SCALP';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number; // 1-100
  marketAnalysis: string;
  criteria: FilterCriteria & SearchCriteria;
  tradingStrategy?: TradingStrategyOptions;
  marketData?: MarketData[];
  supportingData?: {
    technicalAnalysis: string;
    fundamentalAnalysis?: string;
    sentimentAnalysis?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  isPublic: boolean;
  tags?: string[];
  authorId?: string;
}


export type { FeedbackTradePhaseEnum, TradeIdea };

