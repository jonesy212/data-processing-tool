import { K, Meta, T } from '@/app/components/models/data/dataStoreMethods';
import { BaseMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import React, { useEffect, useState } from 'react';
import { BlogData } from '../lists/BlogList';
import { Content } from '../models/content/AddContent';
import { BaseData, Data } from '../models/data/Data';
import { Snapshot } from '../snapshots/LocalStorageSnapshotStore';
import { CustomSnapshotData, SnapshotData } from '../snapshots/SnapshotData';
import SnapshotStore from '../snapshots/SnapshotStore';
import { Subscription } from '../subscriptions/Subscription';
import { NotificationType, useNotification } from '../support/NotificationContext';
import { Subscriber, SubscriberCallback } from '../users/Subscriber';
import { logActivity, notifyEventSystem, triggerIncentives, updateProjectState } from '../utils/applicationUtils';
import { snapshotId } from '../utils/snapshotUtils';
import * as subscriberApi from './../../api/subscriberApi';
import TrackerClass from '../models/tracker/Tracker';

type BlogContentType<T extends BaseData<any>, K extends T = T> = {
  body: string;                     // Main content of the blog post
  imageUrls?: string[];            // Optional list of image URLs
  tags?: string[];                  // Optional tags for categorization
  length: number;                   // Length of the content in terms of word count
  relatedLinks?: { title: string; url: string }[]; // Related articles or resources
  _id: string,
  date: Date,
  subtitle: string,
  data?: Content<T, K> | Snapshot<Data<T, K>, Meta<T, BaseMetaDataOptions<T, K>>>,
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


// Fixing BlogContentMeta
type BlogContentMeta<T extends BaseData<any>, K extends T = T> = {
  content: string | Content<T, K> | undefined;  // Align content type
} & Base

interface BlogProps<
  T extends  BaseData<any>, 
  K extends T = T> {
  title?: string;
  content: string | Content<T, K> | undefined;  // Use Content with the required type parameters
  subscriberId: string;
  metaData?: BlogMetaType;
  optionalData?: BlogOptionalType; // Add optionalData to use BlogOptionalType
  // Add more properties as needed (date, author, etc.)
}  


type BlogMetaType = BaseMetaDataOptions<BlogContentType, BlogContentMeta> & {
  author: string;                  // Name of the author
  publishedDate: Date;             // Date when the blog post was published
  modifiedDate?: Date;             // Optional date when the post was last modified
  isPublished: boolean;             // Indicates if the post is published
  slug: string;                     // URL-friendly version of the title
  viewsCount?: number;              // Optional count of views for analytics
  commentsCount?: number;           // Optional count of comments
};  


// Fixing BlogDataMeta
type BlogDataMeta<T extends BaseData<any>, K extends T = T> = 
  BlogContentMeta<T, K> & 
  BlogOptionalType & 
  BlogMetaType;

// Use correct types in SnapshotData
type SnapshotDataWithBlogData = SnapshotData<
  BlogData<Data<BaseData<any>>, BlogDataMeta<Data<BaseData<any>>>>,
  BlogDataMeta<Data<BaseData<any>>>
>;

// Example function to validate and sanitize input
const validateAndSanitizeInput = (input: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");
  return doc.body.textContent || "";
};

const BlogComponent: React.FC<BlogProps<BlogData<Data<BaseData<any>>>, BlogDataMeta>> = ({
  title,
  content,
  subscriberId,
  metaData,
}) => {
  const [subscriptionData, setSubscriptionData] = useState<Subscription<BlogData<Data<BaseData<any>>>, BlogDataMeta> | undefined>(); 
  const { sendNotification } = useNotification(); 

  const tracker = new TrackerClass("blogPost123", "Blog Post Tracker", [], {
    width: 100, 
    color: "black",
  }, 2, "#ff6347", false, false, 0, 0);

  const optionalData: CustomSnapshotData<BaseData> | null = null;
  const name = "Blog"; 


  // Make sure your snapshotData has the required fields
  let snapshotData: SnapshotDataWithBlogData | null = null;
  let id: string | number | undefined = undefined;
  let subtitle = "Blog Post";

  let data: Partial<SnapshotStore<BlogData<Data<BaseData<any>>>>> = {
    id: String(id || ""),
    // Add other properties as needed
  };
  
  if (optionalData !== null && snapshotData!.snapshotId !== undefined) {
    snapshotData = {
      id: id,
      snapshotId: snapshotId,
      data: optionalData,
      // body: optionalData,
      // state: "",
      // length: 0,
      // date: new Date(),
      subtitle: subtitle,
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
    } as unknown as Snapshot<BlogData<Data<BaseData<any>>>, BlogDataMeta>;
  }

  
  const subscribedId = subscriberApi.getSubscriberById(subscriberId).toString();
  // Ensure that subscriptionData is set properly
  const subscription = subscriptionData || ({} as Subscription<BlogData<Data<BaseData<any>>>, BlogDataMeta>);
  
  const subscriber = new Subscriber<BlogData<Data<BaseData<any>>, BlogDataMeta>>(
    String(id), // id
    name, // name
    subscription, // subscription
    subscribedId, // subscriberId
    notifyEventSystem, // notifyEventSystem
    updateProjectState, // updateProjectState
    logActivity, // logActivity
    triggerIncentives, // triggerIncentives
    optionalData, // optionalData
    snapshotData // payload
  );

  useEffect(() => {
    if (content === undefined) {
      console.log("Content is undefined");
    }
    else{
      console.log("Content is defined");
    }
      // Sanitize and set the content on mount
      const sanitizedContent = validateAndSanitizeInput(content);
      console.log("Sanitized content:", sanitizedContent);
  
      // Track file changes (Example)
      tracker.trackFileChanges({
        title,
        previousMetadata: { title: "Old Title" },
        metadata: { title },
        fileSize: 0,
        fileType: "",
        filePath: "",
        uploader: "",
        fileName: "",
        uploadDate: new Date(),
        scheduledDate: new Date(),
        
      });
  
      // Update user profile (Example)
      tracker.updateUserProfile({
        fullName: "John Doe",
        bio: "Content Manager",
        uploadQuota: 100,
        dispatch
      });
  
      // Update appearance
      tracker.updateAppearance("solid", "#ff6347", {
        textColor: "blue",
        fontSize: "16px",
        fontFamily: "Arial",
      });
    
    subscriber.subscribe(((data: Snapshot<BlogData<Data<BaseData<any>>>, BlogDataMeta>) => {
      const subscription = data.data as Subscription<BlogData<Data<BaseData<any>>>, BlogDataMeta>;
      setSubscriptionData(subscription);
  
      sendNotification(
        "BlogUpdated" as NotificationType,
        `Blog "${title}" has been updated.`
      );
    }) as unknown as SubscriberCallback<
    BlogData<Data<BaseData<any, any, any>>, Meta>, BlogDataMeta>);
  
    return () => {
      if (subscriber) {
        const data = {} as Snapshot<BlogData<Data<BaseData<any>>>, BlogData<Data<BaseData<any>>>>;
        const callback = (data: Snapshot<BlogData<Data<BaseData<any>>>, BlogDataMeta>) => {
          console.log("Received snapshot:", data);
          // Add more logic as needed
        };
        subscriber.notify!(data, callback);
      }
    };
  }, [content, title]);

  return (
    <div>
      <h2>{title}</h2>
      <p>{typeof content === 'string' ? content : ''}</p>
      <button onClick={() => sendNotification("Blog updated!")}>Send Notification</button>
    </div>
  );
};

export default BlogComponent;
