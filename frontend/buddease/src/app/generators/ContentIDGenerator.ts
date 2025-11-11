// ContentIDGenerator.ts
import {
    BaseDataEntity,
    DefaultMeta
} from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { Data, DataDetails } from '@/app/models/data/Data';
import { NotificationType, NotificationTypeEnum } from '@/app/state/context/NotificationContext';
import { DetailsItem } from '@/app/state/stores/DetailsListStore';
import { v4 as uuidV4 } from 'uuid'; // Import the uuid library or use your preferred UUID generator

export class ContentIDGenerator<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> {
  static generateContentID(title: string, description: string, date: string | Date, type: NotificationType): string {
    const contentID = uuidV4(); // Generate a unique UUID for the content ID
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
    UniqueIDGenerator.notifyFormatted(contentID, message, content, new Date(), NotificationTypeEnum.GeneratedID);
    return contentID;
  }
}

// Example usage:
const contentItem: DetailsItem<Data> = {
  _id: uuidV4(),
  id: ContentIDGenerator.generateContentID("Sample Content", "This is a sample content item.", NotificationTypeEnum.ContentItem),
  title: "Sample Content",
  description: "This is a sample content item.",
  subtitle: "This is a sample content item subtitle.",
  value: "This is a sample content item value.",
  analysisResults: [],
  /* Add other relevant details here */
};
