// TradeData.tsx
import React from 'react';
import { T, K, Meta} from "@/app/components/models/data/dataStoreMethods";
import CommonDetails from '../models/CommonData';
import { CommonData, Customizations } from '../models/CommonDetails';
import { Data, DataDetailsProps } from '../models/data/Data';
import { Tag } from '../models/tracker/Tag';
import { Phase } from '../phases/Phase';
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import { DetailsItemExtended } from '../state/stores/DetailsListStore';

// Define the TradeData interface extending the CommonData interface
interface TradeData 
extends CommonData<T, K, Meta, ExcludedFields>, DataDetailsProps<Data> {
  uploadedAt: any;
  tradeId: string;
  tradeType: string;
  tradeAmount: number;
  tradeDate?: Date;
  phase?: Phase;
  isActive?: boolean;
  analysisType?: AnalysisTypeEnum;
  analysisResults?: DataAnalysisResult<T>[];
  updatedAt?: Date;
  data?: Data<T>;
  
  // Add more properties as needed
}

interface TradeDataProps {
  trade: CommonData<T, K, Meta, ExcludedFields> & { data: TradeData };
  details: DetailsItemExtended<Data>;

}

// Ensure TradeDataWithCommon does not cause recursion
type TradeDataWithCommon = CommonData<T, K, Meta, ExcludedFields> & TradeData;



// Define any custom rendering for trade data properties if required
const customTradeDataRender: Customizations<TradeDataWithCommon> = {
  // Example customization for rendering trade type
  tradeType: (value) => (
    <div>
      <p>Trade Type:</p>
      <p>{value}</p>
    </div>
  ),
  // Add more customizations as needed
};

const TradeDataComponent: React.FC<TradeDataProps> = ({ trade, details }) => {
  const tradeData = trade.data
  return (
    <div>
      <h3>Trade Data</h3>
      {/* Render common details */}
      <CommonDetails
        data={{
          id: tradeData.id,
          type: "trade",
          title: "Trade Details",
          description: "Trade descriptions",
          details: tradeData.details,
          completed: !!tradeData.completed,
        }}
        details={{
          _id: tradeData._id,
          id: tradeData._id?.toString() || "",
          title: tradeData.title,
          description: tradeData.description,
          phase: tradeData.phase,
          isActive: tradeData.isActive,
          tags: 
            tradeData.tags
              ?.filter((tag): tag is Tag => typeof tag !== "string")
              .map((tag: Tag) => tag.getOptions().name) || [],
          status: tradeData.status,
          type: tradeData.type,
          analysisType: tradeData.analysisType,
          analysisResults: tradeData.analysisResults,
          updatedAt: tradeData.uploadedAt
            ? new Date(tradeData.uploadedAt
              

            )
            : new Date(),
        }}
        customizations={customTradeDataRender}
      />
      {/* Render specific trade-related details if needed */}
      <p>Trade ID: {tradeData.tradeId}</p>
      <p>Trade Amount: {tradeData.tradeAmount}</p>
      <p>Trade Date: {tradeData.tradeDate.toLocaleString()}</p>
      {/* Add more specific details rendering as needed */}
    </div>
  );
};

export default TradeDataComponent;
export type { TradeData };
