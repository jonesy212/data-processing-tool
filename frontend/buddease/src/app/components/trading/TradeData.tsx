// TradeData.tsx
import React from 'react';
import { CommonData, Customizations } from '../models/CommonDetails';
import CommonDetails from '../models/CommonData';

// Define the interface for TradeData
interface TradeDataProps {
  trade: TradeData;
}

// Define the TradeData interface extending the CommonData interface
interface TradeData extends CommonData<TradeData> {
  // Define specific properties for trade data here
  tradeId: string;
  tradeType: string;
  tradeAmount: number;
  tradeDate: Date;
  // Add more properties as needed
}

// Define any custom rendering for trade data properties if required
const customTradeDataRender: Customizations<TradeData> = {
  // Example customization for rendering trade type
  tradeType: (value) => (
    <div>
      <p>Trade Type:</p>
      <p>{value}</p>
    </div>
  ),
  // Add more customizations as needed
};

const TradeData: React.FC<TradeDataProps> = ({ trade }) => {
  return (
    <div>
      <h3>Trade Data</h3>
      {/* Render common details */}
      <CommonDetails data={trade} customizations={customTradeDataRender} />
      {/* Render specific trade-related details if needed */}
      <p>Trade ID: {trade.tradeId}</p>
      <p>Trade Amount: {trade.tradeAmount}</p>
      <p>Trade Date: {trade.tradeDate.toLocaleString()}</p>
      {/* Add more specific details rendering as needed */}
    </div>
  );
};

export default TradeData;
export type { TradeData };
