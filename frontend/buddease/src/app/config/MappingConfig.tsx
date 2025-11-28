// MappingConfig.tsx
// MappingConfig.ts
import { CryptoData, ParsedData } from "@/app/dataIntegration/parseData";
import { SupportedData } from "@/app/models/CommonData";
import { CommonData } from "@/app/models/details/CommonDetails";
import { StatusType } from "@/app/models/data/StatusType";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Attachment } from '@/app/documents/attachment/Attachment';


export interface MappingConfig<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Field mapping configuration
  fieldMappings: {
    [key in keyof CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>]?: {
      sourceField: string | string[];
      transform?: (value: any, sourceData: any) => any;
      required?: boolean;
      defaultValue?: any;
    };
  };

  // Type-specific mappings
  typeMappings: {
    [typeName: string]: {
      dataFields: (keyof T)[];
      customTransform?: (data: any) => Partial<T>;
      validationRules?: {
        field: keyof T;
        validator: (value: any) => boolean;
        errorMessage?: string;
      }[];
    };
  };

  // Global mapping options
  options: {
    strictMode: boolean;
    autoMapCommonFields: boolean;
    preserveUnknownFields: boolean;
    caseSensitive: boolean;
    arrayHandling: 'first' | 'concat' | 'merge';
  };

  // Validation configuration
  validation: {
    enable: boolean;
    skipInvalid: boolean;
    logErrors: boolean;
  };

  // Transformation hooks
  hooks: {
    preMap?: (sourceData: any) => any;
    postMap?: (mappedData: CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, sourceData: any) => CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  };
}

type ParsedData<T> = Partial<T> & { type?: AllTypes };

const mapParsedDataToCommonData = <
  T extends SupportedData<any, any, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  parsedData: ParsedData<T>
): CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {

  // 1️⃣ Extract type if present, otherwise fallback
  const typeValue: AllTypes | undefined = parsedData.type;

  // 2️⃣ Get runtime type name (for switch/case logic)
  const typeName = Object.getPrototypeOf(parsedData.data)?.constructor?.name ?? 'Unknown';

  // 3️⃣ Initialize common data with defaults and dynamic fields
  const commonData: CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    ...parsedData,
    type: typeValue ?? ('defaultType' as AllTypes),
    _metadata: (parsedData as any)._metadata ?? {} as Meta,
    _owner: (parsedData as any)._owner ?? null,
    categoryProperties: (parsedData as any).categoryProperties ?? {},
    // Optional: set base/default fields if missing
    _id: parsedData._id ?? '',
    title: parsedData.title ?? '',
    label: parsedData.label ?? null,
    data: parsedData.data ?? {},
    title: parsedData.data?.title ?? '',
    description: parsedData.data?.description ?? '',
    startDate: parsedData.data?.startDate ?? null,
    endDate: parsedData.data?.endDate ?? null,
    collaborationOptions: parsedData.data?.collaborationOptions ?? {},
    participants: parsedData.data?.participants ?? [],
    metadata: parsedData.data?.metadata ?? {},
    details: parsedData.data?.details ?? {},
    data: parsedData.data ?? {},
    tags: parsedData.data?.tags ?? [],
    categories: parsedData.data?.categories ?? [],
    documentType: parsedData.data?.documentType ?? null,
    documentStatus: parsedData.data?.documentStatus ?? null,
    documentOwner: parsedData.data?.documentOwner ?? null,
    documentAccess: parsedData.data?.documentAccess ?? null,
    documentSharing: parsedData.data?.documentSharing ?? null,
    documentSecurity: parsedData.data?.documentSecurity ?? null,
    documentRetention: parsedData.data?.documentRetention ?? null,
    documentLifecycle: parsedData.data?.documentLifecycle ?? null,
    documentWorkflow: parsedData.data?.documentWorkflow ?? null,
    documentIntegration: parsedData.data?.documentIntegration ?? null,
    documentReporting: parsedData.data?.documentReporting ?? null,
    documentBackup: parsedData.data?.documentBackup ?? null,
    label: parsedData.data?.label ?? null,
    currentMeta: parsedData.data?.currentMeta ?? {},
    currentMetadata: parsedData.data?.currentMetadata ?? {},
    date: parsedData.data?.date ?? null,
    createdBy: parsedData.data?.createdBy ?? null,
    status: parsedData.data?.status as StatusType ?? 'pending' as StatusType,

  };
    // Add more default assignments if needed
  };

  // 4️⃣ Apply type-specific mappings
  switch (typeName) {
    case "CryptoData":
      const cryptoData = parsedData.data as CryptoData;
      commonData.data = {
        cryptocurrencyPair: cryptoData.cryptocurrencyPair,
        price: cryptoData.price,
        tradingVolume: cryptoData.tradingVolume,
      } as T;
      break;

    case "UserData":
      // Handle mapping for UserData
      break;

    case "ProjectManagement":
      // Handle mapping for ProjectManagement
      break;

    case "Task":
      // Handle mapping for Task
      break;

    case "Todo":
      // Handle mapping for Todo
      break;

    case "Calendar":
      // Handle mapping for Calendar
      break;

    default:
      if (!typeValue) {
        // If no type and unknown constructor, assign defaults
        commonData.data = parsedData.data ?? {} as T;
      } else {
        throw new Error(`Unsupported data type: ${typeName}`);
      }
  }

  return commonData;
};


export { mapParsedDataToCommonData };
