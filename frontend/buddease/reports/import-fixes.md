# 📦 Import Fix Report (Validated)

**Generated:** 2025-12-25T11:17:02.985Z
**Total Issues Found:** 98
**✅ Valid Suggestions:** 98
**❌ Invalid/Needs Review:** 0
**Files with Valid Issues:** 67
**Files with Invalid Issues:** 0

## ✅ Validated Fixes (Ready to Apply)

#### 📄 src/app/api/ApiHighlightEvent.tsx

1. **Line 9**: `@/app/snapshots/methods/dataMethods`
   - **Suggested fix:** `@/app/snapshots/methods/dataMethods` → `@/app/api/ApiData`
   - **Validation:** Found: src/app/api/ApiData.ts

#### 📄 src/app/api/processSnapshotData.ts

1. **Line 14**: `@/app/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/app/snapshots/SnapshotContainer` → `@/app/snapshots/Snapshot`
   - **Validation:** Found: src/app/snapshots/Snapshot.tsx

#### 📄 src/app/components/communications/chat/features/closeChatSettingsPanel.ts

1. **Line 3**: `@/app/components/communications/chat/ChatSettingsPanel`
   - **Suggested fix:** `@/app/components/communications/chat/ChatSettingsPanel` → `@/app/notifications/NotificationChannelManager`
   - **Validation:** Found: src/app/notifications/NotificationChannelManager.ts

#### 📄 src/app/components/database/SchemaEvolutionManager.ts

1. **Line 12**: `@/app/typings/database`
   - **Suggested fix:** `@/app/typings/database` → `@/app/server/database/DatabaseServiceFactory`
   - **Validation:** Found: src/app/server/database/DatabaseServiceFactory.ts

#### 📄 src/app/config/FrontendConfig.ts

1. **Line 2**: `@/app/api/ApiConfigService`
   - **Suggested fix:** `@/app/api/ApiConfigService` → `@/app/config/CacheConfig`
   - **Validation:** Found: src/app/config/CacheConfig.ts

2. **Line 2**: `@/app/api/ApiConfigService`
   - **Suggested fix:** `@/app/api/ApiConfigService` → `@/app/services/ConfigurationService`
   - **Validation:** Found: src/app/services/ConfigurationService.ts

#### 📄 src/app/dataIntegration/reduxIntegration.ts

1. **Line 9**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/app/documents/DocumentGeneratorMethods.ts

1. **Line 44**: `@/app/documents/DocType`
   - **Suggested fix:** `@/app/documents/DocType` → `@/app/dataIntegration/parseData`
   - **Validation:** Found: src/app/dataIntegration/parseData.ts

#### 📄 src/app/error-analyzer/IndexFileFixer.ts

1. **Line 4**: `./ErrorFixManager`
   - **Suggested fix:** `./ErrorFixManager` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

#### 📄 src/app/error-analyzer/cli/phases-cli.ts

1. **Line 4**: `../phases/TypeScriptDiagnosticPhase`
   - **Suggested fix:** `../phases/TypeScriptDiagnosticPhase` → `@/app/error-analyzer/phases/TypeScriptDiagnosticPhase`
   - **Validation:** Found: src/app/error-analyzer/phases/TypeScriptDiagnosticPhase.ts

2. **Line 5**: `../phases/PhaseExecutor`
   - **Suggested fix:** `../phases/PhaseExecutor` → `@/app/error-analyzer/phases/PhaseExecutor`
   - **Validation:** Found: src/app/error-analyzer/phases/PhaseExecutor.ts

#### 📄 src/app/error-analyzer/phases/PhaseExecutor.ts

1. **Line 14**: `./TypeScriptDiagnosticPhase`
   - **Suggested fix:** `./TypeScriptDiagnosticPhase` → `@/app/error-analyzer/phases/TypeScriptDiagnosticPhase`
   - **Validation:** Found: src/app/error-analyzer/phases/TypeScriptDiagnosticPhase.ts

#### 📄 src/app/error-analyzer/phases/SafePhaseExecutor.ts

1. **Line 4**: `./PhaseBackupSystem`
   - **Suggested fix:** `./PhaseBackupSystem` → `@/app/models/phases/PhaseBackupSystem`
   - **Validation:** Found: src/app/models/phases/PhaseBackupSystem.ts

#### 📄 src/app/error-analyzer/phases/TypeScriptDiagnosticPhase.ts

1. **Line 5**: `../ErrorFixManager`
   - **Suggested fix:** `../ErrorFixManager` → `@/app/error-analyzer/ErrorFixManager`
   - **Validation:** Found: src/app/error-analyzer/ErrorFixManager.ts

#### 📄 src/app/error-analyzer/phases/test-phase.ts

1. **Line 2**: `./app/error-analyzer/phases/PhaseExecutor`
   - **Suggested fix:** `./app/error-analyzer/phases/PhaseExecutor` → `@/app/error-analyzer/phases/PhaseExecutor`
   - **Validation:** Found: src/app/error-analyzer/phases/PhaseExecutor.ts

#### 📄 src/app/hooks/useCryptoIntegration.ts

1. **Line 4**: `@/app/services/CryptoIntegrationService`
   - **Suggested fix:** `@/app/services/CryptoIntegrationService` → `@/app/components/crypto/CryptoPortfolio`
   - **Validation:** Found: src/app/components/crypto/CryptoPortfolio.ts

#### 📄 src/app/hooks/useRoleAccess.ts

1. **Line 8**: `@/app/documents/attachment/Attachment`
   - **Suggested fix:** `@/app/documents/attachment/Attachment` → `@/app/config/BaseConfig`
   - **Validation:** Found: src/app/config/BaseConfig.ts

#### 📄 src/app/libraries/eventSystem/ProjectEventEmitter.ts

1. **Line 2**: `@/app/libraries/theme/BrandingService`
   - **Suggested fix:** `@/app/libraries/theme/BrandingService` → `@/app/branding/BrandingSettings`
   - **Validation:** Found: src/app/branding/BrandingSettings.ts

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

#### 📄 src/app/models/phases/DynamicPhaseSystem.ts

1. **Line 8**: `@/app/error-analyzer/phases/PhaseBackupSystem`
   - **Suggested fix:** `@/app/error-analyzer/phases/PhaseBackupSystem` → `@/app/models/phases/PhaseBackupSystem`
   - **Validation:** Found: src/app/models/phases/PhaseBackupSystem.ts

#### 📄 src/app/models/phases/PhaseManager.tsx

1. **Line 4**: `./PhaseSystem`
   - **Suggested fix:** `./PhaseSystem` → `@/app/models/phases/PhaseSystem`
   - **Validation:** Found: src/app/models/phases/PhaseSystem.ts

#### 📄 src/app/pages/forms/LoginForm.tsx

1. **Line 6**: `@/app/state/context/NotificationContext`
   - **Suggested fix:** `@/app/state/context/NotificationContext` → `@/app/features/support/UnifiedNotificationTypes`
   - **Validation:** Found: src/app/features/support/UnifiedNotificationTypes.ts

#### 📄 src/app/scripts/analyze-ts-errors.mjs

1. **Line 16**: `../dist/app/error-analyzer/index.js`
   - **Suggested fix:** `../dist/app/error-analyzer/index.js` → `@/app/api/index`
   - **Validation:** Semantic fallback: @/app/api/index

#### 📄 src/app/server/auth/AuthComponent.tsx

1. **Line 4**: `@/app/generators/GenerateTokens`
   - **Suggested fix:** `@/app/generators/GenerateTokens` → `@/app/generators/GenerateTokens`
   - **Validation:** Found: src/app/generators/GenerateTokens.ts

#### 📄 src/app/server/database/CustomDataProvider.tsx

1. **Line 4**: `@/app/models/data/dataContracts`
   - **Suggested fix:** `@/app/models/data/dataContracts` → `@/app/state/context/DataContext`
   - **Validation:** Found: src/app/state/context/DataContext.tsx

#### 📄 src/app/server/security/SecurityConfiguration.ts

1. **Line 5**: `@/app/services/ConfigurationService`
   - **Suggested fix:** `@/app/services/ConfigurationService` → `@/app/api/ApiConfigService`
   - **Validation:** Found: src/app/api/ApiConfigService.ts

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

#### 📄 src/app/state/context/DataContext.tsx

1. **Line 2**: `@/app/config/BaseConfig`
   - **Suggested fix:** `@/app/config/BaseConfig` → `@/app/models/data/Data`
   - **Validation:** Found: src/app/models/data/Data.tsx

#### 📄 src/app/state/redux/sagas/fileSagas.ts

1. **Line 3**: `@/app/components/configs/DetermineFileType`
   - **Suggested fix:** `@/app/components/configs/DetermineFileType` → `@/app/api/ApiFiles`
   - **Validation:** Found: src/app/api/ApiFiles.ts

#### 📄 src/app/state/redux/slices/TaskSlice.ts

1. **Line 7**: `@/app/typings/entities/UserEntity`
   - **Suggested fix:** `@/app/typings/entities/UserEntity` → `@/app/users/User`
   - **Validation:** Found: src/app/users/User.tsx

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

#### 📄 src/app/subscriptions/subscriberTypeGuads.ts

1. **Line 9**: `@/app/snapshots/SnapshotData`
   - **Suggested fix:** `@/app/snapshots/SnapshotData` → `@/app/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/app/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/app/todos/Todo.ts

1. **Line 33**: `@/app/models/tracker/Tag`
   - **Suggested fix:** `@/app/models/tracker/Tag` → `@/app/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/app/snapshots/SnapshotWithCriteria.ts

#### 📄 src/app/todos/TodoComponent.tsx

1. **Line 11**: `antd`
   - **Suggested fix:** `antd` → `@/app/models/tracker/ProgressBar`
   - **Validation:** Found: src/app/models/tracker/ProgressBar.tsx

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

1. **Line 11**: `@/app/snapshots/Snapshot`
   - **Suggested fix:** `@/app/snapshots/Snapshot` → `@/app/snapshots/SnapshotData`
   - **Validation:** Found: src/app/snapshots/SnapshotData.ts

2. **Line 11**: `@/app/snapshots/Snapshot`
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

#### 📄 src/utils/fileCategoryUtils.ts

1. **Line 2**: `./fsOperations`
   - **Suggested fix:** `./fsOperations` → `@/app/server/fsOperations`
   - **Validation:** Found: src/app/server/fsOperations.ts

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

