export interface BlockchainPermissions {
  canTransferTokens: boolean;
  canViewBlockchainTransactions: boolean;
  canDeploySmartContracts: boolean;
  canInteractWithSmartContracts: boolean;
  canAccessDecentralizedApplications: boolean;
  canManageBlockchainAssets: boolean;
  // Add more permissions as needed
}
