// convertToSnapshotStoreConfig.ts
import { Subscriber } from '@/app/subscribers/Subscriber';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Attachment } from '@/app/documents/attachment/Attachment';


function convertToSnapshotStoreConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

  // 1. Map snapshots safely
  const mappedSnapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> =
    snapshotStore.snapshots.map((s) => ({
      ...s,
      snapshotId: s.snapshotId ?? '',
      set: s.set ?? new Set(),
      snapshots: s.snapshots ?? [],
      schema: s.schema,
      config: s.config ?? {},
      items: s.items ?? [],
      snapshotItems: s.snapshotItems ?? [],
      configOption: s.configOption ?? {},
      initialState: s.initialState ?? null,
      nestedStores: s.nestedStores ?? [],
      events: s.events ?? [],
      snapshotStore: s.snapshotStore ?? null,
      dataItems: s.dataItems ?? [],
      newData: s.newData,
      stores: s.stores ?? [],
      snapshotStoreConfig: s.snapshotStoreConfig ?? null,
      getSnapshotItems: s.getSnapshotItems ?? [],
      snapshotIds: s.snapshotIds ?? [],
      dataStoreMethods: s.dataStoreMethods ?? null,
      transformSubscriber: s.transformSubscriber ?? null,
      transformDelegate: s.transformDelegate ?? null,
      addSnapshotItem: s.addSnapshotItem ?? null,
      delegate: s.delegate ?? [],
      getData: s.getData ?? (() => null),
      dataStore: s.dataStore,
    }));

  // 2. Map state recursively
  const mappedState = snapshotStore.state?.map((snapshot) => ({
    ...snapshot,
    store: snapshot.store ? convertToSnapshotStoreConfig(snapshot.store) : undefined,
    set: snapshot.set ?? new Set(),
    snapshots: snapshot.snapshots ?? [],
    snapshotItems: snapshot.snapshotItems ?? [],
    configOption: snapshot.configOption ?? {},
    date: snapshot.date ?? null,
    message: snapshot.message ?? '',
    createdBy: snapshot.createdBy ?? '',
    type: snapshot.type ?? '',
  })) ?? null;

  // 3. Type guard for subscribers
  function isSubscriber(
    obj: unknown
  ): obj is Subscribe<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return !!obj && typeof obj === 'object' && 'getId' in obj && '_id' in obj && 'subscription' in obj;
  }

  // 4. Map subscribers safely
  const mappedSubscribers = snapshotStore.subscribers
    .filter(isSubscriber)
    .map((s) => ({
      ...s,
      id: s.id ?? '',
      _id: s.getId(),
      name: s.getName?.() ?? '',
      subscriberId: s.getSubscriberId?.() ?? '',
      subscription: s.getSubscription?.() ?? null,
      snapshots: s.snapshots ?? [],
      getData: s.getData ?? (() => null),
      getSnapshotIds: s.getSnapshotIds ?? (() => []),
      fetchSnapshotIds: s.getFetchSnapshotIds ?? (() => Promise.resolve([])),
      getOptionalData: s.getOptionalData ?? (() => null),
      transformSubscriber: s.getTransformSubscriber ?? null,
      onSnapshotCallbacks: s.getOnSnapshotCallbacks ?? (() => []),
      onErrorCallbacks: s.getOnErrorCallbacks ?? (() => []),
      onUnsubscribeCallbacks: s.getOnUnsubscribeCallbacks ?? (() => []),
      notifyEventSystem: s.getNotifyEventSystem ?? (() => {}),
      updateProjectState: s.getUpdateProjectState ?? (() => {}),
      logActivity: s.getLogActivity ?? (() => {}),
      triggerIncentives: s.getTriggerIncentives ?? (() => {}),
      initialData: s.initialData ?? null,
      determineCategory: s.getDetermineCategory ?? (() => ''),
      // Add any other subscriber methods as needed
    }));

  // 5. Return fully typed config
  return {
    id: snapshotStore.id,
    snapshotId: snapshotStore.snapshotId,
    key: snapshotStore.key,
    priority: snapshotStore.priority,
    topic: snapshotStore.topic,
    status: snapshotStore.status,
    category: snapshotStore.category,
    timestamp: snapshotStore.date,
    state: mappedState,
    snapshots: mappedSnapshots,
    subscribers: mappedSubscribers,
    subscription: snapshotStore.subscription
      ? {
          unsubscribe: snapshotStore.subscription.unsubscribe ?? (() => {}),
          portfolioUpdates: snapshotStore.subscription.portfolioUpdates ?? (() => {}),
          tradeExecutions: snapshotStore.subscription.tradeExecutions ?? (() => {}),
          marketUpdates: snapshotStore.subscription.marketUpdates ?? (() => {}),
          triggerIncentives: snapshotStore.subscription.triggerIncentives ?? (() => {}),
          communityEngagement: snapshotStore.subscription.communityEngagement ?? (() => {}),
          portfolioUpdatesLastUpdated: snapshotStore.subscription.portfolioUpdatesLastUpdated ?? 0,
          determineCategory: snapshotStore.subscription.determineCategory ?? (() => {}),
        }
      : null,
    initialState: snapshotStore.initializedState,
    clearSnapshots: snapshotStore.clearSnapshots,
    isCompressed: snapshotStore.isCompressed,
    expirationDate: snapshotStore.expirationDate,
    tags: snapshotStore.tags,
    metadata: snapshotStore.metadata,
    configOption: snapshotStore.configOption,
    setSnapshotData: snapshotStore.setSnapshotData,
  };
}
