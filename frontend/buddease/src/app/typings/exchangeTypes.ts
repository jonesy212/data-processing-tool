// exchangeTypes.ts
import { Attachment } from '@/app/documents/Attachment/attachment';
import { RealtimeDataItem } from "@/app/models/realtime/RealtimeData";
import { Snapshot, SnapshotData, SnapshotStore, SnapshotWithCriteria } from "@/app/snapshots";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";

// Exchange-specific entity types
type ExchangeEntity = BaseDataEntity & {
  symbol: string;
  price: number;
  quantity: number;
  orderType: 'buy' | 'sell';
  timestamp: Date;
  exchange: string;
  // Exclude sensitive/internal fields
  internalId?: string;
  rawData?: any;
};

type ExchangeK = ExchangeEntity;
type ExchangeMeta = DefaultMeta<ExchangeEntity, ExchangeK> & {
  market: string;
  volume: number;
  spread: number;
  liquidity: number;
};
type ExchangeAttachment = Attachment;
type ExchangeExcludedFields = DefaultExcludedFields<ExchangeEntity> | 'internalId' | 'rawData';
type ExchangeIncludedFields = keyof ExchangeEntity;

// Core snapshot types for exchange data
type ExchangeSnapshot = Snapshot<ExchangeEntity, ExchangeK, ExchangeMeta, ExchangeAttachment, ExchangeExcludedFields, ExchangeIncludedFields>;
type ExchangeSnapshotData = SnapshotData<ExchangeEntity, ExchangeK, ExchangeMeta, ExchangeAttachment, ExchangeExcludedFields, ExchangeIncludedFields>;
type ExchangeSnapshotStore = SnapshotStore<ExchangeEntity, ExchangeK, ExchangeMeta, ExchangeAttachment, ExchangeExcludedFields, ExchangeIncludedFields>;
type ExchangeSnapshotWithCriteria = SnapshotWithCriteria<ExchangeEntity, ExchangeK, ExchangeMeta, ExchangeAttachment, ExchangeExcludedFields, ExchangeIncludedFields>;

// Exchange-specific subscriber
type ExchangeSubscriber = Subscriber<ExchangeEntity, ExchangeK, ExchangeMeta, ExchangeAttachment, ExchangeExcludedFields, ExchangeIncludedFields>;

// Real-time data types
type ExchangeRealtimeDataItem = RealtimeDataItem<ExchangeEntity, ExchangeK, ExchangeMeta, ExchangeAttachment, ExchangeExcludedFields, ExchangeIncludedFields>;

// Order book specific types
type OrderBookEntity = BaseDataEntity & {
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
  symbol: string;
  timestamp: Date;
  exchange: string;
  spread: number;
};

type OrderBookSnapshot = Snapshot<OrderBookEntity, OrderBookEntity, DefaultMeta<OrderBookEntity, OrderBookEntity>, Attachment, DefaultExcludedFields<OrderBookEntity>, keyof OrderBookEntity>;

export {
  ExchangeAttachment, ExchangeEntity, ExchangeExcludedFields,
  ExchangeIncludedFields, ExchangeK,
  ExchangeMeta, ExchangeSnapshot,
  ExchangeSnapshotData,
  ExchangeSnapshotStore,
  ExchangeSubscriber,
  OrderBookEntity,
  OrderBookSnapshot
};
