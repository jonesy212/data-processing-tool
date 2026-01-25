// ContentIDGenerator.ts

import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
    BaseDataEntity,
    DefaultMeta
} from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { NotificationType, NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import type { Data, DataDetails } from '@/core/models/data/Data';
import type { DetailsItem } from '@/core/state/stores/DetailsListStore';
import type { DataAttachment, DataEntity, DataExcludedFields, DataIncludedFields, DataK, DataMeta } from '@/core/typings/entities/DataEntity';
import { v4 as uuidV4 } from 'uuid'; // Import the uuid library or use your preferred UUID generator

export class ContentIDGenerator<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> {
  static generateContentID<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(
    title: string, 
    description: string, 
    date: string | Date, 
    type: NotificationType
  ): string {
    const contentID = uuidV4();
    const message = `Generated content ID for ${title}: ${contentID}`;
    
    const content: DataDetails<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      _id: contentID,
      id: contentID,
      title: title,
      description: description,
      date: date,
      status: 'pending',
      isActive: true,
      tags: [],
      type: type,
      createdAt: new Date(),
      uploadedAt: new Date(),
      analysisResults: []
    };
    
    UniqueIDGenerator.notifyFormatted(contentID, message, content, new Date(), NotificationTypeEnum.GENERATED_ID);
    return contentID;
  }
}

// Example usage:
const contentItem: DetailsItem<Data<DataEntity, DataK, DataMeta, DataAttachment, DataIncludedFields, DataExcludedFields>> = {
  _id: uuidV4(),
  id: ContentIDGenerator.generateContentID("Sample Content", "This is a sample content item.", new Date(), NotificationTypeEnum.CONTENT_ITEM),
  title: "Sample Content",
  description: "This is a sample content item.",
  subtitle: "This is a sample content item subtitle.",
  value: "This is a sample content item value.",
  analysisResults: [],
  /* Add other relevant details here */
};
