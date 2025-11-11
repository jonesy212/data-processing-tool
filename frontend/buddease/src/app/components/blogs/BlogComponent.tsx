import * as subscriberApi from '@/api/subscriberApi';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { BaseMetaDataOptions } from "@/app/config/MetaDataOptions";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { Content } from '@/app/models/content/AddContent';
import { Data } from '@/app/models/data/Data';
import Tracker from '@/app/models/tracker/Tracker';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { CustomSnapshotData, SnapshotData } from '@/app/snapshots/SnapshotData';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { Subscriber, SubscriberCallback } from '@/app/subscribers/Subscriber';
import { Subscription } from '@/app/subscriptions/Subscription';
import { BlogAttachment, BlogEntity, BlogExcludedFields, BlogIncludedFields, BlogK, BlogMeta } from '@/app/typings/entities/BlogEntity';
import { NotificationType, useNotification } from '@/state/context/NotificationContext';
import { snapshotId } from '@/utils/snapshotUtils';
import { logActivity, notifyEventSystem, triggerIncentives, updateProjectState } from '@/utils/web3/applicationUtils';
import React, { useEffect, useState } from 'react';

type BlogContentType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
  > = {
  body: string;                     // Main content of the blog post
  imageUrls?: string[];            // Optional list of image URLs
  tags?: string[];                  // Optional tags for categorization
  length: number;                   // Length of the content in terms of word count
  relatedLinks?: { title: string; url: string }[]; // Related articles or resources
  _id: string,
  date: Date,
  subtitle: string,
  data?: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  | Snapshot<Data<T, K>, Meta<T, BaseMetaDataOptions<T, K>>>,
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
type BlogContentMeta<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
  > = {
  content: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  | undefined;  // Align content type
}

interface BlogProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  title?: string;
  content: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  | undefined;  // Use Content with the required type parameters
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
type BlogDataMeta<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
  > = 
  BlogContentMeta<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & 
  BlogOptionalType & 
  BlogMetaType;

// Use correct types in SnapshotData
type SnapshotDataWithBlogData = SnapshotData<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;
// Example function to validate and sanitize input
const validateAndSanitizeInput = (input: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");
  return doc.body.textContent || "";
};

const BlogComponent: React.FC<BlogProps<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>> = ({
  title,
  content,
  subscriberId,
  metaData,
}) => {
  const [subscriptionData, setSubscriptionData] = useState<Subscription<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields> | undefined>(); 
  const { sendNotification } = useNotification(); 

  const tracker = new Tracker("blogPost123", "Blog Post Tracker", [], {
    width: 100, 
    color: "black",
  }, 2, "#ff6347", false, false, 0, 0);

  const optionalData: CustomSnapshotData<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields> | null = null;
  const name = "Blog"; 


  // Make sure your snapshotData has the required fields
  let snapshotData: SnapshotDataWithBlogData | null = null;
  let id: string | number | undefined = undefined;
  let subtitle = "Blog Post";

  let data: Partial<SnapshotStore<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>> = {
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
      validate: "",
      serialize: "",
      get: () => {}
    } as unknown as Snapshot<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;
  }

  
  const subscribedId = subscriberApi.getSubscriberByIdAPI(subscriberId).toString();
  // Ensure that subscriptionData is set properly
  const subscription = subscriptionData || ({} as Subscription<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>);
  
  const subscriber = new Subscriber<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>(
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
        createdBy: new Date(),
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
    
    subscriber.subscribe(((data: Snapshot<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>) => {
      const subscription = data.data as Subscription<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;
      setSubscriptionData(subscription);
  
      sendNotification(
        "BlogUpdated" as NotificationType,
        `Blog "${title}" has been updated.`
      );
    }) as unknown as SubscriberCallback<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>);
  
    return () => {
      if (subscriber) {
        const data = {} as Snapshot<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;
        const callback = (data: Snapshot<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>) => {
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
