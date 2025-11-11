import { CryptoManagementCriteria } from '@/app/pages/searches/CriteriaOptions'

export interface InvestmentStrategy {
  id?: string;
  name: string;
  description: string;
  criteria: CryptoManagementCriteria;
  targetAssets: string[];
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
  allocation: Record<string, number>; // Asset -> percentage
  rebalancingSchedule: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  stopLoss?: number; // Percentage
  takeProfit?: number; // Percentage
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
}