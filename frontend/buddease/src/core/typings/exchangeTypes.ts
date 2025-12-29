// exchangeTypes.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Snapshot, SnapshotData, SnapshotWithCriteria } from "@/core/snapshots/Snapshot";
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { Subscriber } from "@/core/subscribers/Subscriber";
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';

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

export type {
    ExchangeAttachment, ExchangeEntity, ExchangeExcludedFields,
    ExchangeIncludedFields, ExchangeK,
    ExchangeMeta, ExchangeRealtimeDataItem, ExchangeSnapshot,
    ExchangeSnapshotData,
    ExchangeSnapshotStore,
    ExchangeSubscriber,
    OrderBookEntity,
    OrderBookSnapshot
};

