# 📦 Import Fix Report (Validated)

**Generated:** 2025-12-20T07:05:30.402Z
**Total Issues Found:** 118
**✅ Valid Suggestions:** 118
**❌ Invalid/Needs Review:** 0
**Files with Valid Issues:** 84
**Files with Invalid Issues:** 0

## ✅ Validated Fixes (Ready to Apply)

#### 📄 src/app/api/phases/phaseApiService.ts

1. **Line 5**: `@/app/models/tracker/ProgressBar`
   - **Suggested fix:** `@/app/models/tracker/ProgressBar` → `@/app/models/data/StatusType`
   - **Validation:** Found: src/app/models/data/StatusType.ts

#### 📄 src/app/api/processSnapshotData.ts

1. **Line 14**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/components/database/MigrationSystem.ts

1. **Line 5**: `@/app/typings/database`
   - **Suggested fix:** `@/app/typings/database` → `@/app/server/database/DatabaseServiceFactory`
   - **Validation:** Found: src/app/server/database/DatabaseServiceFactory.ts

#### 📄 src/app/components/database/SchemaEvolutionManager.ts

1. **Line 12**: `@/app/typings/database`
   - **Suggested fix:** `@/app/typings/database` → `@/app/server/database/DatabaseServiceFactory`
   - **Validation:** Found: src/app/server/database/DatabaseServiceFactory.ts

#### 📄 src/app/components/routing/Search.tsx

1. **Line 10**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/components/crypto/ClientSanitization`
   - **Validation:** Found: src/app/components/crypto/ClientSanitization.ts

#### 📄 src/app/config/FrontendConfig.ts

1. **Line 2**: `@/app/api/ApiConfigService`
   - **Suggested fix:** `@/app/api/ApiConfigService` → `@/app/config/CacheConfig`
   - **Validation:** Found: src/app/config/CacheConfig.ts

2. **Line 2**: `@/app/api/ApiConfigService`
   - **Suggested fix:** `@/app/api/ApiConfigService` → `@/app/services/ConfigurationService`
   - **Validation:** Found: src/app/services/ConfigurationService.ts

#### 📄 src/app/config/PlaceholderDatabaseService.tsx

1. **Line 3**: `@/app/server/database/ClientDatabaseService`
   - **Suggested fix:** `@/app/server/database/ClientDatabaseService` → `@/app/config/DatabaseTypes`
   - **Validation:** Found: src/app/config/DatabaseTypes.ts

#### 📄 src/app/config/StructuredMetadata.ts

1. **Line 2**: `@/app/collaborators/Collaborator`
   - **Suggested fix:** `@/app/collaborators/Collaborator` → `@/app/models/teams/Contributor`
   - **Validation:** Found: src/app/models/teams/Contributor.ts

#### 📄 src/app/config/getDatabaseConfig.tsx

1. **Line 4**: `@/app/typings/database`
   - **Suggested fix:** `@/app/typings/database` → `@/app/server/database/DatabaseServiceFactory`
   - **Validation:** Found: src/app/server/database/DatabaseServiceFactory.ts

#### 📄 src/app/dataIntegration/reduxIntegration.ts

1. **Line 9**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/app/documents/DocumentGeneratorMethods.ts

1. **Line 44**: `@/app/documents/DocType`
   - **Suggested fix:** `@/app/documents/DocType` → `@/app/dataIntegration/parseData`
   - **Validation:** Found: src/app/dataIntegration/parseData.ts

#### 📄 src/app/examples/CacheExample.ts

1. **Line 8**: `@/app/config/appStructure/BackendStructure`
   - **Suggested fix:** `@/app/config/appStructure/BackendStructure` → `@/app/server/database/BackendStructure`
   - **Validation:** Found: src/app/server/database/BackendStructure.ts

#### 📄 src/app/features/shortcuts/ShortcutKeys.tsx

1. **Line 13**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/typings/eventHandlers/eventTypes`
   - **Validation:** Found: src/app/typings/eventHandlers/eventTypes.ts

#### 📄 src/app/generators/corrections/analyzers/unifiedAnalyzer.ts

1. **Line 2**: `./frontendAnalyzer`
   - **Suggested fix:** `./frontendAnalyzer` → `@/app/generators/corrections/analyzers/ComprehensiveFrontendAnalyzer`
   - **Validation:** Found: src/app/generators/corrections/analyzers/ComprehensiveFrontendAnalyzer.ts

#### 📄 src/app/hooks/useCryptoIntegration.ts

1. **Line 4**: `@/app/services/CryptoIntegrationService`
   - **Suggested fix:** `@/app/services/CryptoIntegrationService` → `@/app/components/crypto/CryptoPortfolio`
   - **Validation:** Found: src/app/components/crypto/CryptoPortfolio.ts

#### 📄 src/app/hooks/useRoleAccess.ts

1. **Line 6**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/state/context/AuthContext`
   - **Validation:** Found: src/app/state/context/AuthContext.tsx

2. **Line 8**: `@/app/documents/attachment/Attachment`
   - **Suggested fix:** `@/app/documents/attachment/Attachment` → `@/app/config/BaseConfig`
   - **Validation:** Found: src/app/config/BaseConfig.ts

#### 📄 src/app/libraries/eventSystem/ProjectEventEmitter.ts

1. **Line 2**: `@/app/libraries/theme/BrandingService`
   - **Suggested fix:** `@/app/libraries/theme/BrandingService` → `@/app/branding/BrandingSettings`
   - **Validation:** Found: src/app/branding/BrandingSettings.ts

#### 📄 src/app/models/data/BookmarkData.ts

1. **Line 5**: `./StatusType`
   - **Suggested fix:** `./StatusType` → `@/app/models/data/StatusType`
   - **Validation:** Found: src/app/models/data/StatusType.ts

#### 📄 src/app/models/data/EventPriorityClassification.ts

1. **Line 2**: `./StatusType`
   - **Suggested fix:** `./StatusType` → `@/app/models/data/StatusType`
   - **Validation:** Found: src/app/models/data/StatusType.ts

#### 📄 src/app/models/data/dataStoreMethods.ts

1. **Line 5**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

2. **Line 5**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotList`
   - **Validation:** Found: src/app/snapshots/SnapshotList.tsx

3. **Line 5**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotStoreProps`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreProps.ts

#### 📄 src/app/pages/forms/LoginForm.tsx

1. **Line 6**: `@/app/state/context/NotificationContext`
   - **Suggested fix:** `@/app/state/context/NotificationContext` → `@/app/features/support/UnifiedNotificationTypes`
   - **Validation:** Found: src/app/features/support/UnifiedNotificationTypes.ts

#### 📄 src/app/pages/personas/TestBuilder.tsx

1. **Line 4**: `@/app/pages/personas/ScenarioBuilder`
   - **Suggested fix:** `@/app/pages/personas/ScenarioBuilder` → `@/app/hooks/useTestPhaseHooks`
   - **Validation:** Found: src/app/hooks/useTestPhaseHooks.tsx

#### 📄 src/app/pages/personas/recruiterDashboard/PersonaBuilderDashboard.tsx

1. **Line 16**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/pages/personas/Persona`
   - **Validation:** Found: src/app/pages/personas/Persona.tsx

#### 📄 src/app/pages/searches/FilterCriteria.ts

1. **Line 4**: `@/app/api/snapshotApi`
   - **Suggested fix:** `@/app/api/snapshotApi` → `@/app/api/SnapshotApi`
   - **Validation:** Found: src/app/api/SnapshotApi.ts

#### 📄 src/app/payment/PaymentGateways.tsx

1. **Line 4**: `@/app/payment/PaymentGateways`
   - **Suggested fix:** `@/app/payment/PaymentGateways` → `@/app/typings/eventHandlers/domEventHandlers`
   - **Validation:** Found: src/app/typings/eventHandlers/domEventHandlers.ts

#### 📄 src/app/payment/Payments.tsx

1. **Line 2**: `@/app/payment/PaymentGateways`
   - **Suggested fix:** `@/app/payment/PaymentGateways` → `@/app/typings/eventHandlers/domEventHandlers`
   - **Validation:** Found: src/app/typings/eventHandlers/domEventHandlers.ts

#### 📄 src/app/server/auth/AppRouter.tsx

1. **Line 10**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/typings/authTypes`
   - **Validation:** Found: src/app/typings/authTypes.ts

#### 📄 src/app/server/auth/AuthComponent.tsx

1. **Line 4**: `@/app/generators/GenerateTokens`
   - **Suggested fix:** `@/app/generators/GenerateTokens` → `@/app/generators/GenerateTokens`
   - **Validation:** Found: src/app/generators/GenerateTokens.ts

#### 📄 src/app/server/auth/AuthServerService.ts

1. **Line 9**: `@/app/typings/database`
   - **Suggested fix:** `@/app/typings/database` → `@/app/server/database/DatabaseServiceFactory`
   - **Validation:** Found: src/app/server/database/DatabaseServiceFactory.ts

#### 📄 src/app/server/database/CustomDataProvider.tsx

1. **Line 4**: `@/app/models/data/dataContracts`
   - **Suggested fix:** `@/app/models/data/dataContracts` → `@/app/state/context/DataContext`
   - **Validation:** Found: src/app/state/context/DataContext.tsx

#### 📄 src/app/server/database/DatabaseServiceFactory.ts

1. **Line 6**: `@/app/typings/database`
   - **Suggested fix:** `@/app/typings/database` → `@/app/server/database/DatabaseServiceFactory`
   - **Validation:** Found: src/app/server/database/DatabaseServiceFactory.ts

#### 📄 src/app/server/security/SecurityConfiguration.ts

1. **Line 5**: `@/app/services/ConfigurationService`
   - **Suggested fix:** `@/app/services/ConfigurationService` → `@/app/api/ApiConfigService`
   - **Validation:** Found: src/app/api/ApiConfigService.ts

#### 📄 src/app/services/CryptoIntegrationService.ts

1. **Line 5**: `@/app/api/PortfolioService`
   - **Suggested fix:** `@/app/api/PortfolioService` → `@/app/components/crypto/CryptoPortfolio`
   - **Validation:** Found: src/app/components/crypto/CryptoPortfolio.ts

#### 📄 src/app/services/roadmapService.ts

1. **Line 5**: `@/app/scripts/devCorrectionRoadmap`
   - **Suggested fix:** `@/app/scripts/devCorrectionRoadmap` → `@/app/typings/roadmap`
   - **Validation:** Found: src/app/typings/roadmap.ts

#### 📄 src/app/snapshots/CoreSnapshot.tsx

1. **Line 19**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/app/snapshots/SnapshohtDevConfigs.ts

1. **Line 7**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/app/snapshots/SnapshotContent.ts

1. **Line 5**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/app/snapshots/SnapshotManagement.ts

1. **Line 6**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

2. **Line 6**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/interfaces/payload/payloadTypes`
   - **Validation:** Found: src/app/interfaces/payload/payloadTypes.ts

#### 📄 src/app/snapshots/SnapshotMap.ts

1. **Line 9**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/app/snapshots/SnapshotStoreMethods.ts

1. **Line 15**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/snapshots/SnapshotStoreProps.ts

1. **Line 17**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/app/snapshots/SnapshotType.ts

1. **Line 11**: `@/app/snapshots/SnapshotStoreConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotStoreConfig` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/app/snapshots/convertSnapshot.ts

1. **Line 11**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

2. **Line 14**: `@/app/snapshots/SnapshotStoreMethods`
   - **Suggested fix:** `@/app/snapshots/SnapshotStoreMethods` → `@/app/snapshots/SnapshotStoreProps`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreProps.ts

#### 📄 src/app/snapshots/convertSnapshotsArray.ts

1. **Line 12**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/app/snapshots/createSnapshot.ts

1. **Line 13**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/snapshots/createSnapshotExample.ts

1. **Line 2**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/snapshots/createSnapshotStoreOptions.ts

1. **Line 32**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

2. **Line 32**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

3. **Line 32**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

4. **Line 32**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotStoreProps`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreProps.ts

5. **Line 32**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

6. **Line 32**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/subscribers/subscribeToSnapshotsImplementation`
   - **Validation:** Found: src/app/subscribers/subscribeToSnapshotsImplementation.ts

#### 📄 src/app/snapshots/defaultDataStoreMethods.ts

1. **Line 18**: `@/app/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/app/snapshots/LocalStorageSnapshotStore` → `@/app/interfaces/payload/payloadTypes`
   - **Validation:** Found: src/app/interfaces/payload/payloadTypes.ts

2. **Line 44**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

3. **Line 44**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotList`
   - **Validation:** Found: src/app/snapshots/SnapshotList.tsx

#### 📄 src/app/snapshots/methods/commonDataStoreMethods.ts

1. **Line 10**: `@/app/typings/entities/AppEntity`
   - **Suggested fix:** `@/app/typings/entities/AppEntity` → `@/app/typings/entities/SnapshotEntity`
   - **Validation:** Found: src/app/typings/entities/SnapshotEntity.ts

#### 📄 src/app/snapshots/methods/containerMethods.ts

1. **Line 8**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/app/snapshots/methods/subscriptionMethods.ts

1. **Line 7**: `@/app/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/app/snapshots/LocalStorageSnapshotStore` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

2. **Line 12**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/typings/snapshotTypes`
   - **Validation:** Found: src/app/typings/snapshotTypes.ts

#### 📄 src/app/snapshots/methods/validationMethods.ts

1. **Line 8**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/snapshots/SnapshotStoreOptions`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreOptions.ts

#### 📄 src/app/snapshots/newStoreUtils.ts

1. **Line 13**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/app/snapshots/responsetUtils.ts

1. **Line 8**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/app/snapshots/snapshotDelegate.ts

1. **Line 11**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

#### 📄 src/app/snapshots/transformSnapshotsToStores.tsx

1. **Line 7**: `@/app/snapshots/SnapshotStoreConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotStoreConfig` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/snapshots/updateSubscribersAndSnapshots.ts

1. **Line 17**: `@/app/interfaces/payload/payloadTypes`
   - **Suggested fix:** `@/app/interfaces/payload/payloadTypes` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

2. **Line 17**: `@/app/interfaces/payload/payloadTypes`
   - **Suggested fix:** `@/app/interfaces/payload/payloadTypes` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

3. **Line 17**: `@/app/interfaces/payload/payloadTypes`
   - **Suggested fix:** `@/app/interfaces/payload/payloadTypes` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

4. **Line 17**: `@/app/interfaces/payload/payloadTypes`
   - **Suggested fix:** `@/app/interfaces/payload/payloadTypes` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/app/state/redux/sagas/apiSagas.ts

1. **Line 3**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/api/ConfigManager`
   - **Validation:** Found: src/app/api/ConfigManager.ts

#### 📄 src/app/state/redux/sagas/fileSagas.ts

1. **Line 3**: `@/app/components/configs/DetermineFileType`
   - **Suggested fix:** `@/app/components/configs/DetermineFileType` → `@/app/api/ApiFiles`
   - **Validation:** Found: src/app/api/ApiFiles.ts

2. **Line 14**: `@/app/state/redux/sagas/fileSagas`
   - **Suggested fix:** `@/app/state/redux/sagas/fileSagas` → `@/app/snapshots/methods/dataMethods`
   - **Validation:** Found: src/app/snapshots/methods/dataMethods.ts

#### 📄 src/app/state/redux/slices/TaskSlice.ts

1. **Line 7**: `@/app/typings/entities/UserEntity`
   - **Suggested fix:** `@/app/typings/entities/UserEntity` → `@/app/users/User`
   - **Validation:** Found: src/app/users/User.tsx

#### 📄 src/app/state/stores/ArticleStore.ts

1. **Line 4**: `@/app/state/context/NotificationContext`
   - **Suggested fix:** `@/app/state/context/NotificationContext` → `@/app/features/support/UnifiedNotificationTypes`
   - **Validation:** Found: src/app/features/support/UnifiedNotificationTypes.ts

#### 📄 src/app/state/stores/CalendarManagerStore.tsx

1. **Line 7**: `@/app/api/subscriberApi`
   - **Suggested fix:** `@/app/api/subscriberApi` → `@/app/api/SnapshotApi`
   - **Validation:** Found: src/app/api/SnapshotApi.ts

2. **Line 71**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

#### 📄 src/app/state/stores/CommonEvent.ts

1. **Line 12**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

2. **Line 19**: `@/app/models/tracker/Tag`
   - **Suggested fix:** `@/app/models/tracker/Tag` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

#### 📄 src/app/state/stores/DataStore.ts

1. **Line 30**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

2. **Line 30**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

3. **Line 30**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotList`
   - **Validation:** Found: src/app/snapshots/SnapshotList.tsx

4. **Line 30**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotStoreMethods`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreMethods.ts

5. **Line 30**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotStoreProps`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreProps.ts

#### 📄 src/app/state/stores/DetailsListStore.ts

1. **Line 43**: `@/app/snapshots/SnapshotWithCriteria`
   - **Suggested fix:** `@/app/snapshots/SnapshotWithCriteria` → `@/app/snapshots/SnapshotConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotConfig.ts

2. **Line 43**: `@/app/snapshots/SnapshotWithCriteria`
   - **Suggested fix:** `@/app/snapshots/SnapshotWithCriteria` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

#### 📄 src/app/state/stores/DocumentStore.ts

1. **Line 12**: `@/app/documents/DocumentOptions`
   - **Suggested fix:** `@/app/documents/DocumentOptions` → `@/app/models/data/StatusType`
   - **Validation:** Found: src/app/models/data/StatusType.ts

#### 📄 src/app/state/stores/TaskStore .tsx

1. **Line 20**: `@/app/components/models/tasks/TaskDataSource`
   - **Suggested fix:** `@/app/components/models/tasks/TaskDataSource` → `@/app/models/tasks/Task`
   - **Validation:** Found: src/app/models/tasks/Task.tsx

#### 📄 src/app/subscriptions/SubscriptionService.tsx

1. **Line 3**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/interfaces/provider/AuthenticationProvider`
   - **Validation:** Found: src/app/interfaces/provider/AuthenticationProvider.ts

#### 📄 src/app/subscriptions/subscriberTypeGuads.ts

1. **Line 9**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/app/todos/Todo.ts

1. **Line 33**: `@/app/models/tracker/Tag`
   - **Suggested fix:** `@/app/models/tracker/Tag` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

#### 📄 src/app/ts/EventDataService.tsx

1. **Line 5**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/api/ConfigManager`
   - **Validation:** Found: src/app/api/ConfigManager.ts

#### 📄 src/app/ts/ScheduleEventModal.tsx

1. **Line 2**: `@/app/state/stores/CalendarManagerStore`
   - **Suggested fix:** `@/app/state/stores/CalendarManagerStore` → `@/app/calendar/CalendarEvent`
   - **Validation:** Found: src/app/calendar/CalendarEvent.ts

#### 📄 src/app/typings/YourSpecificSnapshotType.ts

1. **Line 14**: `@/app/snapshots/SnapshotStoreConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotStoreConfig` → `@/app/snapshots/SnapshotStoreProps`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreProps.ts

2. **Line 14**: `@/app/snapshots/SnapshotStoreConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotStoreConfig` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

#### 📄 src/app/typings/appEventTypes.ts

1. **Line 9**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/app/typings/entities/AssignEntity.ts

1. **Line 8**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

2. **Line 8**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/typings/entities/AuthEntity.ts

1. **Line 11**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

2. **Line 11**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/typings/entities/DetailsEntity.ts

1. **Line 8**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/models/content/AddContent`
   - **Validation:** Found: src/app/models/content/AddContent.tsx

2. **Line 11**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

3. **Line 11**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/typings/entities/UserEntity.ts

1. **Line 10**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

2. **Line 10**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/typings/exchangeTypes.ts

1. **Line 4**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

2. **Line 4**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

#### 📄 src/app/users/preferences/handleNotificationPreferences.ts

1. **Line 4**: `[object Object]`
   - **Suggested fix:** `[object Object]` → `@/app/typings/eventHandlers/eventTypes`
   - **Validation:** Found: src/app/typings/eventHandlers/eventTypes.ts

#### 📄 src/utils/snapshotUtils.tsx

1. **Line 16**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/SnapshotConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotConfig.ts

2. **Line 16**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

3. **Line 16**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

#### 📄 src/utils/versionUtils.ts

1. **Line 5**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/utils/web3/applicationUtils.tsx

1. **Line 49**: `@/utils/snapshotUtils`
   - **Suggested fix:** `@/utils/snapshotUtils` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/utils/web3/dAppAdapter/DApp.tsx

1. **Line 22**: `@/app/typings/database`
   - **Suggested fix:** `@/app/typings/database` → `@/app/server/database/DatabaseServiceFactory`
   - **Validation:** Found: src/app/server/database/DatabaseServiceFactory.ts

### 🚀 Available Commands

```bash
# Scan only (dry run)
pnpm run fix-imports:dry-run

# Apply safest fixes only (symbol-based, ≥95% confidence)
pnpm run fix-imports:safe

# Apply high confidence fixes (≥90% confidence)
pnpm run fix-imports:high

# Apply medium+ confidence fixes (≥70% confidence)
pnpm run fix-imports

# Apply all fixes (including low confidence)
pnpm run fix-imports:all

# Rollback all previous fixes
pnpm run fix-imports:rollback
```

### 📋 Recommended Workflow

1. **Scan first:** `pnpm run fix-imports:dry-run`
2. **Review report:** Check ./reports/import-fixes.md
3. **Apply safest fixes:** `pnpm run fix-imports:safe`
4. **Test:** `pnpm run test:types`
5. **If needed, apply more fixes:** `pnpm run fix-imports:high` or `pnpm run fix-imports`
6. **Rollback if needed:** `pnpm run fix-imports:rollback`

