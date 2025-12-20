// useSorting.ts
import { useState } from 'react';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { SortCriteria } from '@/app/settings/SortCriteria';

// Generic sorting hook
const useSorting = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>() => {
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>(SortCriteria.Date);

  // Generic sort function for any array
  const sortArray = <ItemType extends { [key: string]: any }>(
    items: ItemType[],
    key: keyof ItemType,
    comparator?: (a: ItemType, b: ItemType) => number
  ): ItemType[] => {
    return items.slice().sort((a, b) => {
      if (comparator) {
        return comparator(a, b);
      }
      
      const valueA = a[key];
      const valueB = b[key];
      
      // Handle different types of values
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB);
      }
      
      if (valueA instanceof Date && valueB instanceof Date) {
        return valueA.getTime() - valueB.getTime();
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return valueA - valueB;
      }
      
      // Fallback to string conversion
      return String(valueA || '').localeCompare(String(valueB || ''));
    });
  };

  // Sort calendar events
  const sortEvents = (
    events: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
    return events.slice().sort((a, b) => {
      switch (sortCriteria) {
        case SortCriteria.Title:
          return (a.title || '').localeCompare(b.title || '');
        case SortCriteria.Date:
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateA - dateB;
        case SortCriteria.Duration:
          const durationA = a.duration || 0;
          const durationB = b.duration || 0;
          return durationA - durationB;
        case SortCriteria.Priority:
          const priorityA = a.priority || 0;
          const priorityB = b.priority || 0;
          return priorityA - priorityB;
        default:
          return 0;
      }
    });
  };

  // Sort messages
  const sortMessages = (
    messages: Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
    return messages.slice().sort((a, b) => {
      switch (sortCriteria) {
        case SortCriteria.Sender:
          return (a.sender?.username || '').localeCompare(b.sender?.username || '');
        case SortCriteria.Receiver:
          return (a.receiver?.username || '').localeCompare(b.receiver?.username || '');
        case SortCriteria.Timestamp:
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timeA - timeB;
        case SortCriteria.Message:
          return (a.content || '').localeCompare(b.content || '');
        case SortCriteria.Tags:
          return (a.tags?.join(',') || '').localeCompare(b.tags?.join(',') || '');
        default:
          return 0;
      }
    });
  };

  // Sort generic entities by their properties
  const sortEntities = (
    entities: T[],
    property?: keyof T
  ): T[] => {
    const sortBy = property || getDefaultSortProperty();
    
    return entities.slice().sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      
      // Handle different types
      if (valueA instanceof Date && valueB instanceof Date) {
        return valueA.getTime() - valueB.getTime();
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB);
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return valueA - valueB;
      }
      
      return String(valueA || '').localeCompare(String(valueB || ''));
    });
  };

  // Sort by multiple criteria
  const sortByMultiple = <ItemType extends Record<string, any>>(
    items: ItemType[],
    criteria: Array<{
      key: keyof ItemType;
      direction: 'asc' | 'desc';
      comparator?: (a: ItemType, b: ItemType) => number;
    }>
  ): ItemType[] => {
    return items.slice().sort((a, b) => {
      for (const criterion of criteria) {
        let comparison = 0;
        
        if (criterion.comparator) {
          comparison = criterion.comparator(a, b);
        } else {
          const valueA = a[criterion.key];
          const valueB = b[criterion.key];
          
          if (valueA instanceof Date && valueB instanceof Date) {
            comparison = valueA.getTime() - valueB.getTime();
          } else if (typeof valueA === 'string' && typeof valueB === 'string') {
            comparison = valueA.localeCompare(valueB);
          } else if (typeof valueA === 'number' && typeof valueB === 'number') {
            comparison = valueA - valueB;
          } else {
            comparison = String(valueA || '').localeCompare(String(valueB || ''));
          }
        }
        
        if (comparison !== 0) {
          return criterion.direction === 'desc' ? -comparison : comparison;
        }
      }
      
      return 0;
    });
  };

  // Helper function to determine default sort property
  const getDefaultSortProperty = (): keyof T => {
    // Try to find common properties
    const commonProps = ['name', 'title', 'createdAt', 'updatedAt', 'id'] as (keyof T)[];
    
    for (const prop of commonProps) {
      if (prop in ({} as T)) {
        return prop;
      }
    }
    
    // Fallback to first property
    return Object.keys({} as T)[0] as keyof T;
  };

  // Sort criteria setters
  const setSortByTitle = () => setSortCriteria(SortCriteria.Title);
  const setSortByDate = () => setSortCriteria(SortCriteria.Date);
  const setSortBySender = () => setSortCriteria(SortCriteria.Sender);
  const setSortByReceiver = () => setSortCriteria(SortCriteria.Receiver);
  const setSortByTimestamp = () => setSortCriteria(SortCriteria.Timestamp);
  const setSortByMessage = () => setSortCriteria(SortCriteria.Message);
  const setSortByTags = () => setSortCriteria(SortCriteria.Tags);
  const setSortByPriority = () => setSortCriteria(SortCriteria.Priority);
  const setSortByDuration = () => setSortCriteria(SortCriteria.Duration);

  return {
    // State
    sortCriteria,
    
    // Sort functions
    sortEvents,
    sortMessages,
    sortEntities,
    sortArray,
    sortByMultiple,
    
    // Sort criteria setters
    setSortByTitle,
    setSortByDate,
    setSortBySender,
    setSortByReceiver,
    setSortByTimestamp,
    setSortByMessage,
    setSortByTags,
    setSortByPriority,
    setSortByDuration,
    
    // Utility
    setSortCriteria,
    getDefaultSortProperty
  };
};

// Non-generic version for easier use (if you don't need the generics)
export const useSimpleSorting = () => {
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>(SortCriteria.Date);

  // Simple generic sort function
  const sortItems = <T extends Record<string, any>>(
    items: T[],
    getSortValue: (item: T) => string | number | Date
  ): T[] => {
    return items.slice().sort((a, b) => {
      const valueA = getSortValue(a);
      const valueB = getSortValue(b);
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB);
      }
      
      if (valueA instanceof Date && valueB instanceof Date) {
        return valueA.getTime() - valueB.getTime();
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return valueA - valueB;
      }
      
      return String(valueA || '').localeCompare(String(valueB || ''));
    });
  };

  // Sort calendar events (simplified)
  const sortEvents = <T extends { title?: string; date?: string | Date }>(
    events: T[]
  ): T[] => {
    return sortItems(events, (event) => {
      switch (sortCriteria) {
        case SortCriteria.Title:
          return event.title || '';
        case SortCriteria.Date:
          return event.date ? new Date(event.date) : new Date(0);
        default:
          return '';
      }
    });
  };

  // Sort messages (simplified)
  const sortMessages = <T extends {
    sender?: { username?: string };
    receiver?: { username?: string };
    timestamp?: string | Date;
    content?: string;
    tags?: string[];
  }>(
    messages: T[]
  ): T[] => {
    return sortItems(messages, (message) => {
      switch (sortCriteria) {
        case SortCriteria.Sender:
          return message.sender?.username || '';
        case SortCriteria.Receiver:
          return message.receiver?.username || '';
        case SortCriteria.Timestamp:
          return message.timestamp ? new Date(message.timestamp) : new Date(0);
        case SortCriteria.Message:
          return message.content || '';
        case SortCriteria.Tags:
          return message.tags?.join(',') || '';
        default:
          return '';
      }
    });
  };

  return {
    sortCriteria,
    setSortCriteria,
    sortEvents,
    sortMessages,
    sortItems,
    setSortByTitle: () => setSortCriteria(SortCriteria.Title),
    setSortByDate: () => setSortCriteria(SortCriteria.Date),
    setSortBySender: () => setSortCriteria(SortCriteria.Sender),
    setSortByReceiver: () => setSortCriteria(SortCriteria.Receiver),
    setSortByTimestamp: () => setSortCriteria(SortCriteria.Timestamp),
    setSortByMessage: () => setSortCriteria(SortCriteria.Message),
    setSortByTags: () => setSortCriteria(SortCriteria.Tags),
  };
};

export default useSorting;