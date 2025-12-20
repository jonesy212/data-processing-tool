// TradeData.tsx
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import CommonDetails from '@/app/models/CommonData';
import { CommonData, Customizations } from '@/app/models/CommonData';
import { Data, DataDetailsProps } from '@/app/models/data/Data';
import { DataAnalysisResult } from "@/app/projects/DataAnalysisPhase/DataAnalysisResult";
import { DetailsItemExtended } from '@/app/state/stores/DetailsListStore';
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { PhaseDefault } from '@/app/typings/phaseTypes';
import { Tag } from '@/app/models/tracker/Tag';
import React from 'react';

// Define the TradeData interface extending the CommonData interface
interface TradeData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  DataDetailsProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  uploadedAt: any;
  tradeId: string;
  tradeType: string;
  tradeAmount: number;
  tradeDate?: Date;
  phase?: PhaseDefault | null;
  isActive?: boolean;
  analysisType?: AnalysisTypeEnum;
  analysisResults?: DataAnalysisResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  updatedAt?: Date;
  data?: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Add more properties as needed
}

interface TradeDataProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  {
  trade: CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & { data: TradeData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> };
  details: DetailsItemExtended<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

}

// Ensure TradeDataWithCommon does not cause recursion
type TradeDataWithCommon = CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & TradeData;



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

const TradeDataComponent: React.FC<TradeDataProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = ({ trade, details }) => {
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
          date: new Date()
        }}
        details={{
          _id: tradeData._id,
          id: tradeData._id?.toString() || "",
          title: tradeData.title,
          description: tradeData.description,
          phase: tradeData.phase,
          date: tradeData.date,
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
            ? new Date(tradeData.uploadedAt)
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
