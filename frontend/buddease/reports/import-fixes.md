# 📦 Import Fix Report (Validated)

**Generated:** 2025-12-24T00:29:04.989Z
**Total Issues Found:** 123
**✅ Valid Suggestions:** 123
**❌ Invalid/Needs Review:** 0
**Files with Valid Issues:** 76
**Files with Invalid Issues:** 0

## ✅ Validated Fixes (Ready to Apply)

#### 📄 src/app/DynamicIntroTooltip.tsx

1. **Line 2**: `intro.js`
   - **Suggested fix:** `intro.js` → `@/app/hooks/useStepNavigation`
   - **Validation:** Found: src/app/hooks/useStepNavigation.ts

#### 📄 src/app/api/phases/phaseApiService.ts

1. **Line 5**: `@/app/models/data/StatusType`
   - **Suggested fix:** `@/app/models/data/StatusType` → `@/app/models/tracker/ProgressBar`
   - **Validation:** Found: src/app/models/tracker/ProgressBar.tsx

#### 📄 src/app/api/processSnapshotData.ts

1. **Line 14**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

#### 📄 src/app/components/database/SchemaEvolutionManager.ts

1. **Line 12**: `@/app/server/database/DatabaseServiceFactory`
   - **Suggested fix:** `@/app/server/database/DatabaseServiceFactory` → `@/app/typings/database`
   - **Validation:** Found: src/app/typings/database.ts

#### 📄 src/app/components/models/file/FileManager.tsx

1. **Line 6**: `@/app/state/redux/slices/FilteredEventsSlice`
   - **Suggested fix:** `@/app/state/redux/slices/FilteredEventsSlice` → `@/app/pages/searches/FilteredEvents`
   - **Validation:** Found: src/app/pages/searches/FilteredEvents.tsx

#### 📄 src/app/config/FrontendConfig.ts

1. **Line 2**: `@/app/config/CacheConfig`
   - **Suggested fix:** `@/app/config/CacheConfig` → `@/app/api/ApiConfigService`
   - **Validation:** Found: src/app/api/ApiConfigService.ts

2. **Line 2**: `@/app/config/CacheConfig`
   - **Suggested fix:** `@/app/config/CacheConfig` → `@/app/services/ConfigurationService`
   - **Validation:** Found: src/app/services/ConfigurationService.ts

#### 📄 src/app/dataIntegration/reduxIntegration.ts

1. **Line 9**: `@/app/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/app/snapshots/LocalStorageSnapshotStore` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/documents/DocumentGeneratorMethods.ts

1. **Line 44**: `@/app/dataIntegration/parseData`
   - **Suggested fix:** `@/app/dataIntegration/parseData` → `@/app/documents/DocType`
   - **Validation:** Found: src/app/documents/DocType.ts

#### 📄 src/app/error-analyzer/CircularDependencyResolver.ts

1. **Line 3**: `./types/ErrorAnalysisTypes`
   - **Suggested fix:** `./types/ErrorAnalysisTypes` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

2. **Line 4**: `./types/FixStrategyTypes`
   - **Suggested fix:** `./types/FixStrategyTypes` → `@/app/error-analyzer/index`
   - **Validation:** Found: src/app/error-analyzer/index.ts

#### 📄 src/app/error-analyzer/ErrorFixManager.ts

1. **Line 2**: `./TypeScriptErrorAnalyzer`
   - **Suggested fix:** `./TypeScriptErrorAnalyzer` → `@/app/error-analyzer/TypeScriptErrorAnalyzer`
   - **Validation:** Found: src/app/error-analyzer/TypeScriptErrorAnalyzer.ts

2. **Line 3**: `./TypeRelationshipAnalyzer`
   - **Suggested fix:** `./TypeRelationshipAnalyzer` → `@/app/error-analyzer/TypeRelationshipAnalyzer`
   - **Validation:** Found: src/app/error-analyzer/TypeRelationshipAnalyzer.ts

3. **Line 4**: `./FixPrioritizer`
   - **Suggested fix:** `./FixPrioritizer` → `@/app/error-analyzer/FixPrioritizer`
   - **Validation:** Found: src/app/error-analyzer/FixPrioritizer.ts

4. **Line 5**: `./FixConfidenceCalculator`
   - **Suggested fix:** `./FixConfidenceCalculator` → `@/app/error-analyzer/FixConfidenceCalculator`
   - **Validation:** Found: src/app/error-analyzer/FixConfidenceCalculator.ts

5. **Line 6**: `./CircularDependencyResolver`
   - **Suggested fix:** `./CircularDependencyResolver` → `@/app/error-analyzer/CircularDependencyResolver`
   - **Validation:** Found: src/app/error-analyzer/CircularDependencyResolver.ts

6. **Line 7**: `./ImportSuggestionGenerator`
   - **Suggested fix:** `./ImportSuggestionGenerator` → `@/app/error-analyzer/ImportSuggestionGenerator`
   - **Validation:** Found: src/app/error-analyzer/ImportSuggestionGenerator.ts

7. **Line 8**: `./FixVerifier`
   - **Suggested fix:** `./FixVerifier` → `@/app/error-analyzer/FixVerifier`
   - **Validation:** Found: src/app/error-analyzer/FixVerifier.ts

8. **Line 9**: `./ProgressTracker`
   - **Suggested fix:** `./ProgressTracker` → `@/app/error-analyzer/ProgressTracker`
   - **Validation:** Found: src/app/error-analyzer/ProgressTracker.ts

9. **Line 10**: `./ReportGenerator`
   - **Suggested fix:** `./ReportGenerator` → `@/app/error-analyzer/ReportGenerator`
   - **Validation:** Found: src/app/error-analyzer/ReportGenerator.ts

#### 📄 src/app/error-analyzer/FixConfidenceCalculator.ts

1. **Line 3**: `./types/ErrorAnalysisTypes`
   - **Suggested fix:** `./types/ErrorAnalysisTypes` → `@/app/error-analyzer/index`
   - **Validation:** Found: src/app/error-analyzer/index.ts

2. **Line 4**: `./types/FixStrategyTypes`
   - **Suggested fix:** `./types/FixStrategyTypes` → `@/app/error-analyzer/index`
   - **Validation:** Found: src/app/error-analyzer/index.ts

#### 📄 src/app/error-analyzer/FixPrioritizer.ts

1. **Line 3**: `./types/ErrorAnalysisTypes`
   - **Suggested fix:** `./types/ErrorAnalysisTypes` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

2. **Line 4**: `./types/FixStrategyTypes`
   - **Suggested fix:** `./types/FixStrategyTypes` → `@/app/error-analyzer/index`
   - **Validation:** Found: src/app/error-analyzer/index.ts

#### 📄 src/app/error-analyzer/FixVerifier.ts

1. **Line 3**: `./types/ErrorAnalysisTypes`
   - **Suggested fix:** `./types/ErrorAnalysisTypes` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

2. **Line 4**: `./types/FixStrategyTypes`
   - **Suggested fix:** `./types/FixStrategyTypes` → `@/app/error-analyzer/index`
   - **Validation:** Found: src/app/error-analyzer/index.ts

#### 📄 src/app/error-analyzer/ImportSuggestionGenerator.ts

1. **Line 3**: `./types/ErrorAnalysisTypes`
   - **Suggested fix:** `./types/ErrorAnalysisTypes` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

2. **Line 4**: `./types/FixStrategyTypes`
   - **Suggested fix:** `./types/FixStrategyTypes` → `@/app/error-analyzer/index`
   - **Validation:** Found: src/app/error-analyzer/index.ts

#### 📄 src/app/error-analyzer/ProgressTracker.ts

1. **Line 2**: `./types/ErrorAnalysisTypes`
   - **Suggested fix:** `./types/ErrorAnalysisTypes` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

#### 📄 src/app/error-analyzer/ReportGenerator.ts

1. **Line 4**: `./ErrorFixManager`
   - **Suggested fix:** `./ErrorFixManager` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

2. **Line 5**: `./TypeScriptErrorAnalyzer`
   - **Suggested fix:** `./TypeScriptErrorAnalyzer` → `@/app/error-analyzer/TypeScriptErrorAnalyzer`
   - **Validation:** Found: src/app/error-analyzer/TypeScriptErrorAnalyzer.ts

#### 📄 src/app/error-analyzer/TypeRelationshipAnalyzer.ts

1. **Line 4**: `./ErrorFixManager`
   - **Suggested fix:** `./ErrorFixManager` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

#### 📄 src/app/error-analyzer/TypeScriptErrorAnalyzer.ts

1. **Line 4**: `./ErrorFixManager`
   - **Suggested fix:** `./ErrorFixManager` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

#### 📄 src/app/error-analyzer/TypeScriptErrorFixSystem.ts

1. **Line 2**: `./ErrorFixManager`
   - **Suggested fix:** `./ErrorFixManager` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

2. **Line 3**: `./ProgressTracker`
   - **Suggested fix:** `./ProgressTracker` → `@/app/error-analyzer/ProgressTracker`
   - **Validation:** Found: src/app/error-analyzer/ProgressTracker.ts

3. **Line 4**: `./ReportGenerator`
   - **Suggested fix:** `./ReportGenerator` → `@/app/error-analyzer/ReportGenerator`
   - **Validation:** Found: src/app/error-analyzer/ReportGenerator.ts

4. **Line 5**: `./types/ErrorAnalysisTypes`
   - **Suggested fix:** `./types/ErrorAnalysisTypes` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

#### 📄 src/app/error-analyzer/cli.ts

1. **Line 5**: `./TypeScriptErrorFixSystem`
   - **Suggested fix:** `./TypeScriptErrorFixSystem` → `@/app/error-analyzer/TypeScriptErrorFixSystem`
   - **Validation:** Found: src/app/error-analyzer/TypeScriptErrorFixSystem.ts

#### 📄 src/app/error-analyzer/types/FixStrategyTypes.ts

1. **Line 2**: `./types/ErrorAnalysisTypes`
   - **Suggested fix:** `./types/ErrorAnalysisTypes` → `@/app/error-analyzer/types/ErrorAnalysisTypes`
   - **Validation:** Found: src/app/error-analyzer/types/ErrorAnalysisTypes.ts

#### 📄 src/app/hooks/useCryptoIntegration.ts

1. **Line 4**: `@/app/components/crypto/CryptoPortfolio`
   - **Suggested fix:** `@/app/components/crypto/CryptoPortfolio` → `@/app/services/CryptoIntegrationService`
   - **Validation:** Found: src/app/services/CryptoIntegrationService.ts

#### 📄 src/app/hooks/useRoleAccess.ts

1. **Line 8**: `@/app/config/BaseConfig`
   - **Suggested fix:** `@/app/config/BaseConfig` → `@/app/documents/attachment/Attachment`
   - **Validation:** Found: src/app/documents/attachment/Attachment.tsx

#### 📄 src/app/libraries/eventSystem/ProjectEventEmitter.ts

1. **Line 2**: `@/app/branding/BrandingSettings`
   - **Suggested fix:** `@/app/branding/BrandingSettings` → `@/app/libraries/theme/BrandingService`
   - **Validation:** Found: src/app/libraries/theme/BrandingService.ts

#### 📄 src/app/models/data/dataStoreMethods.ts

1. **Line 5**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotConfig.ts

2. **Line 5**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotList`
   - **Validation:** Found: src/app/snapshots/SnapshotList.tsx

3. **Line 5**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotStoreProps`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreProps.ts

#### 📄 src/app/pages/forms/LoginForm.tsx

1. **Line 6**: `@/app/features/support/UnifiedNotificationTypes`
   - **Suggested fix:** `@/app/features/support/UnifiedNotificationTypes` → `@/app/state/context/NotificationContext`
   - **Validation:** Found: src/app/state/context/NotificationContext.tsx

#### 📄 src/app/server/auth/AuthComponent.tsx

1. **Line 4**: `@/app/generators/GenerateTokens`
   - **Suggested fix:** `@/app/generators/GenerateTokens` → `@/app/generators/GenerateTokens`
   - **Validation:** Found: src/app/generators/GenerateTokens.ts

#### 📄 src/app/server/database/CustomDataProvider.tsx

1. **Line 4**: `@/app/state/context/DataContext`
   - **Suggested fix:** `@/app/state/context/DataContext` → `@/app/models/data/dataContracts`
   - **Validation:** Found: src/app/models/data/dataContracts.ts

#### 📄 src/app/server/security/SecurityConfiguration.ts

1. **Line 5**: `@/app/api/ApiConfigService`
   - **Suggested fix:** `@/app/api/ApiConfigService` → `@/app/services/ConfigurationService`
   - **Validation:** Found: src/app/services/ConfigurationService.ts

#### 📄 src/app/snapshots/CoreSnapshot.tsx

1. **Line 19**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

#### 📄 src/app/snapshots/SnapshohtDevConfigs.ts

1. **Line 7**: `@/app/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/app/snapshots/LocalStorageSnapshotStore` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/snapshots/SnapshotContent.ts

1. **Line 5**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/snapshots/SnapshotManagement.ts

1. **Line 6**: `@/app/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/app/snapshots/LocalStorageSnapshotStore` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

2. **Line 6**: `@/app/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/app/snapshots/LocalStorageSnapshotStore` → `@/app/interfaces/payload/payloadTypes`
   - **Validation:** Found: src/app/interfaces/payload/payloadTypes.ts

#### 📄 src/app/snapshots/SnapshotMap.ts

1. **Line 9**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/snapshots/SnapshotStoreMethods.ts

1. **Line 15**: `@/app/snapshots/SnapshotStoreConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotStoreConfig` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/snapshots/SnapshotStoreProps.ts

1. **Line 17**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotConfig.ts

#### 📄 src/app/snapshots/SnapshotType.ts

1. **Line 11**: `@/app/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/app/snapshots/LocalStorageSnapshotStore` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/snapshots/convertSnapshot.ts

1. **Line 11**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

2. **Line 14**: `@/app/snapshots/SnapshotStoreProps`
   - **Suggested fix:** `@/app/snapshots/SnapshotStoreProps` → `@/app/snapshots/SnapshotStoreMethods`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreMethods.ts

#### 📄 src/app/snapshots/convertSnapshotsArray.ts

1. **Line 12**: `@/app/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/app/snapshots/LocalStorageSnapshotStore` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/snapshots/createSnapshot.ts

1. **Line 13**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotConfig.ts

#### 📄 src/app/snapshots/createSnapshotExample.ts

1. **Line 2**: `@/app/snapshots/SnapshotStoreConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotStoreConfig` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/app/snapshots/createSnapshotStoreOptions.ts

1. **Line 32**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotConfig.ts

2. **Line 32**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

3. **Line 32**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

4. **Line 32**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotStoreProps`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreProps.ts

5. **Line 32**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

6. **Line 32**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/subscribers/subscribeToSnapshotsImplementation`
   - **Validation:** Found: src/app/subscribers/subscribeToSnapshotsImplementation.ts

#### 📄 src/app/snapshots/defaultDataStoreMethods.ts

1. **Line 18**: `@/app/interfaces/payload/payloadTypes`
   - **Suggested fix:** `@/app/interfaces/payload/payloadTypes` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

2. **Line 44**: `@/app/snapshots/SnapshotWithCriteria`
   - **Suggested fix:** `@/app/snapshots/SnapshotWithCriteria` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

3. **Line 44**: `@/app/snapshots/SnapshotWithCriteria`
   - **Suggested fix:** `@/app/snapshots/SnapshotWithCriteria` → `@/app/snapshots/SnapshotList`
   - **Validation:** Found: src/app/snapshots/SnapshotList.tsx

#### 📄 src/app/snapshots/methods/commonDataStoreMethods.ts

1. **Line 10**: `@/app/typings/entities/SnapshotEntity`
   - **Suggested fix:** `@/app/typings/entities/SnapshotEntity` → `@/app/typings/entities/AppEntity`
   - **Validation:** Found: src/app/typings/entities/AppEntity.ts

#### 📄 src/app/snapshots/methods/containerMethods.ts

1. **Line 8**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

#### 📄 src/app/snapshots/methods/subscriptionMethods.ts

1. **Line 7**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/app/snapshots/newStoreUtils.ts

1. **Line 13**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotConfig.ts

#### 📄 src/app/snapshots/responsetUtils.ts

1. **Line 8**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/snapshots/snapshotDelegate.ts

1. **Line 11**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/app/snapshots/transformSnapshotsToStores.tsx

1. **Line 7**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/snapshots/updateSubscribersAndSnapshots.ts

1. **Line 17**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/interfaces/payload/payloadTypes`
   - **Validation:** Found: src/app/interfaces/payload/payloadTypes.ts

2. **Line 17**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

3. **Line 17**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

4. **Line 17**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/app/state/redux/sagas/fileSagas.ts

1. **Line 3**: `@/app/api/ApiFiles`
   - **Suggested fix:** `@/app/api/ApiFiles` → `@/app/components/configs/DetermineFileType`
   - **Validation:** Found: src/app/components/configs/DetermineFileType.tsx

#### 📄 src/app/state/redux/slices/AppSlice.ts

1. **Line 17**: `@reduxjs/toolkit`
   - **Suggested fix:** `@reduxjs/toolkit` → `@/app/state/redux/slices/EntitySlice`
   - **Validation:** Found: src/app/state/redux/slices/EntitySlice.ts

#### 📄 src/app/state/redux/slices/TaskSlice.ts

1. **Line 7**: `@/app/users/User`
   - **Suggested fix:** `@/app/users/User` → `@/app/typings/entities/UserEntity`
   - **Validation:** Found: src/app/typings/entities/UserEntity.ts

#### 📄 src/app/state/redux/slices/TodoSlice.ts

1. **Line 6**: `@reduxjs/toolkit`
   - **Suggested fix:** `@reduxjs/toolkit` → `@/app/state/redux/slices/EntitySlice`
   - **Validation:** Found: src/app/state/redux/slices/EntitySlice.ts

#### 📄 src/app/state/stores/AppStore.ts

1. **Line 30**: `@reduxjs/toolkit`
   - **Suggested fix:** `@reduxjs/toolkit` → `@/app/state/redux/slices/EntitySlice`
   - **Validation:** Found: src/app/state/redux/slices/EntitySlice.ts

#### 📄 src/app/state/stores/ArticleStore.ts

1. **Line 5**: `@/app/features/support/UnifiedNotificationTypes`
   - **Suggested fix:** `@/app/features/support/UnifiedNotificationTypes` → `@/app/state/context/NotificationContext`
   - **Validation:** Found: src/app/state/context/NotificationContext.tsx

#### 📄 src/app/state/stores/CalendarManagerStore.tsx

1. **Line 7**: `@/app/api/SnapshotApi`
   - **Suggested fix:** `@/app/api/SnapshotApi` → `@/app/api/subscriberApi`
   - **Validation:** Found: src/app/api/subscriberApi.ts

2. **Line 71**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/state/stores/CommonEvent.ts

1. **Line 12**: `@/app/snapshots/SnapshotStoreConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotStoreConfig` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

2. **Line 19**: `@/app/snapshots/SnapshotWithCriteria`
   - **Suggested fix:** `@/app/snapshots/SnapshotWithCriteria` → `@/app/models/tracker/Tag`
   - **Validation:** Found: src/app/models/tracker/Tag.tsx

#### 📄 src/app/state/stores/DataStore.ts

1. **Line 30**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/SnapshotConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotConfig.ts

2. **Line 30**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

3. **Line 30**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/SnapshotList`
   - **Validation:** Found: src/app/snapshots/SnapshotList.tsx

4. **Line 30**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/SnapshotStoreMethods`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreMethods.ts

5. **Line 30**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/SnapshotStoreProps`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreProps.ts

#### 📄 src/app/state/stores/DetailsListStore.ts

1. **Line 43**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

2. **Line 43**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

#### 📄 src/app/state/stores/DocumentStore.ts

1. **Line 12**: `@/app/models/data/StatusType`
   - **Suggested fix:** `@/app/models/data/StatusType` → `@/app/documents/DocumentOptions`
   - **Validation:** Found: src/app/documents/DocumentOptions.ts

#### 📄 src/app/state/stores/TaskStore .tsx

1. **Line 20**: `@/app/models/tasks/Task`
   - **Suggested fix:** `@/app/models/tasks/Task` → `@/app/components/models/tasks/TaskDataSource`
   - **Validation:** Found: src/app/components/models/tasks/TaskDataSource.ts

#### 📄 src/app/subscriptions/subscriberTypeGuads.ts

1. **Line 9**: `@/app/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/app/snapshots/LocalStorageSnapshotStore` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

#### 📄 src/app/todos/Todo.ts

1. **Line 33**: `@/app/snapshots/SnapshotWithCriteria`
   - **Suggested fix:** `@/app/snapshots/SnapshotWithCriteria` → `@/app/models/tracker/Tag`
   - **Validation:** Found: src/app/models/tracker/Tag.tsx

#### 📄 src/app/ts/ScheduleEventModal.tsx

1. **Line 2**: `@/app/calendar/CalendarEvent`
   - **Suggested fix:** `@/app/calendar/CalendarEvent` → `@/app/state/stores/CalendarManagerStore`
   - **Validation:** Found: src/app/state/stores/CalendarManagerStore.tsx

#### 📄 src/app/typings/YourSpecificSnapshotType.ts

1. **Line 14**: `@/app/snapshots/SnapshotStoreProps`
   - **Suggested fix:** `@/app/snapshots/SnapshotStoreProps` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

2. **Line 14**: `@/app/snapshots/SnapshotStoreProps`
   - **Suggested fix:** `@/app/snapshots/SnapshotStoreProps` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

#### 📄 src/app/typings/appEventTypes.ts

1. **Line 9**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/typings/entities/AssignEntity.ts

1. **Line 8**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

2. **Line 8**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/typings/entities/AuthEntity.ts

1. **Line 11**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

2. **Line 11**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/typings/entities/DetailsEntity.ts

1. **Line 11**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

2. **Line 11**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/typings/entities/UserEntity.ts

1. **Line 10**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

2. **Line 10**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/app/snapshots/SnapshotStoreConfig.ts

#### 📄 src/app/typings/exchangeTypes.ts

1. **Line 4**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

2. **Line 4**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

#### 📄 src/utils/snapshotUtils.tsx

1. **Line 16**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotContainer`
   - **Validation:** Found: src/app/snapshots/SnapshotContainer.ts

2. **Line 16**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

3. **Line 16**: `@/app/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/app/snapshots/SnapshotConfig` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

#### 📄 src/utils/versionUtils.ts

1. **Line 5**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/utils/web3/applicationUtils.tsx

1. **Line 49**: `@/utils/snapshotUtils`
   - **Suggested fix:** `@/utils/snapshotUtils` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

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

