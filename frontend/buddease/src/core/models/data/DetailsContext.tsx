// DetailsContext.tsx
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { DocumentData } from '@/core/documents/editing/DocumentBuilder';
import { DocumentContent } from '@/core/models/CommonData';
import type { Data } from '@/core/models/data/Data';
import type { DetailsItem } from '@/core/state/stores/DetailsListStore';
import type { DocumentMetadata } from '@/core/state/stores/DocumentStore';
import type { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import React from 'react';

// Define the shape of your context data

// Updated context type with full generics
interface DetailsContextData<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
  AttachmentType extends Attachment = Attachment
> {
  detailsData: DetailsItem<
    Data<DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, DocumentMetadata>
  >[];
  updateDetailsData: Dispatch<
    SetStateAction<
      DetailsItem<Data<DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, DocumentMetadata>>[]
    >
  >;
}

// Create the context
const DetailsContext = createContext<DetailsContextData | undefined>(undefined);

// Provider props
interface DetailsProviderProps {
  children: ReactNode;
}

export const DetailsProvider: React.FC<DetailsProviderProps> = ({ children }) => {
  const [detailsData, setDetailsData] = useState<
    DetailsItem<Data<DocumentData, DocumentMetadata>>[]
  >([]);

  const updateDetailsData: Dispatch<
    SetStateAction<DetailsItem<Data<DocumentData, DocumentMetadata>>[]>
  > = (callback) => {
    setDetailsData((prevData) =>
      typeof callback === 'function' ? callback([...prevData]) : callback
    );
  };

  const value: DetailsContextData = {
    detailsData,
    updateDetailsData,
  };

  return <DetailsContext.Provider value={value}>{children}</DetailsContext.Provider>;
};

// Custom hook
export const useDetailsContext = (): DetailsContextData => {
  const context = useContext(DetailsContext);
  if (!context) throw new Error('useDetailsContext must be used within a DetailsProvider');
  return context;
};

// Example usage
const exampleDocument: DocumentContent<
  Data<DocumentData<BaseDataEntity>, DocumentMetadata>
> = {
  eventId: 'event123',
  content: {
    /* content structure here */
  },
  meta: {
    documentMetadata: {
      characterSet: 'UTF-8',
      charset: 'UTF-8',
      compatMode: 'on',
      contentType: 'text/html',
      cookie: 'cookieString',
      designMode: 'design',
      dir: 'ltr',
      domain: 'example.com',
      inputEncoding: 'UTF-8',
      lastModified: '2024-11-06',
      linkColor: '#0000FF',
      referrer: 'referrerInfo',
      vlinkColor: '#8A2BE2',
    },
  },
};