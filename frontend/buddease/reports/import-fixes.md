# 📦 Import Fix Report (Validated)

**Generated:** 2025-12-29T07:25:57.184Z
**Total Issues Found:** 74
**✅ Valid Suggestions:** 74
**❌ Invalid/Needs Review:** 0
**Files with Valid Issues:** 51
**Files with Invalid Issues:** 0

## ✅ Validated Fixes (Ready to Apply)

#### 📄 src/core/api/processSnapshotData.ts

1. **Line 14**: `@/core/snapshots/Snapshot`
   - **Suggested fix:** `@/core/snapshots/Snapshot` → `@/core/snapshots/SnapshotContainer`
   - **Validation:** Found: src/core/snapshots/SnapshotContainer.ts

#### 📄 src/core/components/database/SchemaEvolutionManager.ts

1. **Line 12**: `@/core/server/database/DatabaseServiceFactory`
   - **Suggested fix:** `@/core/server/database/DatabaseServiceFactory` → `@/core/typings/database`
   - **Validation:** Found: src/core/typings/database.ts

#### 📄 src/core/config/FrontendConfig.ts

1. **Line 2**: `@/core/config/CacheConfig`
   - **Suggested fix:** `@/core/config/CacheConfig` → `@/core/api/ApiConfigService`
   - **Validation:** Found: src/core/api/ApiConfigService.ts

2. **Line 2**: `@/core/config/CacheConfig`
   - **Suggested fix:** `@/core/config/CacheConfig` → `@/core/services/ConfigurationService`
   - **Validation:** Found: src/core/services/ConfigurationService.ts

#### 📄 src/core/dataIntegration/reduxIntegration.ts

1. **Line 10**: `@/core/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/core/snapshots/LocalStorageSnapshotStore` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

#### 📄 src/core/documents/DocumentGeneratorMethods.ts

1. **Line 14**: `@/core/dataIntegration/parseData`
   - **Suggested fix:** `@/core/dataIntegration/parseData` → `@/core/documents/DocType`
   - **Validation:** Found: src/core/documents/DocType.ts

#### 📄 src/core/hooks/useCryptoIntegration.ts

1. **Line 4**: `@/core/components/crypto/CryptoPortfolio`
   - **Suggested fix:** `@/core/components/crypto/CryptoPortfolio` → `@/core/services/CryptoIntegrationService`
   - **Validation:** Found: src/core/services/CryptoIntegrationService.ts

#### 📄 src/core/hooks/useRoleAccess.ts

1. **Line 3**: `@/core/config/BaseConfig`
   - **Suggested fix:** `@/core/config/BaseConfig` → `@/core/documents/attachment/Attachment`
   - **Validation:** Found: src/core/documents/attachment/Attachment.tsx

#### 📄 src/core/libraries/eventSystem/ProjectEventEmitter.ts

1. **Line 2**: `@/core/branding/BrandingSettings`
   - **Suggested fix:** `@/core/branding/BrandingSettings` → `@/core/libraries/theme/BrandingService`
   - **Validation:** Found: src/core/libraries/theme/BrandingService.ts

#### 📄 src/core/models/data/dataStoreMethods.ts

1. **Line 7**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotConfig`
   - **Validation:** Found: src/core/snapshots/SnapshotConfig.ts

2. **Line 7**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotList`
   - **Validation:** Found: src/core/snapshots/SnapshotList.tsx

3. **Line 7**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotStoreProps`
   - **Validation:** Found: src/core/snapshots/SnapshotStoreProps.ts

#### 📄 src/core/pages/forms/LoginForm.tsx

1. **Line 6**: `@/core/features/support/UnifiedNotificationTypes`
   - **Suggested fix:** `@/core/features/support/UnifiedNotificationTypes` → `@/core/state/context/NotificationContext`
   - **Validation:** Found: src/core/state/context/NotificationContext.tsx

#### 📄 src/core/server/auth/AuthComponent.tsx

1. **Line 5**: `@/core/generators/GenerateTokens`
   - **Suggested fix:** `@/core/generators/GenerateTokens` → `@/core/generators/GenerateTokens`
   - **Validation:** Found: src/core/generators/GenerateTokens.ts

#### 📄 src/core/server/database/CustomDataProvider.tsx

1. **Line 3**: `@/core/state/context/DataContext`
   - **Suggested fix:** `@/core/state/context/DataContext` → `@/core/models/data/dataContracts`
   - **Validation:** Found: src/core/models/data/dataContracts.ts

#### 📄 src/core/server/security/SecurityConfiguration.ts

1. **Line 6**: `@/core/api/ApiConfigService`
   - **Suggested fix:** `@/core/api/ApiConfigService` → `@/core/services/ConfigurationService`
   - **Validation:** Found: src/core/services/ConfigurationService.ts

#### 📄 src/core/snapshots/SnapshohtDevConfigs.ts

1. **Line 7**: `@/core/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/core/snapshots/LocalStorageSnapshotStore` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

#### 📄 src/core/snapshots/SnapshotContent.ts

1. **Line 5**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

#### 📄 src/core/snapshots/SnapshotManagement.ts

1. **Line 6**: `@/core/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/core/snapshots/LocalStorageSnapshotStore` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

2. **Line 6**: `@/core/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/core/snapshots/LocalStorageSnapshotStore` → `@/core/interfaces/payload/payloadTypes`
   - **Validation:** Found: src/core/interfaces/payload/payloadTypes.ts

#### 📄 src/core/snapshots/SnapshotMap.ts

1. **Line 9**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

#### 📄 src/core/snapshots/SnapshotStoreMethods.ts

1. **Line 15**: `@/core/snapshots/SnapshotStoreConfig`
   - **Suggested fix:** `@/core/snapshots/SnapshotStoreConfig` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

#### 📄 src/core/snapshots/SnapshotStoreProps.ts

1. **Line 23**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotConfig`
   - **Validation:** Found: src/core/snapshots/SnapshotConfig.ts

#### 📄 src/core/snapshots/SnapshotType.ts

1. **Line 11**: `@/core/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/core/snapshots/LocalStorageSnapshotStore` → `@/core/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/core/snapshots/SnapshotStoreConfig.ts

#### 📄 src/core/snapshots/addToSnapshotList.tsx

1. **Line 3**: `@/core/snapshots/ValidationRule`
   - **Suggested fix:** `@/core/snapshots/ValidationRule` → `@/core/config/BaseConfig`
   - **Validation:** Found: src/core/config/BaseConfig.ts

#### 📄 src/core/snapshots/convertSnapshot.ts

1. **Line 11**: `@/core/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/core/snapshots/SnapshotContainer` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

2. **Line 14**: `@/core/snapshots/SnapshotStoreProps`
   - **Suggested fix:** `@/core/snapshots/SnapshotStoreProps` → `@/core/snapshots/SnapshotStoreMethods`
   - **Validation:** Found: src/core/snapshots/SnapshotStoreMethods.ts

#### 📄 src/core/snapshots/convertSnapshotToItem.ts

1. **Line 6**: `@/core/snapshots/ValidationRule`
   - **Suggested fix:** `@/core/snapshots/ValidationRule` → `@/core/config/BaseConfig`
   - **Validation:** Found: src/core/config/BaseConfig.ts

#### 📄 src/core/snapshots/convertSnapshotsArray.ts

1. **Line 4**: `@/core/snapshots/ValidationRule`
   - **Suggested fix:** `@/core/snapshots/ValidationRule` → `@/core/config/BaseConfig`
   - **Validation:** Found: src/core/config/BaseConfig.ts

2. **Line 12**: `@/core/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/core/snapshots/LocalStorageSnapshotStore` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

#### 📄 src/core/snapshots/createSnapshotExample.ts

1. **Line 2**: `@/core/snapshots/SnapshotStoreConfig`
   - **Suggested fix:** `@/core/snapshots/SnapshotStoreConfig` → `@/core/snapshots/SnapshotData`
   - **Validation:** Found: src/core/snapshots/SnapshotData.ts

#### 📄 src/core/snapshots/createSnapshotStoreOptions.ts

1. **Line 40**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotConfig`
   - **Validation:** Found: src/core/snapshots/SnapshotConfig.ts

2. **Line 40**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotContainer`
   - **Validation:** Found: src/core/snapshots/SnapshotContainer.ts

3. **Line 40**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/core/snapshots/SnapshotStoreConfig.ts

4. **Line 40**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotStoreProps`
   - **Validation:** Found: src/core/snapshots/SnapshotStoreProps.ts

5. **Line 40**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/core/snapshots/SnapshotWithCriteria.ts

6. **Line 40**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/subscribers/subscribeToSnapshotsImplementation`
   - **Validation:** Found: src/core/subscribers/subscribeToSnapshotsImplementation.ts

#### 📄 src/core/snapshots/defaultDataStoreMethods.ts

1. **Line 17**: `@/core/interfaces/payload/payloadTypes`
   - **Suggested fix:** `@/core/interfaces/payload/payloadTypes` → `@/core/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/core/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/core/snapshots/methods/commonDataStoreMethods.ts

1. **Line 10**: `@/core/typings/entities/SnapshotEntity`
   - **Suggested fix:** `@/core/typings/entities/SnapshotEntity` → `@/core/typings/entities/AppEntity`
   - **Validation:** Found: src/core/typings/entities/AppEntity.ts

#### 📄 src/core/snapshots/methods/containerMethods.ts

1. **Line 7**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotContainer`
   - **Validation:** Found: src/core/snapshots/SnapshotContainer.ts

#### 📄 src/core/snapshots/newStoreUtils.ts

1. **Line 15**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotConfig`
   - **Validation:** Found: src/core/snapshots/SnapshotConfig.ts

#### 📄 src/core/snapshots/responsetUtils.ts

1. **Line 8**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

#### 📄 src/core/snapshots/snapshotDelegate.ts

1. **Line 17**: `@/core/snapshots/SnapshotContainer`
   - **Suggested fix:** `@/core/snapshots/SnapshotContainer` → `@/core/snapshots/SnapshotData`
   - **Validation:** Found: src/core/snapshots/SnapshotData.ts

#### 📄 src/core/snapshots/transformSnapshotsToStores.tsx

1. **Line 7**: `@/core/snapshots/Snapshot`
   - **Suggested fix:** `@/core/snapshots/Snapshot` → `@/core/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/core/snapshots/SnapshotStoreConfig.ts

#### 📄 src/core/snapshots/updateSubscribersAndSnapshots.ts

1. **Line 17**: `@/core/snapshots/Snapshot`
   - **Suggested fix:** `@/core/snapshots/Snapshot` → `@/core/interfaces/payload/payloadTypes`
   - **Validation:** Found: src/core/interfaces/payload/payloadTypes.ts

2. **Line 17**: `@/core/snapshots/Snapshot`
   - **Suggested fix:** `@/core/snapshots/Snapshot` → `@/core/snapshots/SnapshotData`
   - **Validation:** Found: src/core/snapshots/SnapshotData.ts

3. **Line 17**: `@/core/snapshots/Snapshot`
   - **Suggested fix:** `@/core/snapshots/Snapshot` → `@/core/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/core/snapshots/LocalStorageSnapshotStore.tsx

4. **Line 17**: `@/core/snapshots/Snapshot`
   - **Suggested fix:** `@/core/snapshots/Snapshot` → `@/core/snapshots/LocalStorageSnapshotStore`
   - **Validation:** Found: src/core/snapshots/LocalStorageSnapshotStore.tsx

#### 📄 src/core/state/context/DataContext.tsx

1. **Line 2**: `@/core/models/data/Data`
   - **Suggested fix:** `@/core/models/data/Data` → `@/core/config/BaseConfig`
   - **Validation:** Found: src/core/config/BaseConfig.ts

#### 📄 src/core/state/redux/sagas/fileSagas.ts

1. **Line 3**: `@/core/api/ApiFiles`
   - **Suggested fix:** `@/core/api/ApiFiles` → `@/core/components/configs/DetermineFileType`
   - **Validation:** Found: src/core/components/configs/DetermineFileType.tsx

#### 📄 src/core/state/stores/CommonEvent.ts

1. **Line 11**: `@/core/snapshots/SnapshotWithCriteria`
   - **Suggested fix:** `@/core/snapshots/SnapshotWithCriteria` → `@/core/models/tracker/Tag`
   - **Validation:** Found: src/core/models/tracker/Tag.tsx

2. **Line 17**: `@/core/snapshots/SnapshotStoreConfig`
   - **Suggested fix:** `@/core/snapshots/SnapshotStoreConfig` → `@/core/snapshots/SnapshotData`
   - **Validation:** Found: src/core/snapshots/SnapshotData.ts

#### 📄 src/core/state/stores/DataStore.ts

1. **Line 33**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotList`
   - **Validation:** Found: src/core/snapshots/SnapshotList.tsx

#### 📄 src/core/state/stores/DetailsListStore.ts

1. **Line 43**: `@/core/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/core/snapshots/SnapshotConfig` → `@/core/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/core/snapshots/SnapshotWithCriteria.ts

2. **Line 43**: `@/core/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/core/snapshots/SnapshotConfig` → `@/core/snapshots/SnapshotContainer`
   - **Validation:** Found: src/core/snapshots/SnapshotContainer.ts

#### 📄 src/core/state/stores/DocumentStore.ts

1. **Line 12**: `@/core/models/data/StatusType`
   - **Suggested fix:** `@/core/models/data/StatusType` → `@/core/documents/DocumentOptions`
   - **Validation:** Found: src/core/documents/DocumentOptions.ts

#### 📄 src/core/subscriptions/subscriberTypeGuads.ts

1. **Line 9**: `@/core/snapshots/LocalStorageSnapshotStore`
   - **Suggested fix:** `@/core/snapshots/LocalStorageSnapshotStore` → `@/core/snapshots/SnapshotData`
   - **Validation:** Found: src/core/snapshots/SnapshotData.ts

#### 📄 src/core/todos/Todo.ts

1. **Line 21**: `@/core/snapshots/SnapshotWithCriteria`
   - **Suggested fix:** `@/core/snapshots/SnapshotWithCriteria` → `@/core/models/tracker/Tag`
   - **Validation:** Found: src/core/models/tracker/Tag.tsx

#### 📄 src/core/ts/ScheduleEventModal.tsx

1. **Line 3**: `@/core/calendar/CalendarEvent`
   - **Suggested fix:** `@/core/calendar/CalendarEvent` → `@/core/state/stores/CalendarManagerStore`
   - **Validation:** Found: src/core/state/stores/CalendarManagerStore.tsx

#### 📄 src/core/typings/YourSpecificSnapshotType.ts

1. **Line 21**: `@/core/snapshots/SnapshotStoreProps`
   - **Suggested fix:** `@/core/snapshots/SnapshotStoreProps` → `@/core/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/core/snapshots/SnapshotStoreConfig.ts

2. **Line 21**: `@/core/snapshots/SnapshotStoreProps`
   - **Suggested fix:** `@/core/snapshots/SnapshotStoreProps` → `@/core/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/core/snapshots/SnapshotWithCriteria.ts

#### 📄 src/core/typings/appEventTypes.ts

1. **Line 11**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

#### 📄 src/core/typings/entities/AssignEntity.ts

1. **Line 9**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

2. **Line 9**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/core/snapshots/SnapshotStoreConfig.ts

#### 📄 src/core/typings/entities/AuthEntity.ts

1. **Line 12**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

2. **Line 12**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/core/snapshots/SnapshotStoreConfig.ts

#### 📄 src/core/typings/entities/UserEntity.ts

1. **Line 11**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

2. **Line 11**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotStoreConfig`
   - **Validation:** Found: src/core/snapshots/SnapshotStoreConfig.ts

#### 📄 src/core/typings/exchangeTypes.ts

1. **Line 4**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

2. **Line 4**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/core/snapshots/SnapshotWithCriteria.ts

#### 📄 src/utils/snapshotUtils.tsx

1. **Line 24**: `@/core/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/core/snapshots/SnapshotConfig` → `@/core/snapshots/SnapshotContainer`
   - **Validation:** Found: src/core/snapshots/SnapshotContainer.ts

2. **Line 24**: `@/core/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/core/snapshots/SnapshotConfig` → `@/core/snapshots/SnapshotData`
   - **Validation:** Found: src/core/snapshots/SnapshotData.ts

3. **Line 24**: `@/core/snapshots/SnapshotConfig`
   - **Suggested fix:** `@/core/snapshots/SnapshotConfig` → `@/core/snapshots/SnapshotWithCriteria`
   - **Validation:** Found: src/core/snapshots/SnapshotWithCriteria.ts

#### 📄 src/utils/versionUtils.ts

1. **Line 5**: `@/core/snapshots/SnapshotData`
   - **Suggested fix:** `@/core/snapshots/SnapshotData` → `@/core/snapshots/Snapshot`
   - **Validation:** Found: src/core/snapshots/Snapshot.tsx

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

