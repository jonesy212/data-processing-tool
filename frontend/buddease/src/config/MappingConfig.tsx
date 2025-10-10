// MappingConfig.ts
import { CryptoData, ParsedData } from "@/app/components/crypto/parseData";
import { SupportedData } from "@/app/models/CommonData";
import { CommonData } from "@/app/components/models/CommonDetails";
import { StatusType } from "@/app/models/data/StatusType";
import { StructuredMetadata } from "@/config/StructuredMetadata";


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
    postMap?: (mappedData: CommonData<T, K, Meta>, sourceData: any) => CommonData<T, K, Meta>;
  };
}

const mapParsedDataToCommonData = <
  T extends SupportedData<any, any, StructuredMetadata<any, any>>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(
  parsedData: ParsedData<T>
): CommonData<T, K, Meta> => {
  // Get the type name of the data
  const typeName = Object.getPrototypeOf(parsedData.data).constructor.name;

  // Initialize common data with common keys
  const commonData: CommonData<T, K, Meta> = {
    _id: "", // Assuming _id is required, add logic to assign it correctly
    title: parsedData.data["title"],
    description: parsedData.data["description"],
    startDate: parsedData.data["startDate"],
    endDate: parsedData.data["endDate"],
    collaborationOptions: parsedData.data["collaborationOptions"],
    participants: parsedData.data["participants"],
    metadata: parsedData.data["metadata"],
    details: parsedData.data["details"],
    data: parsedData.data,
    tags: parsedData.data["tags"],
    categories: parsedData.data["categories"],
    documentType: parsedData.data["documentType"],
    documentStatus: parsedData.data["documentStatus"],
    documentOwner: parsedData.data["documentOwner"],
    documentAccess: parsedData.data["documentAccess"],
    documentSharing: parsedData.data["documentSharing"],
    documentSecurity: parsedData.data["documentSecurity"],
    documentRetention: parsedData.data["documentRetention"],
    documentLifecycle: parsedData.data["documentLifecycle"],
    documentWorkflow: parsedData.data["documentWorkflow"],
    documentIntegration: parsedData.data["documentIntegration"],
    documentReporting: parsedData.data["documentReporting"],
    documentBackup: parsedData.data["documentBackup"],
    label: parsedData.data["label"],
    currentMeta: parsedData.data["currentMeta"],
    currentMetadata: parsedData.data["currentMetadata"],
    date: parsedData.data["date"],
    createdBy: parsedData.data["createdBy"],
    status: parsedData.data["status"] as StatusType,
  };

  // Assign specific data properties based on the type
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
      // Handle mapping for UserData type
      break;
    case "ProjectManagement":
      // Handle mapping for UserData type
      break;
      case "Task":
      // Handle mapping for UserData type
      break;
    case "Todo":
      // Handle mapping for Todo type
      break;
      case "Calendar":
      // Handle mapping for Todo type
      break;
    case "Task":
      // Handle mapping for UserData type
      break;

    // Add cases for other supported data types
    default:
      // Handle unsupported data types
      throw new Error(`Unsupported data type: ${typeName}`);
  }

  return commonData;
};

export { mapParsedDataToCommonData };
