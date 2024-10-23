// RiskAssessmentPage.tsx
import React from 'react';
import ArbitrageRiskManager, { ArbitrageTrade, RiskManagementOptions } from '@/app/components/phases/crypto/riskManagement';
import { RiskAssessmentProps } from '@/app/components/phases/crypto/RiskAssessment';

const RiskAssessmentPage: React.FC<RiskAssessmentProps> = () => {
  const riskManagementOptions: RiskManagementOptions = {
    maxTransactionCost: 2, // 2% maximum transaction cost
    maxVolatility: 1.5, // 1.5% maximum volatility
  };

  const riskManager = new ArbitrageRiskManager(riskManagementOptions);

  const trade: ArbitrageTrade = {
    symbol: 'BTC/USD',
    buyExchange: 'Exchange A',
    sellExchange: 'Exchange B',
    buyPrice: 50000,
    sellPrice: 50500,
    quantity: 1,
  };

  const risks = riskManager.assessRisk(trade);

  const handleRiskAssessmentComplete = () => {
    console.log('Risk assessment completed');
    // Additional logic on risk assessment completion
  };

  return (
    <div>
      <h2>Risk Assessment Page</h2>
      <p>Risk assessment for trade:</p>
      <pre>{JSON.stringify(trade, null, 2)}</pre>
      <p>Identified Risks:</p>
      <ul>
        {risks.length === 0 ? (
          <li>No risks identified</li>
        ) : (
            risks.map((risk: string, index: number) => <li key={index}>{risk}</li>)
        )}
      </ul>
      <RiskAssessmentPage onComplete={handleRiskAssessmentComplete} />
    </div>
  );
};

export default RiskAssessmentPage;
