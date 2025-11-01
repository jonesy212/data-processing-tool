import { SubscriptionActions } from "@/app/actions/SubscriptionActions";
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import { ModifiedDate } from "@/app/documents/DocType";
import { Snapshot } from "@/app/snapshots";
import { SubscriptionPayload } from "@/app/actions/SubscriptionActions";
import { LiveEvent } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';

import { Subscriber } from "@/app/subscribers/Subscriber";
import { fetchPortfolioUpdatesLastUpdated } from "@/app/utils/trading/TradingUtils";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

interface UseSubscriptionOptions {
  channel: string;
  onLiveEvent: (event: LiveEvent) => void;
  enabled?: boolean;
}

const portfolioUpdatesLastUpdated = async (): Promise<number | ModifiedDate | null> => {
  try {
    const portfolioUpdatesLastUpdated = await fetchPortfolioUpdatesLastUpdated();
    return portfolioUpdatesLastUpdated;
  } catch (error) {
    console.error("Error fetching portfolio updates last updated timestamp:", error);
    return null;
  }
}; 


const useSubscription = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  channel,
  onLiveEvent,
  enabled = true,
}: UseSubscriptionOptions) => {
  const [subscribers, setSubscribers] = useState<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const dispatch = useDispatch();
  
  // Define unsubscribe payload type that matches the generic structure
  type UnsubscribePayload = {
    subscriberId: string;
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
      snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    };
  };

  const subscribe = (subscriptionData: SubscriptionPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    setIsSubscribed(true);
    
    // Dispatch subscribe action with generic payload
    dispatch(SubscriptionActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().subscribe(subscriptionData));
  };

  const unsubscribe = (
    subscriberId: string,
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => {
    // Filter out the subscriber
    const updatedSubscribers = subscribers.filter(
      (subscriber) => subscriber.getSubscriberId() !== subscriberId
    );
    
    setIsSubscribed(false);
    setSubscribers(updatedSubscribers);

    // Create the unsubscribe payload with proper generic types
    const unsubscribePayload: UnsubscribePayload = {
      subscriberId,
      unsubscribeDetails: {
        ...unsubscribeDetails,
        // Include the snapshot if we can create it
        snapshot: createSnapshotFromUnsubscribeDetails(unsubscribeDetails)
      }
    };

    // Dispatch unsubscribe action with properly typed payload
    dispatch(SubscriptionActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().unsubscribe(unsubscribePayload));
  
    // If callback provided, invoke it with the snapshot
    if (callback) {
      const snapshot = createSnapshotFromUnsubscribeDetails(unsubscribeDetails);
      callback(snapshot);
    }
  };

  // Helper function to create properly typed snapshot from unsubscribe details
  const createSnapshotFromUnsubscribeDetails = (
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    }
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
    const snapshotData = unsubscribeDetails.unsubscribeData as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
    return {
      // Core snapshot identification
      snapshotId: unsubscribeDetails.snapshotId,
      snapshotData: snapshotData,
      
      // Data properties
      dataObject: snapshotData?.dataObject,
      deleted: snapshotData?.deleted || false,
      initialState: snapshotData?.initialState,
      isCore: snapshotData?.isCore || false,
      
      // Configuration
      initialConfig: snapshotData?.initialConfig,
      config: snapshotData?.config || {},
      
      // Lifecycle handlers
      onInitialize: snapshotData?.onInitialize,
      onError: snapshotData?.onError,
      
      // Task management
      taskIdToAssign: snapshotData?.taskIdToAssign,
      
      // Schema and structure
      schema: snapshotData?.schema || {},
      currentCategory: snapshotData?.currentCategory || 'default',
      mappedSnapshotData: snapshotData?.mappedSnapshotData || {},
      
      // Storage and versioning
      storeId: snapshotData?.storeId || 'default',
      versionInfo: snapshotData?.versionInfo || { version: '1.0.0' },
      initializedState: snapshotData?.initializedState || false,
      snapshotContainer: snapshotData?.snapshotContainer || {},
      
      // Metadata and timestamps
      timestamp: new Date(),
      metadata: snapshotData?.metadata || {},
      
      // Add any other required snapshot properties with appropriate defaults
      ...(snapshotData || {})
    };
  };

  // Method to handle live events with proper typing
  const handleLiveEvent = (event: LiveEvent) => {
    if (onLiveEvent) {
      onLiveEvent(event);
    }
    
    // Update subscribers state if needed
    setSubscribers(prev => 
      prev.map(subscriber => 
        subscriber.handleEvent ? subscriber.handleEvent(event) : subscriber
      )
    );
  };

  // Method to add a new subscriber
  const addSubscriber = (subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    setSubscribers(prev => [...prev, subscriber]);
  };

  // Method to get subscriber by ID
  const getSubscriber = (subscriberId: string): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined => {
    return subscribers.find(subscriber => subscriber.getSubscriberId() === subscriberId);
  };

  // Method to check if specific subscriber exists
  const hasSubscriber = (subscriberId: string): boolean => {
    return subscribers.some(subscriber => subscriber.getSubscriberId() === subscriberId);
  };

  useEffect(() => {
    if (enabled) {
      dispatch(SubscriptionActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().fetchInitialSubscriptions());
    }
  }, [enabled, dispatch]);

  return {
    subscribers,
    subscribe,
    unsubscribe,
    addSubscriber,
    getSubscriber,
    hasSubscriber,
    isSubscribed,
    handleLiveEvent,
    portfolioUpdatesLastUpdated
  };
};

export default useSubscription;