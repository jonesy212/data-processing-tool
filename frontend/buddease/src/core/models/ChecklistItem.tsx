// ChecklistItem.tsx
import type { BaseDataEntity, DefaultMeta } from "@/core/config/BaseConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import ListGenerator from "@/core/generators/ListGenerator";
import type { DetailsItem } from "@/core/state/stores/DetailsListStore";
import type {
    DetailsAttachment,
    DetailsEntity,
    DetailsExcludedFields,
    DetailsIncludedFields,
    DetailsK,
    DetailsMeta
} from "@/core/typings/entities/DetailsEntity";

// Use the specific DetailsEntity types
interface ChecklistItemProps<
  T extends BaseDataEntity = DetailsEntity,
  K extends T = DetailsK,
  Meta extends DefaultMeta<T, K> = DetailsMeta,
  AttachmentType extends Attachment = DetailsAttachment,
  ExcludedFields extends keyof T = DetailsExcludedFields,
  IncludedFields extends keyof T = DetailsIncludedFields
> {
  item: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

const ChecklistItem = <
  T extends BaseDataEntity = DetailsEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DetailsMeta,
  AttachmentType extends Attachment = DetailsAttachment,
  ExcludedFields extends keyof T = DetailsExcludedFields,
  IncludedFields extends keyof T = DetailsIncludedFields
>({ item }: ChecklistItemProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  
  // Helper function to safely format dates
  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return 'Not specified';
    
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    
    if (typeof date === 'string') {
      try {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString();
        }
      } catch {
        return date;
      }
    }
    
    return 'Invalid date';
  };

  // Extract item properties with proper typing
  const { title, description, status, participants, startDate, endDate } = item;

  // Render participants list
  const renderParticipants = () => {
    if (!participants || participants.length === 0) {
      return <p>No participants</p>;
    }

    return (
      <div>
        <p>Participants:</p>
        <ul>
          {participants.map((participant, index) => (
            <li key={index}>{participant.memberName}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Render the ChecklistItem
  return (
    <ListGenerator
      items={[item]}
      {...({
        item,
        label,
        value,
      }: {
        item: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        label: string;
        value: string;
      }) => (
        <div className="checklist-item">
          <h2>{title || "Untitled"}</h2>
          <p>Description: {description || "No description available"}</p>
          <p>Status: {status || "Unknown"}</p>
          {renderParticipants()}
          <p>Start Date: {formatDate(startDate)}</p>
          <p>End Date: {formatDate(endDate)}</p>
        </div>
      )}
    />
  );
};

export default ChecklistItem;
export type { ChecklistItemProps };
