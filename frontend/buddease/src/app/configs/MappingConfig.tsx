// MappingConfig.tsx

import { CryptoData, ParsedData } from "../components/crypto/parseData";
import { SupportedData } from "../components/models/CommonData";
import { CommonData } from "../components/models/CommonDetails";


const mapParsedDataToCommonData = <T extends SupportedData>(
  parsedData: ParsedData<T>
): CommonData<T> => {
  // Get the type name of the data
  const typeName = Object.getPrototypeOf(parsedData.data).constructor.name;

  // Initialize common data with common keys
  const commonData: CommonData<T> = {
    title: parsedData.data.title,
    description: parsedData.data.description,
    startDate: parsedData.data.startDate,
    endDate: parsedData.data.endDate,
    status: parsedData.data.status,
    collaborationOptions: parsedData.data.collaborationOptions,
    participants: parsedData.data.participants,
    metadata: parsedData.data.metadata,
    details: parsedData.data.details,
    data: {} as T extends CryptoData
      ? { cryptocurrencyPair: string; price: number; tradingVolume: number }
      : {},
    tags: parsedData.data.tags,
    categories: parsedData.data.categories,
    documentType: parsedData.data.documentType,
    documentStatus: parsedData.data.documentStatus,
    documentOwner: parsedData.data.documentOwner,
    documentAccess: parsedData.data.documentAccess,
    documentSharing: parsedData.data.documentSharing,
    documentSecurity: parsedData.data.documentSecurity,
    documentRetention: parsedData.data.documentRetention,
    documentLifecycle: parsedData.data.documentLifecycle,
    documentWorkflow: parsedData.data.documentWorkflow,
    documentIntegration: parsedData.data.documentIntegration,
    documentReporting: parsedData.data.documentReporting,
    documentBackup: parsedData.data.documentBackup,
  };

  // Assign specific data properties based on the type
  switch (typeName) {
    case "CryptoData":
      const cryptoData = parsedData.data as CryptoData;
      commonData.data = {
        cryptocurrencyPair: cryptoData.cryptocurrencyPair,
        price: cryptoData.price,
        tradingVolume: cryptoData.tradingVolume,
      };
      break;
    case "UserData":
      // Handle mapping for UserData type
      // Example: commonData.data = { ... };
      break;
    case "Todo":
      // Handle mapping for Todo type
      // Example: commonData.data = { ... };
      break;
    // Add cases for other supported data types
    default:
      // Handle unsupported data types
      throw new Error(`Unsupported data type: ${typeName}`);
  }

  return commonData;
};
  