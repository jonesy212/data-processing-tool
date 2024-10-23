// ContentIDGenerator.ts
import { v4 as uuidV4 } from 'uuid'; // Import the uuid library or use your preferred UUID generator
import { NotificationTypeEnum } from '@/app/components/support/NotificationContext';
import { Data, DataDetails } from '../components/models/data/Data';
import { NotificationType } from '../components/support/NotificationContext';
import UniqueIDGenerator from './GenerateUniqueIds';
import { DetailsItem } from '../components/state/stores/DetailsListStore';

export class ContentIDGenerator {
  static generateContentID(title: string, description: string, type: NotificationType): string {
    const contentID = uuidV4(); // Generate a unique UUID for the content ID
    const message = `Generated content ID for ${title}: ${contentID}`;
    const content: DataDetails = {
      _id: contentID,
      id: contentID,
      title: title,
      description: description,
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
