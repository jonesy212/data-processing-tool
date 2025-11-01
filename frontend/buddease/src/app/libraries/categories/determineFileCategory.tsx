// determineFileCategory.tsx
import * as snapshotApi from '@/app/api/SnapshotApi';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { FileCategory } from "@/app/documents/FileType";
// Utility function to determine file category based on categoryName
function determineFileCategory(categoryName: string): FileCategory {
  // Implement logic to determine file category based on the provided categoryName
  // For simplicity, this example assumes a direct mapping, but you can expand this logic
  switch (categoryName) {
    case "User":
      return FileCategory.Component;
    case "Task":
      return FileCategory.Utility;
    case "Todo":
      return FileCategory.Utility;
    case "Project":
      return FileCategory.Component;
    case "Product":
      return FileCategory.Component;
    case "Calendar":
      return FileCategory.Component;
    case "Component":
      return FileCategory.Component;
    case "Redux":
      return FileCategory.Redux;
    case "MobX":
      return FileCategory.MobX;
    case "API":
      return FileCategory.API;
    case "Utility":
      return FileCategory.Utility;
    case "Config":
      return FileCategory.Config;
    case "Test":
      return FileCategory.Test;
    case "Documentation":
      return FileCategory.Documentation;
    case "Design":
      return FileCategory.Design;
    case "Multimedia":
      return FileCategory.Multimedia;
    case "Configuration":
      return FileCategory.Configuration;
    case "Analytics":
      return FileCategory.Analytics;
    case "Localization":
      return FileCategory.Localization;
    case "SmartContract":
      return FileCategory.SmartContract;
    case "Bytecode":
      return FileCategory.Bytecode;
    case "EthereumPackage":
      return FileCategory.EthereumPackage;
    case "JWT":
      return FileCategory.JWT;
    case "BlockchainData":
      return FileCategory.BlockchainData;
    case "CryptoKey":
      return FileCategory.CryptoKey;
    case "Wallet":
      return FileCategory.Wallet;
    case "Hash":
      return FileCategory.Hash;
    case "MerkleProof":
      return FileCategory.MerkleProof;
    case "ENS":
      return FileCategory.ENS;
    default:
      throw new Error(`Unknown category: ${categoryName}`);
  }
}

// Example implementation of fetching snapshot data based on category
async function fetchFileSnapshotData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  category: FileCategory,
  snapshotId: string
): Promise<{ data: any }> {

  const data =  snapshotApi.getSnapshotData(snapshotId);

  return { data };
}
export default determineFileCategory;
export { fetchFileSnapshotData };
