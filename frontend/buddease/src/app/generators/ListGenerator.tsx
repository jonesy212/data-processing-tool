// ListGenerator.tsx
import { BaseData, Data } from '@/app/models/data/Data';
import { 
  DetailsEntity, 
  DetailsK, 
  DetailsMeta, 
  DetailsAttachment, 
  DetailsExcludedFields, 
  DetailsIncludedFields 
} from "@/app/typings/entities/DetailsEntity";
import { DetailsItem } from "@/app/state/stores/DetailsListStore";
import DetailsListItem from '@/app/components/models/data/DetailsListItem'
import { ReactiveMouseEvent } from '@/app/typings/eventHandlers/eventTypes'
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { BaseDataRoot } from '@/app/config/BaseConfig';

// Define a mapped type to include all properties of Data
export type AllProperties<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Partial<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;


// Define a new type for DetailsItem with optional properties
type DetailsItemCommon<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > = DetailsItem<AllProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;


interface ListGeneratorProps<
  T extends BaseDataEntity = DetailsEntity,
  K extends T = DetailsK,
  Meta extends DefaultMeta<T, K> = DetailsMeta,
  AttachmentType extends Attachment = DetailsAttachment,
  ExcludedFields extends keyof T = DetailsExcludedFields,
  IncludedFields extends keyof T = DetailsIncludedFields
> {
  items: DetailsItemCommon<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  onItemClick?: (contentItemId: DetailsItemCommon<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, tracker: K, event?: ReactiveMouseEvent) => void;
}


const ListGenerator = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  items,
  onItemClick,
}: ListGeneratorProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  
  // Enhanced handleContentItemClick function with event parameter
  const handleContentItemClick = (
    contentItem: DetailsItemCommon<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    tracker: K,
    event?: ReactiveMouseEvent
  ) => {
    // Use event properties if available
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      
      // You can access custom properties from ReactiveMouseEvent
      console.log('Click event settings:', event.settings);
      console.log('Click event progress:', event.progress);
    }
    
    onItemClick?.(contentItem, tracker, event);
  };

  return (
    <div>
      {items.map((item, index) => {
        // Ensure label is a string
        const label = item.label?.toString() || '';
        
        // Ensure value is a string
        const value = item.value?.toString() || '';

        return (
          <div 
            key={index} 
            onClick={(event: ReactiveMouseEvent) => {
              if (item.tracker) {
                handleContentItemClick(item, item.tracker as K, event);
              }
            }}
            onMouseEnter={(event: ReactiveMouseEvent) => {
              if (item.tracker) {
                // Enhanced hover effects using ReactiveMouseEvent
                event.currentTarget.style.backgroundColor = '#f8f9fa';
                event.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                event.currentTarget.style.transform = 'translateY(-1px)';
                
                // Access custom event properties
                if (event.settings) {
                  console.log('Hover with settings:', event.settings);
                }
              }
            }}
            onMouseLeave={(event: ReactiveMouseEvent) => {
              if (item.tracker) {
                // Reset hover effects
                event.currentTarget.style.backgroundColor = '';
                event.currentTarget.style.boxShadow = '';
                event.currentTarget.style.transform = '';
              }
            }}
            onMouseDown={(event: ReactiveMouseEvent) => {
              if (item.tracker) {
                // Active state styling
                event.currentTarget.style.transform = 'translateY(0)';
                event.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
              }
            }}
            onMouseUp={(event: ReactiveMouseEvent) => {
              if (item.tracker) {
                // Restore hover state
                event.currentTarget.style.transform = 'translateY(-1px)';
                event.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
            style={{ 
              cursor: item.tracker ? 'pointer' : 'default',
              transition: 'all 0.2s ease-in-out',
              padding: '12px',
              margin: '4px 0',
              borderRadius: '6px',
              border: '1px solid #e9ecef',
              backgroundColor: '#ffffff',
              userSelect: 'none',
              // Ensure proper stacking for hover effects
              position: 'relative',
              zIndex: 1
            }}
            // Add CSS class for additional styling
            className={item.tracker ? 'clickable-details-item' : 'static-details-item'}
          >
            {/* Only render if we have meaningful content */}
            {(label || value || item.title || item.description) && (
              <DetailsListItem<
                T, K, Meta, AttachmentType, ExcludedFields, IncludedFields
              >
                item={item}
                label={label}
                value={value}
              />
            )}
            
            {/* Optional: Add a visual indicator for clickable items */}
            {item.tracker && (
              <div 
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#007bff',
                  opacity: 0.6
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Optional: CSS styles for enhanced visual feedback
const enhancedStyles = `
.clickable-details-item {
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.clickable-details-item:hover {
  border-color: #007bff;
  z-index: 2;
}

.clickable-details-item:active {
  transition-duration: 0.1s;
}

.static-details-item {
  cursor: default;
  opacity: 0.8;
}

/* Focus styles for accessibility */
.clickable-details-item:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
`;

export default ListGenerator;
export type { DetailsItemCommon, ListGeneratorProps };