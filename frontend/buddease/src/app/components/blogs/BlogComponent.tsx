import React, { useEffect, useState } from 'react';
import { Content } from '../models/content/AddContent';
import { Data } from '../models/data/Data';
import { BlogData } from '../lists/BlogList';
import {  Snapshot } from '../snapshots/LocalStorageSnapshotStore';
import { CustomSnapshotData, SnapshotData } from '../snapshots/SnapshotData';
import SnapshotStore from '..w/snapshots/SnapshotStore';
import { Subscription } from '../subscriptions/Subscription';
import { NotificationType, useNotification } from '../support/NotificationContext';
import { Subscriber } from '../users/Subscriber';
import { logActivity, notifyEventSystem, triggerIncentives, updateProjectState } from '../utils/applicationUtils';
import * as subscriberApi from './../../api/subscriberApi';
import { UnifiedMetaDataOptions, BaseMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { Meta } from "@/app/components/models/data/dataStoreMethods";

type BlogContentType = {
  body: string;                     // Main content of the blog post
  imageUrls?: string[];            // Optional list of image URLs
  tags?: string[];                  // Optional tags for categorization
  length: number;                   // Length of the content in terms of word count
  relatedLinks?: { title: string; url: string }[]; // Related articles or resources
};  

type BlogOptionalType = {
  likes?: number;                  // Number of likes the blog post received
  shares?: number;                 // Number of times the post was shared
  bookmarkCount?: number;          // Count of bookmarks for user reference
  userInteractions?: {
    liked: boolean;                // Indicates if the current user liked the post
    bookmarked: boolean;           // Indicates if the current user bookmarked the post
  };
};


interface BlogProps<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = Data> {
  title: string;
  content: string | Content<T, Meta, K> | undefined;  // Use Content with the required type parameters
  subscriberId: string;
  metaData?: BlogMetaType;
  optionalData?: BlogOptionalType; // Add optionalData to use BlogOptionalType
  // Add more properties as needed (date, author, etc.)
}  


type BlogMetaType = BaseMetaDataOptions<BlogContentType, Meta> & {
  author: string;                  // Name of the author
  publishedDate: Date;             // Date when the blog post was published
  modifiedDate?: Date;             // Optional date when the post was last modified
  isPublished: boolean;             // Indicates if the post is published
  slug: string;                     // URL-friendly version of the title
  viewsCount?: number;              // Optional count of views for analytics
  commentsCount?: number;           // Optional count of comments
};  


const BlogComponent: React.FC<BlogProps<BlogData, Meta, BlogData>> = ({
  title,
  content,
  subscriberId,
}) => {
  const [subscriptionData, setSubscriptionData] = useState<Subscription<BlogData, Meta> | undefined>(); 
  const { sendNotification } = useNotification(); 
  const optionalData: CustomSnapshotData | null = null;
  const name = "Blog"; 

  let snapshotData: SnapshotData<Data, Meta> | null = null;
  let id: string | number | undefined = undefined;
  let data: Partial<SnapshotStore<Data>> = {
    id: String(id || ""),
    // Add other properties as needed
  };
  
  if (optionalData !== null) {
    snapshotData = {
      id: id,
      data: optionalData,
      timestamp: new Date(),
      subscriberId: subscriberId,
      category: "Blog",
      content: {
        id: id,
        title: title,
        description: content?.toString() || '', 
        subscriberId: subscriberId,
        category: "Blog",
        timestamp: new Date(),
        length: 0,
        data: optionalData,
      },
      store: undefined,
      snapshot: {},
      getSnapshotId: () => String(id || ""),
      compareSnapshotState: () => false,
      eventRecords: [],
      // Add other required properties here
      snapshotStore: {} as any,
      getParentId: () => "",
      getChildIds: () => [],
      addChild: () => {},
      removeChild: () => {},
      updateChild: () => {},
      getChild: () => null,
      hasChild: () => false,
      getChildren: () => [],
      getDescendants: () => [],
      getAncestors: () => [],
      getRootSnapshot: () => null,
      isRootSnapshot: () => false,
      getDepth: () => 0,
      getPath: () => [],
      traverse: () => {},
      find: () => null,
      filter: () => [],
      map: () => [],
      reduce: () => null,
      toJSON: () => ({}),
      fromJSON: () => null,
      clone: () => null,
      merge: () => {},
      diff: () => ({}),
      patch: () => {},
      revert: () => {},
      commit: () => {},
      checkpoint: () => "",
      restore: () => {},
      getHistory: () => [],
      clearHistory: () => {},
    } as unknown as Snapshot<Data, Meta, Data>;
  }
  const subscribedId = subscriberApi.getSubscriberById(subscriberId).toString();

  const subscriber = new Subscriber<BlogData, Meta, BlogData>(
    String(id || ""), 
    name, 
    subscriptionData || ({} as Subscription<BlogData, Meta>), 
    subscribedId, 
    notifyEventSystem, 
    updateProjectState, 
    logActivity, 
    triggerIncentives, 
    optionalData, 
    data,
  );

  useEffect(() => {
    subscriber.subscribe((data: Snapshot<Data, Meta, Data>) => {
      const subscription = data.data as unknown as Subscription<BlogData, Meta>;
      setSubscriptionData(subscription);

      sendNotification(
        "BlogUpdated" as NotificationType,
        `Blog "${title}" has been updated.`
      );
    });

    return () => {
      if (subscriber) {
        const data = {} as Snapshot<Data, Meta, Data>;
        const callback = (data: Snapshot<BlogData, Meta, BlogData>) => {
          console.log("Received snapshot:", data);
          // Add more logic as needed
        };
        subscriber.notify!(data, callback);
      }
    };
  }, []);

  return (
    <div>
      <h2>{title}</h2>
      <p>{typeof content === 'string' ? content : ''}</p>
    </div>
  );
};
export default BlogComponent;
