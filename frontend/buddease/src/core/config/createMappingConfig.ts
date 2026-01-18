// createMappingConfig.ts
import type { DefaultMeta } from '@/core/config/BaseConfig';
import { MappingConfig } from "@/core/config/MappingConfig";
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { ParsedData } from '@/core/dataIntegration/parseData';
import { CommonData } from '@/core/models/CommonData';

const createMappingConfig = <
  T extends SupportedData<any, any, StructuredMetadata<any, any>>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(): MappingConfig<T, K, Meta> => ({
  fieldMappings: {
    _id: { sourceField: "id", required: true },
    title: { sourceField: ["title", "name", "label"] },
    description: { sourceField: ["description", "desc", "details"] },
    startDate: { sourceField: ["startDate", "start", "createdAt"] },
    endDate: { sourceField: ["endDate", "end", "expiresAt"] },
    collaborationOptions: { sourceField: "collaborationOptions" },
    participants: { sourceField: ["participants", "members", "users"] },
    metadata: { sourceField: "metadata" },
    details: { sourceField: "details" },
    tags: { sourceField: "tags" },
    categories: { sourceField: "categories" },
    documentType: { sourceField: "documentType" },
    documentStatus: { sourceField: "documentStatus" },
    documentOwner: { sourceField: "documentOwner" },
    status: { 
      sourceField: ["status", "state"],
      transform: (value) => value as StatusType
    },
    // Add more field mappings as needed
  },

  typeMappings: {
    CryptoData: {
      dataFields: ["cryptocurrencyPair", "price", "tradingVolume"],
      customTransform: (data: CryptoData) => ({
        cryptocurrencyPair: data.cryptocurrencyPair,
        price: data.price,
        tradingVolume: data.tradingVolume,
      } as Partial<T>),
      validationRules: [
        {
          field: "price" as keyof T,
          validator: (value) => typeof value === 'number' && value >= 0,
          errorMessage: "Price must be a positive number"
        }
      ]
    },
    UserData: {
      dataFields: ["email", "username", "role"],
      // Add UserData specific transformations
    },
    ProjectManagement: {
      dataFields: ["projectId", "tasks", "teamMembers"],
      // Add ProjectManagement specific transformations
    },
    Task: {
      dataFields: ["title", "description", "dueDate", "priority"],
      // Add Task specific transformations
    },
    Todo: {
      dataFields: ["title", "completed", "dueDate"],
      // Add Todo specific transformations
    },
    Calendar: {
      dataFields: ["title", "startDate", "endDate", "eventId"],
      // Add Calendar specific transformations
    }
  },

  options: {
    strictMode: false,
    autoMapCommonFields: true,
    preserveUnknownFields: true,
    caseSensitive: false,
    arrayHandling: 'first'
  },

  validation: {
    enable: true,
    skipInvalid: false,
    logErrors: true
  },

  hooks: {
    preMap: (sourceData) => {
      // Pre-processing logic
      return sourceData;
    },
    postMap: (mappedData, sourceData) => {
      // Post-processing logic
      return mappedData;
    }
  }
});

// Updated mapping function with configuration
const mapParsedDataToCommonData = <
  T extends SupportedData<any, any, StructuredMetadata<any, any>>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(
  parsedData: ParsedData<T>,
  config?: Partial<MappingConfig<T, K, Meta>>
): CommonData<T, K, Meta> => {
  
  const mappingConfig = {
    ...createMappingConfig<T, K, Meta>(),
    ...config
  };

  // Execute pre-map hook if defined
  const sourceData = mappingConfig.hooks.preMap 
    ? mappingConfig.hooks.preMap(parsedData.data)
    : parsedData.data;

  const typeName = Object.getPrototypeOf(sourceData).constructor.name;

  // Initialize common data with mapped fields
  const commonData: CommonData<T, K, Meta> = {
    _id: "", // You'll need to generate this properly
  } as CommonData<T, K, Meta>;

  // Map fields based on configuration
  Object.entries(mappingConfig.fieldMappings).forEach(([targetField, mapping]) => {
    if (mapping) {
      const fieldName = targetField as keyof CommonData<T, K, Meta>;
      let value: any;

      // Find value from source fields
      if (Array.isArray(mapping.sourceField)) {
        for (const sourceField of mapping.sourceField) {
          if (sourceField in sourceData) {
            value = sourceData[sourceField];
            break;
          }
        }
      } else {
        value = sourceData[mapping.sourceField];
      }

      // Apply transformation if defined
      if (mapping.transform && value !== undefined) {
        value = mapping.transform(value, sourceData);
      }

      // Use default value if value is undefined and default is provided
      if (value === undefined && mapping.defaultValue !== undefined) {
        value = mapping.defaultValue;
      }

      // Set the value if it's defined or required
      if (value !== undefined || mapping.required) {
        (commonData as any)[fieldName] = value;
      }
    }
  });

  // Handle type-specific data mapping
  const typeMapping = mappingConfig.typeMappings[typeName];
  if (typeMapping) {
    if (typeMapping.customTransform) {
      commonData.data = typeMapping.customTransform(sourceData) as T;
    } else {
      // Auto-map data fields
      const data: Partial<T> = {};
      typeMapping.dataFields.forEach(field => {
        if (field in sourceData) {
          data[field] = sourceData[field];
        }
      });
      commonData.data = data as T;
    }

    // Apply validation if enabled
    if (mappingConfig.validation.enable && typeMapping.validationRules) {
      typeMapping.validationRules.forEach(rule => {
        const value = commonData.data?.[rule.field];
        if (value !== undefined && !rule.validator(value)) {
          if (mappingConfig.validation.logErrors) {
            console.error(`Validation failed for ${String(rule.field)}: ${rule.errorMessage || 'Invalid value'}`);
          }
          if (!mappingConfig.validation.skipInvalid) {
            throw new Error(`Validation failed for ${String(rule.field)}: ${rule.errorMessage || 'Invalid value'}`);
          }
        }
      });
    }
  }

  // Execute post-map hook if defined
  return mappingConfig.hooks.postMap 
    ? mappingConfig.hooks.postMap(commonData, parsedData.data)
    : commonData;
};

export { createMappingConfig, mapParsedDataToCommonData };
export type { MappingConfig };
