# 📦 Import Fix Report

**Generated:** 2025-12-15T06:58:55.453Z
**Total Issues:** 1033
**Files Affected:** 541

## 🔧 Recommended Fixes

### Summary
- **Total issues to fix:** 1033
- **Files needing attention:** 541
- **Issues with suggested fixes:** 1004

### Fixable Issues by File

#### 📄 src/app/components/admin/DashboardConfigCard.tsx

1. **Line 2**: `@/app/api/ApiConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/ApiConfig` → `@/app/api/ApiConfigManager`

---

#### 📄 src/app/components/calendar/AttendancePrediction.tsx

1. **Line 3**: `@/app/components/models/data/CalendarEventAttendancePrediction`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/CalendarEventAttendancePrediction` → `@/app/calendar/CalendarEvent`

---

#### 📄 src/app/components/calendar/Calendar.tsx

1. **Line 21**: `@/src/app/components/calendar/WeekView`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/src/app/components/calendar/WeekView` → `@/app/components/calendar/WeekView`

---

#### 📄 src/app/components/calendar/CalendarApp.tsx

1. **Line 4**: `@/api/SnapshotApi`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/api/SnapshotApi` → `@/app/api/SnapshotApi`

---

#### 📄 src/app/components/calendar/CalendarMonthView.tsx

1. **Line 3**: `@/CalendarMonthView`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CalendarMonthView` → `@/app/components/calendar/Calendar`

---

#### 📄 src/app/components/calendar/CalendarPhase.tsx

1. **Line 4**: `@/app/navigation/navigateToCalendar`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/navigation/navigateToCalendar` → `@/app/components/calendar/Calendar`

---

#### 📄 src/app/components/calendar/CalendarView.tsx

1. **Line 4**: `@/ap/components/calendar/CalendarDay`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/ap/components/calendar/CalendarDay` → `@/app/components/calendar/Calendar`

---

#### 📄 src/app/components/calendar/EventDetailsComponent.tsx

1. **Line 2**: `@/app/ts/EventEmitter`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ts/EventEmitter` → `@/app/events/Event`

---

#### 📄 src/app/components/calendar/SyncWithExternalCalendars.tsx

1. **Line 3**: `@/app/auth/AuthService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/auth/AuthService` → `@/app/server/auth/AuthService`

---

#### 📄 src/app/components/calendar/WeekView.tsx

1. **Line 6**: `@/CalendarWeek`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CalendarWeek` → `@/app/calendar/CalendarWeek`

---

#### 📄 src/app/components/calendar/YearView.tsx

1. **Line 5**: `@/CalendarMonthView`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CalendarMonthView` → `@/app/components/calendar/Calendar`

2. **Line 6**: `@/CalendarYear`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CalendarYear` → `@/app/components/calendar/Calendar`

3. **Line 7**: `@/Month`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Month` → `@/app/components/calendar/CalendarMonth`

---

#### 📄 src/app/components/communications/WebSocketServer.ts

1. **Line 2**: `@/app/libraries/logging/Logger`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/libraries/logging/Logger` → `@/app/config/LoggerConfig`

---

#### 📄 src/app/components/communications/chat/ChatMessage.tsx

1. **Line 6**: `@/app/components/communications/AquaChat`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/communications/AquaChat` → `@/app/components/communications/chat/AquaChat`

---

#### 📄 src/app/components/communications/chat/ChatRoomComponent.tsx

1. **Line 7**: `@/app/WebSocket`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/WebSocket` → `@/app/api/chatWebSocket`

---

#### 📄 src/app/components/communications/chat/ChatSidebar.tsx

1. **Line 4**: `@/app/components/state/redux/slices/SidebarSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/redux/slices/SidebarSlice` → `@/app/libraries/toolbar/Sidebar`

---

#### 📄 src/app/components/communications/chat/ChatWithFeedback.tsx

1. **Line 6**: `@/app/communications/chat/ChatRoom`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communications/chat/ChatRoom` → `@/app/communications/ChatRoom`

---

#### 📄 src/app/components/communications/chat/chatUtils.tsx

1. **Line 26**: `@/app/utils/video/openPrivacySettingsMenu`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/video/openPrivacySettingsMenu` → `@/app/settings/PrivacySettings`

2. **Line 27**: `@/app/utils/video/openVideoOptionsMenu`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/video/openVideoOptionsMenu` → `@/app/typings/videoTypes/Video`

---

#### 📄 src/app/components/communications/chat/features/closeChatSettingsPanel.ts

1. **Line 3**: `@/app/hooks/userInterface/ChatSettingsPanel`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/hooks/userInterface/ChatSettingsPanel` → `@/app/components/communications/chat/ChatSettingsPanel`

---

#### 📄 src/app/components/communications/chat/features/disconnectFromChatServer.ts

1. **Line 3**: `@/app/components/communications/AquaChat`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/communications/AquaChat` → `@/app/components/communications/chat/AquaChat`

---

#### 📄 src/app/components/communications/chat/features/openAudioOptionsMenu.ts

1. **Line 4**: `@/app/components/models/display/ShowToast`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/display/ShowToast` → `@/app/models/display/ShowToast`

---

#### 📄 src/app/components/communications/sendSMS.tsx

1. **Line 4**: `@/components/communication/sendSMS`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/components/communication/sendSMS` → `@/app/api/sendSMS`

---

#### 📄 src/app/components/community/ActivityFeedComponent.tsx

1. **Line 5**: `@/app/auth/AuthContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/auth/AuthContext` → `@/app/state/context/AuthContext`

2. **Line 9**: `@/app/web3/dAppAdapter/functionality/RealtimeUpdates`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/web3/dAppAdapter/functionality/RealtimeUpdates` → `@/app/hooks/dataHooks/RealtimeUpdatesComponent`

---

#### 📄 src/app/components/community/CommunicationComponent.tsx

1. **Line 2**: `@/app/communications/Communication`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communications/Communication` → `@/app/actions/CommunicationActions`

2. **Line 5**: `@/CommunicationActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CommunicationActions` → `@/app/actions/CommunicationActions`

---

#### 📄 src/app/components/configs/BackendConfigComponent.tsx

1. **Line 4**: `@/app/context/DashboardContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/context/DashboardContext` → `@/app/state/context/DashboardContext`

---

#### 📄 src/app/components/configs/FrontendConfigComponent.tsx

1. **Line 3**: `./FrontendConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./FrontendConfig` → `@/app/api/config`

---

#### 📄 src/app/components/containers/CustomBox.tsx

1. **Line 15**: `@/app/DynamicNamingConventions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/DynamicNamingConventions` → `@/utils/DynamicNamingConventions`

2. **Line 20**: `@/app/styling/DynamicComponents`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/styling/DynamicComponents` → `@/app/components/DynamicComponentsContext`

3. **Line 21**: `@/app/styling/DynamicSpacingAndLayout`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/styling/DynamicSpacingAndLayout` → `@/app/components/styling/DynamicSpacingAndLayout`

4. **Line 22**: `@/app/styling/DynamicTypography`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/styling/DynamicTypography` → `@/app/components/styling/DynamicTypography`

---

#### 📄 src/app/components/containers/LoginContainer.tsx

1. **Line 4**: `@/forms/LoginForm`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/forms/LoginForm` → `@/app/pages/forms/LoginForm`

---

#### 📄 src/app/components/containers/ToggleSwitchContainer.tsx

1. **Line 4**: `./../../components/libraries/menu/ToggleSwitch`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./../../components/libraries/menu/ToggleSwitch` → `@/app/components/containers/ToggleSwitchContainer`

---

#### 📄 src/app/components/crypto/CryptoCallsSystem.tsx

1. **Line 4**: `@/app/phases/crypto/CryptoEnthusiastCalls`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/phases/crypto/CryptoEnthusiastCalls` → `@/app/components/phases/crypto/CryptoEnthusiastCalls`

---

#### 📄 src/app/components/crypto/CryptoManager.tsx

1. **Line 3**: `@/app/community/newsFeedIntegration`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/community/newsFeedIntegration` → `@/app/components/community/newsFeedIntegration`

2. **Line 3**: `@/app/community/newsFeedIntegration`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/community/newsFeedIntegration` → `@/app/components/community/newsFeedIntegration`

3. **Line 3**: `@/app/community/newsFeedIntegration`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/community/newsFeedIntegration` → `@/app/components/community/newsFeedIntegration`

4. **Line 4**: `@/app/components/libraries/ui/updateAnalyticsUI`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/updateAnalyticsUI` → `@/app/features/shortcuts/analytics/updateAnalyticsUI`

5. **Line 7**: `@/CryptoHolding`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CryptoHolding` → `@/app/components/crypto/CryptoHolding`

6. **Line 8**: `@/CryptoTransaction`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CryptoTransaction` → `@/app/components/crypto/CryptoTransaction`

---

#### 📄 src/app/components/crypto/CryptoPortfolio.ts

1. **Line 7**: `@/app/libraries/logging/TradeLogger`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/libraries/logging/TradeLogger` → `@/app/logging/Logger`

---

#### 📄 src/app/components/crypto/CryptoSectionToolbar.tsx

1. **Line 2**: `@/app/documents/ToolbarItem`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/documents/ToolbarItem` → `@/app/components/documents/Toolbar`

---

#### 📄 src/app/components/crypto/ExchangeComponent.tsx

1. **Line 2**: `@/.@/app/hooks/commHooks/useRealtimeExchangeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/.@/app/hooks/commHooks/useRealtimeExchangeData` → `@/app/hooks/commHooks/useRealtimeExchangeData`

2. **Line 3**: `@/app/components/models/data/ExchangeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/ExchangeData` → `@/app/hooks/commHooks/useRealtimeExchangeData`

3. **Line 4**: `@/app/components/models/data/fetchExchangeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/fetchExchangeData` → `@/app/models/cypto/Exchange`

4. **Line 8**: `@/app/state/stores/CalendarEvent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/stores/CalendarEvent` → `@/app/actions/CalendarEventActions`

---

#### 📄 src/app/components/crypto/StrategyOptions.ts

1. **Line 3**: `./TradingStrategy`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./TradingStrategy` → `@/app/trading/TradingStrategy`

---

#### 📄 src/app/components/crypto/VerifiableCredential.ts

1. **Line 4**: `@/credentialUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/credentialUtils` → `@/utils/web3/credentialUtils`

2. **Line 4**: `@/credentialUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/credentialUtils` → `@/utils/web3/credentialUtils`

---

#### 📄 src/app/components/crypto/comparePrices.ts

1. **Line 2**: `@/app/components/models/data/ExchangeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/ExchangeData` → `@/app/hooks/commHooks/useRealtimeExchangeData`

---

#### 📄 src/app/components/crypto/conductTestingAndOptimization.ts

1. **Line 8**: `./TradingStrategy`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./TradingStrategy` → `@/app/trading/TradingStrategy`

2. **Line 8**: `./TradingStrategy`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./TradingStrategy` → `@/app/trading/TradingStrategy`

---

#### 📄 src/app/components/crypto/continuousMonitoringAndImprovement.ts

1. **Line 3**: `@/app/utils/automatedDecisionMakingUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/automatedDecisionMakingUtils` → `@/utils/web3/automatedDecisionMakingUtils`

2. **Line 4**: `./TradingStrategy`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./TradingStrategy` → `@/app/trading/TradingStrategy`

---

#### 📄 src/app/components/crypto/machineLearning.ts

1. **Line 6**: `./TradingStrategy`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./TradingStrategy` → `@/app/trading/TradingStrategy`

---

#### 📄 src/app/components/crypto/parameterCustomization.ts

1. **Line 4**: `@/app/api/ApiService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/ApiService` → `@/app/api/contentApiService`

---

#### 📄 src/app/components/crypto/predict.js

1. **Line 6**: `@/machineLearningModel`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/machineLearningModel` → `@/app/components/crypto/machineLearning`

---

#### 📄 src/app/components/database/DatabaseMigrationUI.tsx

1. **Line 3**: `./DatabaseMigrationService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DatabaseMigrationService` → `@/app/actions/database`

2. **Line 4**: `./GenerateButtons`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./GenerateButtons` → `@/app/api/documents/generate`

3. **Line 5**: `./ProjectConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./ProjectConfig` → `@/app/api/config`

---

#### 📄 src/app/components/database/SchemaEvolutionManager.ts

1. **Line 9**: `@/app/scripts/migrateUserData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/scripts/migrateUserData` → `@/app/models/data/Data`

2. **Line 9**: `@/app/scripts/migrateUserData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/scripts/migrateUserData` → `@/app/models/data/Data`

3. **Line 9**: `@/app/scripts/migrateUserData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/scripts/migrateUserData` → `@/app/models/data/Data`

4. **Line 9**: `@/app/scripts/migrateUserData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/scripts/migrateUserData` → `@/app/models/data/Data`

5. **Line 9**: `@/app/scripts/migrateUserData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/scripts/migrateUserData` → `@/app/models/data/Data`

6. **Line 9**: `@/app/scripts/migrateUserData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/scripts/migrateUserData` → `@/app/models/data/Data`

7. **Line 9**: `@/app/scripts/migrateUserData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/scripts/migrateUserData` → `@/app/models/data/Data`

---

#### 📄 src/app/components/development/FrontendStructureViewer.tsx

1. **Line 6**: `@/app/components/AccessDenied`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/AccessDenied` → `@/app/pages/AccessDenied`

2. **Line 8**: `@/app/hooks/useAccessControl`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/components/documents/FileSharingComponent.tsx

1. **Line 8**: `@/app/containers/CustomBox`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/containers/CustomBox` → `@/app/components/containers/CustomBox`

2. **Line 18**: `@/app/styling/DynamicTypography`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/styling/DynamicTypography` → `@/app/components/styling/DynamicTypography`

---

#### 📄 src/app/components/documents/documentation/report/Integration.tsx

1. **Line 6**: `@/app/components/todos/tasks/DataSetModel`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/todos/tasks/DataSetModel` → `@/app/models/data/Data`

2. **Line 8**: `@/app/projects/DataAnalysisPhase/DataProcessing/DataProcessingService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/projects/DataAnalysisPhase/DataProcessing/DataProcessingService` → `@/app/api/service/DataProcessingService`

---

#### 📄 src/app/components/documents/documentation/report/generateFinancialReportContent.tsx

1. **Line 3**: `@/app/DocumentBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/DocumentBuilder` → `@/app/components/documents/DocumentBuilderComponent`

2. **Line 4**: `@/app/DocumentOptions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/DocumentOptions` → `@/app/documents/DocumentOptions`

---

#### 📄 src/app/components/form/FormElementStyles.tsx

1. **Line 4**: `@/app/components/libraries/animations/AnimationLibrary`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/animations/AnimationLibrary` → `@/app/libraries/animations/AnimationLibrary`

2. **Line 4**: `@/app/components/libraries/animations/AnimationLibrary`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/animations/AnimationLibrary` → `@/app/libraries/animations/AnimationLibrary`

3. **Line 5**: `@/app/components/libraries/animations/useShakeAnimation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/animations/useShakeAnimation` → `@/app/libraries/animations/useShakeAnimation`

---

#### 📄 src/app/components/lists/ArticlesList.tsx

1. **Line 4**: `./path/to/your/store`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./path/to/your/store` → `@/app/api/ApiStore`

---

#### 📄 src/app/components/lists/BlogList.test.tsx

1. **Line 3**: `@/DetailsList`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/DetailsList` → `@/app/components/lists/DetailsList.test`

2. **Line 6**: `@/app/pages/blog/BlogList`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/pages/blog/BlogList` → `@/app/components/lists/BlogList.test`

---

#### 📄 src/app/components/lists/BlogList.tsx

1. **Line 12**: `@/app/typiings/entities/BlogEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/BlogEntity` → `@/app/pages/blog/Blog`

2. **Line 12**: `@/app/typiings/entities/BlogEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/BlogEntity` → `@/app/pages/blog/Blog`

3. **Line 12**: `@/app/typiings/entities/BlogEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/BlogEntity` → `@/app/pages/blog/Blog`

4. **Line 12**: `@/app/typiings/entities/BlogEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/BlogEntity` → `@/app/pages/blog/Blog`

5. **Line 12**: `@/app/typiings/entities/BlogEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/BlogEntity` → `@/app/pages/blog/Blog`

6. **Line 12**: `@/app/typiings/entities/BlogEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/BlogEntity` → `@/app/pages/blog/Blog`

---

#### 📄 src/app/components/lists/DetailsList.test.tsx

1. **Line 7**: `@/DetailsList`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/DetailsList` → `@/app/components/lists/DetailsList.test`

2. **Line 54**: `@/app/pages/blog/BlogList`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/pages/blog/BlogList` → `@/app/components/lists/BlogList.test`

---

#### 📄 src/app/components/lists/DocumentList.tsx

1. **Line 2**: `@/app/documents/DocumentBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/documents/DocumentBuilder` → `@/app/components/documents/DocumentBuilderComponent`

---

#### 📄 src/app/components/lists/TodoList.tsx

1. **Line 5**: `@/app/components/todos/TodoList`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/todos/TodoList` → `@/app/components/lists/TodoList`

---

#### 📄 src/app/components/models/blogs/BlogAction.ts

1. **Line 4**: `@/app/community/DiscussionForumComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/community/DiscussionForumComponent` → `@/app/components/community/DiscussionForumComponent`

---

#### 📄 src/app/components/models/content/BlogAndContentEditorWrapper.tsx

1. **Line 3**: `@/app/components/typings/ContentType`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/typings/ContentType` → `@/app/products/YourProductContentType`

2. **Line 5**: `@/blogs/BlogAction`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/blogs/BlogAction` → `@/app/actions/BlogAction`

3. **Line 9**: `@/app/pages/blog/BlogAndContentEditor`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/pages/blog/BlogAndContentEditor` → `@/app/components/framework/BlogAndContentEditorFramework`

---

#### 📄 src/app/components/models/content/ContentDetailsListItem.tsx

1. **Line 2**: `@/app/components/state/stores/DetailsListStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/stores/DetailsListStore` → `@/app/components/lists/DetailsList`

2. **Line 3**: `@/teams/TeamMembers`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/teams/TeamMembers` → `@/app/components/phases/steps/TeamMembersStep`

---

#### 📄 src/app/components/models/content/ContentList.tsx

1. **Line 5**: `@/ContentItem`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/ContentItem` → `@/app/components/models/content/ContentItem`

---

#### 📄 src/app/components/models/data/CalendarDetails.tsx

1. **Line 10**: `@/app/typiings/entities/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/CalendarEntity` → `@/app/components/calendar/Calendar`

2. **Line 10**: `@/app/typiings/entities/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/CalendarEntity` → `@/app/components/calendar/Calendar`

3. **Line 10**: `@/app/typiings/entities/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/CalendarEntity` → `@/app/components/calendar/Calendar`

4. **Line 10**: `@/app/typiings/entities/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/CalendarEntity` → `@/app/components/calendar/Calendar`

5. **Line 10**: `@/app/typiings/entities/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/CalendarEntity` → `@/app/components/calendar/Calendar`

6. **Line 10**: `@/app/typiings/entities/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/CalendarEntity` → `@/app/components/calendar/Calendar`

---

#### 📄 src/app/components/models/data/DataComponent.tsx

1. **Line 2**: `@/app/components/auth/AuthContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/auth/AuthContext` → `@/app/state/context/AuthContext`

2. **Line 3**: `@/app/components/state/redux/slices/RootSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/redux/slices/RootSlice` → `@/app/state/redux/slices/RootSlice`

---

#### 📄 src/app/components/models/data/DataFilterForm.tsx

1. **Line 17**: `@/DataFrameComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/DataFrameComponent` → `@/app/components/models/data/DataFrameComponent`

---

#### 📄 src/app/components/models/data/SearchResultItem.tsx

1. **Line 4**: `@/app/modes/data/Data`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/modes/data/Data` → `@/app/actions/DataActions`

---

#### 📄 src/app/components/models/data/VideoDetails.tsx

1. **Line 4**: `@/app/video/Video`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/video/Video` → `@/app/actions/VideoActions`

---

#### 📄 src/app/components/models/display/MultimediaContentCustomization.tsx

1. **Line 5**: `./DeviceDimensions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DeviceDimensions` → `@/app/models/display/DeviceDimensions`

---

#### 📄 src/app/components/models/realtime/RealTimeVisualization.tsx

1. **Line 4**: `@/RealTimeDataStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RealTimeDataStore` → `@/app/models/data/Data`

---

#### 📄 src/app/components/models/tasks/TaskForm.tsx

1. **Line 4**: `@/Task`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Task` → `@/app/actions/TaskActions`

---

#### 📄 src/app/components/models/teams/TeamComponent.tsx

1. **Line 10**: `@/app/tasks/Task`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/tasks/Task` → `@/app/actions/TaskActions`

2. **Line 11**: `./Team`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./Team` → `@/app/actions/TeamActions`

---

#### 📄 src/app/components/models/teams/TeamDetailsComponent.tsx

1. **Line 19**: `@/app/typings/entities/teamTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/teamTypes` → `@/app/components/teams/Team`

2. **Line 19**: `@/app/typings/entities/teamTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/teamTypes` → `@/app/components/teams/Team`

3. **Line 19**: `@/app/typings/entities/teamTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/teamTypes` → `@/app/components/teams/Team`

4. **Line 19**: `@/app/typings/entities/teamTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/teamTypes` → `@/app/components/teams/Team`

5. **Line 19**: `@/app/typings/entities/teamTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/teamTypes` → `@/app/components/teams/Team`

6. **Line 19**: `@/app/typings/entities/teamTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/teamTypes` → `@/app/components/teams/Team`

---

#### 📄 src/app/components/models/teams/TeamManagementApp.tsx

1. **Line 4**: `@/app/components/interfaces/settings/CollaborationPreferences`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/interfaces/settings/CollaborationPreferences` → `@/app/interfaces/settings/CollaborationPreferences`

2. **Line 5**: `@/TeamData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/TeamData` → `@/app/components/models/teams/TeamData`

---

#### 📄 src/app/components/models/tracker/ExampleComponent.tsx

1. **Line 6**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

2. **Line 10**: `@/data/FileData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/data/FileData` → `@/app/documents/File`

3. **Line 11**: `@/data/FolderData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/data/FolderData` → `@/app/models/data/Data`

4. **Line 12**: `@/Tracker`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Tracker` → `@/app/components/models/tasks/GetTracker`

5. **Line 12**: `@/Tracker`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Tracker` → `@/app/components/models/tasks/GetTracker`

---

#### 📄 src/app/components/models/tree/ProjectExplorer.tsx

1. **Line 4**: `@/pages/dashboards/EnhancedTreeView`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/pages/dashboards/EnhancedTreeView` → `@/app/pages/dashboards/EnhancedTreeView`

---

#### 📄 src/app/components/notifications/NotificationComponent.tsx

1. **Line 8**: `./NotificationService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./NotificationService` → `@/app/components/notifications/Notification`

2. **Line 11**: `@/NotificationComponent.css`
   - **Reason:** Dynamic ESM import failure
   - **Suggested fix:** `@/NotificationComponent.css` → `@/app/components/notifications/Notification`

---

#### 📄 src/app/components/onboarding/OnboardingHook.ts

1. **Line 5**: `@/app/components/documents/DocumentBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/documents/DocumentBuilder` → `@/app/components/documents/DocumentBuilderComponent`

2. **Line 8**: `@/app/pages/onboarding/PersonaBuilderData.js`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/pages/onboarding/PersonaBuilderData.js` → `@/app/models/data/Data`

3. **Line 12**: `@/users/User.jsx`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/users/User.jsx` → `@/app/users/User`

---

#### 📄 src/app/components/phases/AppDevelopmentPhase.tsx

1. **Line 2**: `@/app/auth/context/AuthContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/auth/context/AuthContext` → `@/app/state/context/AuthContext`

---

#### 📄 src/app/components/phases/CourseDevelopmentPhase.tsx

1. **Line 2**: `@/app/context/NotificationContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/context/NotificationContext` → `@/app/components/notifications/Notification`

2. **Line 8**: `@/CourseLearningPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CourseLearningPhase` → `@/app/models/phases/Phase`

3. **Line 9**: `@/CoursePlanningPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CoursePlanningPhase` → `@/app/models/phases/Phase`

4. **Line 10**: `@/CourseSetupPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CourseSetupPhase` → `@/app/models/phases/Phase`

---

#### 📄 src/app/components/phases/EmailConfirmationPhase.tsx

1. **Line 2**: `@/app/communications/email/RequestEmailPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communications/email/RequestEmailPhase` → `@/app/components/communications/email/RequestEmailPhase`

2. **Line 3**: `@/app/communications/email/VerifyEmailPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communications/email/VerifyEmailPhase` → `@/app/components/communications/email/VerifyEmail`

---

#### 📄 src/app/components/phases/TradingProcess.tsx

1. **Line 6**: `@/app/context/StepContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/context/StepContext` → `@/app/state/context/StepContext`

---

#### 📄 src/app/components/phases/collaborationPhase/CollaborationDisplay.tsx

1. **Line 4**: `@/app/components/libraries/animations/DraggableAnimation/useDrag`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/animations/DraggableAnimation/useDrag` → `@/app/libraries/animations/DraggableAnimation/useDrag`

2. **Line 5**: `@/CollaborationContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CollaborationContext` → `@/app/state/context/CollaborationContext`

---

#### 📄 src/app/components/phases/crypto/CryptoEnthusiastCalls.tsx

1. **Line 3**: `@/app/components/auth/authToken`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/auth/authToken` → `@/app/hooks/useAuthToken`

2. **Line 5**: `@/app/components/trading/Trades`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/trading/Trades` → `@/app/components/phases/crypto/TradeStatistics`

3. **Line 10**: `@/app/typings/dataAnalysisTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/dataAnalysisTypes` → `@/app/libraries/cache/client/types`

4. **Line 10**: `@/app/typings/dataAnalysisTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/dataAnalysisTypes` → `@/app/libraries/cache/client/types`

---

#### 📄 src/app/components/phases/crypto/CryptoEnthusiastDashboard.tsx

1. **Line 4**: `@/app/components/crypto/TradingStrategy`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/crypto/TradingStrategy` → `@/app/trading/TradingStrategy`

---

#### 📄 src/app/components/phases/crypto/CryptoTradingPhase.tsx

1. **Line 12**: `@/app/components/trading/Trades`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/trading/Trades` → `@/app/components/phases/crypto/TradeStatistics`

2. **Line 13**: `@/RiskAssessment`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RiskAssessment` → `@/app/calendar/CalendarEventRiskAssessment`

3. **Line 14**: `@/TraderTypesSelection`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/TraderTypesSelection` → `@/app/components/phases/crypto/TraderTypesSelection`

4. **Line 15**: `@/VerificationProcess`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/VerificationProcess` → `@/app/components/phases/crypto/VerificationProcess`

---

#### 📄 src/app/components/phases/ideaPhase/IdeaLifecycleComponent.tsx

1. **Line 3**: `@/path-to-phases-file`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/path-to-phases-file` → `@/app/documents/File`

---

#### 📄 src/app/components/phases/ideaPhase/IdeaLifecycleManager.tsx

1. **Line 6**: `@/IdeaLifecyclePhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/IdeaLifecyclePhase` → `@/app/components/phases/ideaPhase/IdeaLifecyclePhase`

---

#### 📄 src/app/components/phases/ideaPhase/VideoLifecycleManager.tsx

1. **Line 3**: `./useVideoLifecycle`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./useVideoLifecycle` → `@/app/hooks/useVideoLifecycle`

2. **Line 4**: `../store/useVideoStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../store/useVideoStore` → `@/app/state/stores/VideoStore`

3. **Line 5**: `./VideoLifecyclePhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./VideoLifecyclePhase` → `@/app/models/phases/Phase`

---

#### 📄 src/app/components/phases/onboarding/WelcomePhase.tsx

1. **Line 3**: `@/app/components/DynamicNamingConventions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/DynamicNamingConventions` → `@/utils/DynamicNamingConventions`

---

#### 📄 src/app/components/phases/postLaunchPhase/PostLaunchActivitiesPhase.tsx

1. **Line 3**: `@/collaborationPhase/CollaborationSettingsPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/collaborationPhase/CollaborationSettingsPhase` → `@/app/components/phases/collaborationPhase/CollaborationSettingsPhase`

---

#### 📄 src/app/components/phases/steps/StepComponent.tsx

1. **Line 3**: `./../../../../app/context/StepContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./../../../../app/context/StepContext` → `@/app/state/context/StepContext`

2. **Line 4**: `./steps`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./steps` → `@/app/phases/steps/ReviewSteps`

---

#### 📄 src/app/components/prompts/PromptComponent.tsx

1. **Line 3**: `./PromptPage`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./PromptPage` → `@/app/page`

2. **Line 3**: `./PromptPage`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./PromptPage` → `@/app/page`

---

#### 📄 src/app/components/prompts/YourParentComponent.tsx

1. **Line 6**: `./PromptPage`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./PromptPage` → `@/app/page`

---

#### 📄 src/app/components/routing/ProtectedRoute.tsx

1. **Line 28**: `@/forms/LoginForm`
   - **Reason:** Dynamic ESM import failure
   - **Suggested fix:** `@/forms/LoginForm` → `@/app/pages/forms/LoginForm`

---

#### 📄 src/app/components/routing/Search.tsx

1. **Line 10**: `@/app/security/SanitizationFunctions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/SanitizationFunctions` → `@/app/models/cypto/SanitizationFunctions`

---

#### 📄 src/app/components/shared/steps/BasicInfoStep.tsx

1. **Line 3**: `@/GenericStepContainer`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/GenericStepContainer` → `@/app/components/shared/steps/GenericStepContainer`

---

#### 📄 src/app/components/socialMedia/MediaDashboard.tsx

1. **Line 4**: `@/MediaComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/MediaComponent` → `@/app/components/socialMedia/MediaComponent`

---

#### 📄 src/app/components/styling/DynamicColorPalette.tsx

1. **Line 4**: `@/ColorPalette`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/ColorPalette` → `@/app/components/styling/ColorPalette`

---

#### 📄 src/app/components/styling/DynamicIconsAndImages.tsx

1. **Line 3**: `@/LazyIconProps`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/LazyIconProps` → `@/app/components/LazyIconProps`

---

#### 📄 src/app/components/styling/UsageExamplesBox.tsx

1. **Line 7**: `@/a`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/a` → `@/LazyLoadScript`

---

#### 📄 src/app/components/subscriptions/SubscriptionComponent.tsx

1. **Line 27**: `./SubscriptionService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./SubscriptionService` → `@/app/subscriptions/Subscription`

---

#### 📄 src/app/components/support/UserSupport.tsx

1. **Line 2**: `@/LazyIconProps`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/LazyIconProps` → `@/app/components/LazyIconProps`

2. **Line 4**: `@/icons/IconLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/icons/IconLoader` → `@/app/components/icons/IconLoader`

3. **Line 4**: `@/icons/IconLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/icons/IconLoader` → `@/app/components/icons/IconLoader`

4. **Line 4**: `@/icons/IconLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/icons/IconLoader` → `@/app/components/icons/IconLoader`

5. **Line 4**: `@/icons/IconLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/icons/IconLoader` → `@/app/components/icons/IconLoader`

---

#### 📄 src/app/components/tasks/TaskForm.tsx

1. **Line 4**: `@/Task`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Task` → `@/app/actions/TaskActions`

---

#### 📄 src/app/components/tasks/TaskManagerComponent.tsx

1. **Line 15**: `@/app/models/members/Members`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/members/Members` → `@/app/components/phases/steps/TeamMembersStep`

---

#### 📄 src/app/components/teams/TeamComponent.tsx

1. **Line 10**: `@/app/tasks/Task`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/tasks/Task` → `@/app/actions/TaskActions`

2. **Line 11**: `../../models/teams/Team`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../../models/teams/Team` → `@/app/actions/TeamActions`

---

#### 📄 src/app/components/trading/TradeData.tsx

1. **Line 5**: `@/app/models/CommonDetails`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/CommonDetails` → `@/app/components/models/data/Details`

2. **Line 5**: `@/app/models/CommonDetails`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/CommonDetails` → `@/app/components/models/data/Details`

3. **Line 11**: `@/appp/models/tracker/Tag`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/appp/models/tracker/Tag` → `@/app/api/InstagramAPI`

---

#### 📄 src/app/components/users/ParticipantComponent.tsx

1. **Line 11**: `@/app/models/Participant`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/Participant` → `@/app/actions/ParticipantActions`

---

#### 📄 src/app/components/users/UserDataComponent.tsx

1. **Line 3**: `@/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/User` → `@/app/actions/UserActions`

2. **Line 4**: `@/UserRoles`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/UserRoles` → `@/app/components/users/UserRolesEditor`

---

#### 📄 src/app/components/users/UserRolesEditor.tsx

1. **Line 2**: `@/UserRoles`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/UserRoles` → `@/app/components/users/UserRolesEditor`

---

#### 📄 src/app/components/users/management/UserManagementComponent.tsx

1. **Line 2**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

2. **Line 4**: `@/UserManagement`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/UserManagement` → `@/app/components/users/management/UserManagementComponent`

---

#### 📄 src/app/components/video/RewindButton.tsx

1. **Line 4**: `@/app/platform/shared/SharedButton`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/platform/shared/SharedButton` → `@/app/components/shared/Share`

---

#### 📄 src/app/components/video/VideoPlayer.tsx

1. **Line 3**: `@/hooks/useVideoPlayer`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/hooks/useVideoPlayer` → `@/app/components/video/VideoPlayer`

2. **Line 5**: `@/VideoPlayerToolbar`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/VideoPlayerToolbar` → `@/app/components/documents/Toolbar`

---

#### 📄 src/app/components/video/VideoPlayerToolbar.tsx

1. **Line 4**: `@/app/component/documents/ToolbarItem`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/component/documents/ToolbarItem` → `@/app/components/documents/Toolbar`

---

#### 📄 src/app/config/MetaDataOptions.ts

1. **Line 23**: `@/app/server/metadata/MetadataStateManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/server/metadata/MetadataStateManager` → `@/app/config/MetadataStateManager`

---

#### 📄 src/app/config/MetadataManager.tsx

1. **Line 7**: `@/app/components/models/data/dataStoreMethods`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/dataStoreMethods` → `@/app/models/data/Data`

2. **Line 7**: `@/app/components/models/data/dataStoreMethods`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/dataStoreMethods` → `@/app/models/data/Data`

3. **Line 13**: `@/DetermineFileType`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/DetermineFileType` → `@/app/components/configs/DetermineFileType`

4. **Line 14**: `@/StructuredMetadata`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/StructuredMetadata` → `@/app/config/StructuredMetadata`

5. **Line 14**: `@/StructuredMetadata`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/StructuredMetadata` → `@/app/config/StructuredMetadata`

6. **Line 14**: `@/StructuredMetadata`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/StructuredMetadata` → `@/app/config/StructuredMetadata`

---

#### 📄 src/app/config/UserSettings.ts

1. **Line 20**: `@/app/models/members/Members`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/members/Members` → `@/app/components/phases/steps/TeamMembersStep`

2. **Line 28**: `@/app/snapshots/SnapshotActoins`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/snapshots/SnapshotActoins` → `@/app/snapshots/Snapshot`

---

#### 📄 src/app/config/VideoLifecycleConfig.ts

1. **Line 4**: `@/app/hooks/VideoLifecyclePhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/hooks/VideoLifecyclePhase` → `@/app/models/phases/Phase`

---

#### 📄 src/app/config/appStructure/BackendStructureComponent.tsx

1. **Line 6**: `./BackendStructure`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./BackendStructure` → `@/app/config/appStructure/BackendStructureComponent`

---

#### 📄 src/app/config/browserConfig.ts

1. **Line 3**: `@/app/components/state/detectBrowserSpecific`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/detectBrowserSpecific` → `@/app/state/detectBrowserSpecific`

---

#### 📄 src/app/config/database/updateDocumentInDatabase.tsx

1. **Line 14**: `@/src/app/config/databaseConnection`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/src/app/config/databaseConnection` → `@/app/actions/database`

---

#### 📄 src/app/config/declarations/global.d.ts

1. **Line 10**: `@/app/components/documents/Presentation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/documents/Presentation` → `@/app/documents/editing/Presentation`

---

#### 📄 src/app/config/declarations/traverseBackend.ts

1. **Line 2**: `@/api/ApiFiles`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/api/ApiFiles` → `@/app/api/ApiFiles`

2. **Line 5**: `@/appStructure/AppStructure`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/appStructure/AppStructure` → `@/app/config/appStructure/AppStructure`

3. **Line 6**: `@/appStructure/BackendStructure`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/appStructure/BackendStructure` → `@/app/config/appStructure/BackendStructureComponent`

4. **Line 7**: `@/appStructure/FrontendStructure`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/appStructure/FrontendStructure` → `@/app/components/development/FrontendStructureViewer`

---

#### 📄 src/app/config/endpoints/EnvironmentAwareEndpointManager.ts

1. **Line 3**: `../environments/EnvironmentConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../environments/EnvironmentConfig` → `@/app/api/config`

2. **Line 3**: `../environments/EnvironmentConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../environments/EnvironmentConfig` → `@/app/api/config`

---

#### 📄 src/app/config/endpoints/newsConfig.ts

1. **Line 2**: `../typings/categories/NewsEndpoints`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../typings/categories/NewsEndpoints` → `@/app/typings/categories/NewsEndpoints`

---

#### 📄 src/app/config/endpoints/notificationsConfig.ts

1. **Line 2**: `@/types/channels`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types/channels` → `@/app/interfaces/chat/Channel`

---

#### 📄 src/app/config/metadata/BaseMetaInfo.ts

1. **Line 3**: `@/app/core/versioning/AppVersionImpl`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/core/versioning/AppVersionImpl` → `@/app/versions/AppVersion`

---

#### 📄 src/app/config/trading/TradingPhaseConfig.tsx

1. **Line 2**: `@/app/phases/crypto/VerificationProcess`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/phases/crypto/VerificationProcess` → `@/app/components/phases/crypto/VerificationProcess`

---

#### 📄 src/app/dashboards/DashboardComponent.tsx

1. **Line 17**: `@/app/socialMedia/MediaDashboard`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/socialMedia/MediaDashboard` → `@/app/components/socialMedia/MediaDashboard`

---

#### 📄 src/app/dashboards/DashboardFramework.tsx

1. **Line 2**: `@/app/admin/AdminDashboard`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/admin/AdminDashboard` → `@/app/components/admin/AdminDashboard`

2. **Line 2**: `@/app/admin/AdminDashboard`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/admin/AdminDashboard` → `@/app/components/admin/AdminDashboard`

3. **Line 15**: `@/app/styling/DynamicSpacingAndLayout`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/styling/DynamicSpacingAndLayout` → `@/app/components/styling/DynamicSpacingAndLayout`

4. **Line 21**: `./../communications/scheduler/MeetingScheduler`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./../communications/scheduler/MeetingScheduler` → `@/app/components/communications/scheduler/Meeting`

---

#### 📄 src/app/dashboards/LoadAquaState.tsx

1. **Line 4**: `@/aqua/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/aqua/types` → `@/app/actions/AppActionTypes`

2. **Line 4**: `@/aqua/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/aqua/types` → `@/app/actions/AppActionTypes`

---

#### 📄 src/app/dashboards/MainDashboardFramework.tsx

1. **Line 3**: `./DashboardPanel`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DashboardPanel` → `@/app/hooks/userInterface/DashboardPanel`

2. **Line 4**: `./VideoFramework`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./VideoFramework` → `@/app/components/video/VideoFramework`

---

#### 📄 src/app/dashboards/ProjectTimelineDashboard.tsx

1. **Line 3**: `@/ProjectTimeline`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/ProjectTimeline` → `@/app/dashboards/ProjectTimelineDashboard`

2. **Line 4**: `@/TeamProgress`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/TeamProgress` → `@/app/components/teams/Team`

---

#### 📄 src/app/dataIntegration/calendarIntegration/calendarEventManager.ts

1. **Line 8**: `@/app/models/members/Members`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/members/Members` → `@/app/components/phases/steps/TeamMembersStep`

---

#### 📄 src/app/dataIntegration/calendarIntegration/scheduleCoordinator.ts

1. **Line 8**: `@/calendarEventManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/calendarEventManager` → `@/app/calendar/CalendarEvent`

---

#### 📄 src/app/dataIntegration/projectIntegration/ProjectLogger.ts

1. **Line 4**: `@/app/features/support/ErrorNotificationUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/features/support/ErrorNotificationUtils` → `@/app/components/notifications/Notification`

---

#### 📄 src/app/dataIntegration/reduxIntegration.ts

1. **Line 11**: `@/features/support/NotificationsSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/features/support/NotificationsSlice` → `@/app/components/notifications/Notification`

---

#### 📄 src/app/documents/DocumentEditor.tsx

1. **Line 11**: `@/app/libraries/ui/components/ComponentActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/libraries/ui/components/ComponentActions` → `@/app/actions/ComponentActions`

---

#### 📄 src/app/documents/DocumentFormattingOptions.tsx

1. **Line 2**: `@/app/components/documents/components/documents/DocumentFormattingOptionsComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/documents/components/documents/DocumentFormattingOptionsComponent` → `@/app/components/documents/DocumentFormattingOptionsComponent`

---

#### 📄 src/app/documents/DocumentGeneratorMethods.ts

1. **Line 27**: `@/app/models/crypto/CryptoWatchlist`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/crypto/CryptoWatchlist` → `@/app/models/cypto/CryptoWatchlist`

2. **Line 28**: `@/app/models/crypto/generateCryptoWatchlistJSON`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/crypto/generateCryptoWatchlistJSON` → `@/app/api/documents/generate`

---

#### 📄 src/app/documents/DocumentManagement.tsx

1. **Line 3**: `@/app/DAppAdapterConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/DAppAdapterConfig` → `@/app/api/config`

---

#### 📄 src/app/documents/FileImportData.tsx

1. **Line 4**: `@/FileSelect`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/FileSelect` → `@/app/documents/File`

---

#### 📄 src/app/documents/FileSelect.tsx

1. **Line 5**: `@/File`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/File` → `@/app/actions/FileActions`

---

#### 📄 src/app/documents/editing/DocumentBuilder.tsx

1. **Line 46**: `@/app/models/StatusType`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/StatusType` → `@/app/models/data/StatusType`

---

#### 📄 src/app/documents/editing/DocumentPage.tsx

1. **Line 6**: `./DocumentOptions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DocumentOptions` → `@/app/documents/DocumentOptions`

2. **Line 6**: `./DocumentOptions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DocumentOptions` → `@/app/documents/DocumentOptions`

---

#### 📄 src/app/documents/editing/MarkdownDocument.ts

1. **Line 4**: `./CommonDocumentPropertiesAndMethods`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./CommonDocumentPropertiesAndMethods` → `@/app/documents/CommonDocumentPropertiesAndMethods`

---

#### 📄 src/app/documents/parsePDF.tsx

1. **Line 5**: `@/app/security/SanitizationFunctions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/SanitizationFunctions` → `@/app/models/cypto/SanitizationFunctions`

2. **Line 5**: `@/app/security/SanitizationFunctions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/SanitizationFunctions` → `@/app/models/cypto/SanitizationFunctions`

---

#### 📄 src/app/examples/CacheExample.ts

1. **Line 24**: `@/app/frontend/buddease/src/app/layout`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/frontend/buddease/src/app/layout` → `@/app/RootLayout`

---

#### 📄 src/app/examples/ExamplePriceService.ts

1. **Line 3**: `./priceService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./priceService` → `@/app/examples/ExamplePriceService`

2. **Line 3**: `./priceService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./priceService` → `@/app/examples/ExamplePriceService`

---

#### 📄 src/app/examples/selectDocumentEditingPermissionsExample.tsx

1. **Line 6**: `../components/users/UserRoles`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../components/users/UserRoles` → `@/app/components/users/UserRolesEditor`

---

#### 📄 src/app/features/RealtimeTranscriptionComponent.tsx

1. **Line 4**: `./hooks/commHooks/useRealtimeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./hooks/commHooks/useRealtimeData` → `@/app/hooks/commHooks/useRealtimeData`

2. **Line 5**: `./hooks/useRealtimeEditing`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./hooks/useRealtimeEditing` → `@/app/hooks/useRealtimeEditing`

3. **Line 6**: `./state/stores/DocumentStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./state/stores/DocumentStore` → `@/app/server/documents`

4. **Line 7**: `./strategy/calculateKPMBasedOnEditorChanges`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./strategy/calculateKPMBasedOnEditorChanges` → `@/app/components/strategy/KPM`

---

#### 📄 src/app/features/feedback/FeedbackLoop.tsx

1. **Line 4**: `@/support/Feedback`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/support/Feedback` → `@/app/actions/UserSupportFeedbackActions`

---

#### 📄 src/app/features/meetings/host/HostVideoLayout.tsx

1. **Line 3**: `@/VideoAPI`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/VideoAPI` → `@/app/api/videos/VideoAPI`

2. **Line 4**: `@/VideoViewer`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/VideoViewer` → `@/app/state/redux/sagas/VideoViewer`

---

#### 📄 src/app/features/meetings/host/MeetingSchedulerHostScreen.tsx

1. **Line 3**: `@/MeetingSchedulerHostToolbar`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/MeetingSchedulerHostToolbar` → `@/app/components/communications/scheduler/Meeting`

---

#### 📄 src/app/features/meetings/viewer/MeetingSchedulerViewerScreen.tsx

1. **Line 3**: `@/MeetingSchedulerViewerToolbar`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/MeetingSchedulerViewerToolbar` → `@/app/components/communications/scheduler/Meeting`

---

#### 📄 src/app/features/meetings/viewer/ViewerVideoLayout.tsx

1. **Line 3**: `@/VideoAPI`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/VideoAPI` → `@/app/api/videos/VideoAPI`

2. **Line 4**: `@/VideoViewer`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/VideoViewer` → `@/app/state/redux/sagas/VideoViewer`

---

#### 📄 src/app/features/shortcuts/ShortcutKeys.tsx

1. **Line 12**: `@/app/editing/autosave`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/editing/autosave` → `@/app/actions/AutosaveActions`

2. **Line 13**: `@/app/event/DynamicEventHandlerExample`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/event/DynamicEventHandlerExample` → `@/app/events/Event`

3. **Line 13**: `@/app/event/DynamicEventHandlerExample`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/event/DynamicEventHandlerExample` → `@/app/events/Event`

4. **Line 14**: `@/app/components/crypto/SanitizationFunctions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/crypto/SanitizationFunctions` → `@/app/models/cypto/SanitizationFunctions`

---

#### 📄 src/app/features/support/FeedbackAggregator.tsx

1. **Line 3**: `@/app/suppport/Feedback`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/suppport/Feedback` → `@/app/actions/UserSupportFeedbackActions`

---

#### 📄 src/app/features/support/SupportTicketComponent.tsx

1. **Line 6**: `@/app/state/store`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/store` → `@/app/api/ApiStore`

2. **Line 7**: `@/app/state/slices/ApiManagerSlice`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

3. **Line 7**: `@/app/state/slices/ApiManagerSlice`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

4. **Line 8**: `@/UserSupportPhaseComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/UserSupportPhaseComponent` → `@/app/components/support/UserSupport`

---

#### 📄 src/app/generators/GenerateNewTeam.ts

1. **Line 3**: `@/app/components/models/teams/Team`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/teams/Team` → `@/app/actions/TeamActions`

---

#### 📄 src/app/generators/GenerateNewTodo.ts

1. **Line 3**: `@/app/components/todos/Todo`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/todos/Todo` → `@/app/actions/TodoActions`

---

#### 📄 src/app/generators/GenerateTokens.tsx

1. **Line 4**: `@/app/context/NotificationContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/context/NotificationContext` → `@/app/components/notifications/Notification`

---

#### 📄 src/app/generators/TeamManagementFeatureGenerator.ts

1. **Line 2**: `@/app/api/ApiCodeGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/ApiCodeGenerator` → `@/app/generators/ApiCodeGenerator`

2. **Line 3**: `@/app/api/ApiCodeOptions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/ApiCodeOptions` → `@/app/generators/ApiCodeOptions`

3. **Line 21**: `./TeamManagementApi`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./TeamManagementApi` → `@/app/api/TeamManagementApi`

4. **Line 22**: `@/app/api/ApiCodeGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/ApiCodeGenerator` → `@/app/generators/ApiCodeGenerator`

---

#### 📄 src/app/generators/corrections/CorrectionGenerator.ts

1. **Line 512**: `@/utils/snapshot`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/utils/snapshot` → `@/app/actions/SnapshotActions`

---

#### 📄 src/app/generators/corrections/CorrectionWizard.tsx

1. **Line 6**: `@/app/components/analysis/AnalysisStep`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/analysis/AnalysisStep` → `@/app/components/phases/steps/AnalysisStep`

2. **Line 7**: `@/app/components/corrections/CorrectionList`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/corrections/CorrectionList` → `@/app/components/lists/CorrectionList`

---

#### 📄 src/app/generators/corrections/SnapshotAnalyzer.ts

1. **Line 122**: `@/app/utils/snapshot`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/snapshot` → `@/app/actions/SnapshotActions`

---

#### 📄 src/app/generators/generateDynamicData.tsx

1. **Line 2**: `@/app/components/models/CommonDetails`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/CommonDetails` → `@/app/components/models/data/Details`

---

#### 📄 src/app/generators/generateNewApiConfig.ts

1. **Line 5**: `@/configs/database/dataLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/configs/database/dataLoader` → `@/app/models/data/Data`

---

#### 📄 src/app/generators/generateNewRoute.tsx

1. **Line 2**: `@/app/components/crypto/SafeParseData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/crypto/SafeParseData` → `@/app/dataIntegration/SafeParseData`

2. **Line 3**: `@/app/components/libraries/ui/components/ConditionalRouteComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/components/ConditionalRouteComponent` → `@/app/api/apiKey/route`

3. **Line 4**: `@/app/components/libraries/ui/components/DynamicRouteComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/components/DynamicRouteComponent` → `@/app/api/apiKey/route`

4. **Line 5**: `@/app/components/models/data/Data`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/Data` → `@/app/actions/DataActions`

5. **Line 7**: `@/app/libraries/logging/Logger`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/libraries/logging/Logger` → `@/app/config/LoggerConfig`

6. **Line 9**: `@/components/typings/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/components/typings/types` → `@/app/actions/AppActionTypes`

7. **Line 10**: `@/shared/DynamicErrorBoundary`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/shared/DynamicErrorBoundary` → `@/app/shared/DynamicErrorBoundary`

---

#### 📄 src/app/generators/processSnapshotList.tsx

1. **Line 2**: `@/app/components/documents/screenFunctionality/ShortcutKeys`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/documents/screenFunctionality/ShortcutKeys` → `@/app/features/shortcuts/ShortcutKeys`

2. **Line 3**: `@/app/components/event/DynamicEventHandlerExample`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/event/DynamicEventHandlerExample` → `@/app/events/Event`

---

#### 📄 src/app/highlighting/screenFunctionality/HighlightEvent.ts

1. **Line 4**: `@/DocumentBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/DocumentBuilder` → `@/app/components/documents/DocumentBuilderComponent`

---

#### 📄 src/app/highlighting/screenFunctionality/HighlightEventMetadata.ts

1. **Line 2**: `@/app/components/documents/Attachment`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/documents/Attachment` → `@/app/components/calendar/AttachmentsAndLinks`

---

#### 📄 src/app/hooks/GenerateUserLayout.ts

1. **Line 5**: `@/styling/ResponsiveDesign`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/styling/ResponsiveDesign` → `@/app/components/styling/ResponsiveDesign`

---

#### 📄 src/app/hooks/NFTConversionComponent.tsx

1. **Line 5**: `@/NFTService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/NFTService` → `@/app/components/nft/NFTService`

---

#### 📄 src/app/hooks/VideoLifecycleHooks.ts

1. **Line 2**: `../Lifecycle`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../Lifecycle` → `@/app/api/IdeaLifecycleAPI`

2. **Line 3**: `./VideoLifecyclePhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./VideoLifecyclePhase` → `@/app/models/phases/Phase`

---

#### 📄 src/app/hooks/YourComponent.tsx

1. **Line 5**: `@/app/api/ApiConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/ApiConfig` → `@/app/api/ApiConfigManager`

2. **Line 15**: `@/app/typings/entties/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entties/CalendarEntity` → `@/app/components/calendar/Calendar`

3. **Line 15**: `@/app/typings/entties/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entties/CalendarEntity` → `@/app/components/calendar/Calendar`

4. **Line 15**: `@/app/typings/entties/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entties/CalendarEntity` → `@/app/components/calendar/Calendar`

5. **Line 15**: `@/app/typings/entties/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entties/CalendarEntity` → `@/app/components/calendar/Calendar`

6. **Line 15**: `@/app/typings/entties/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entties/CalendarEntity` → `@/app/components/calendar/Calendar`

7. **Line 15**: `@/app/typings/entties/CalendarEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entties/CalendarEntity` → `@/app/components/calendar/Calendar`

---

#### 📄 src/app/hooks/commHooks/MessagingSystem.tsx

1. **Line 4**: `@/app/dynamicHooks/dynamicHookGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/dynamicHooks/dynamicHookGenerator` → `@/app/hooks/dynamicHooks/dynamicHookGenerator`

---

#### 📄 src/app/hooks/commHooks/idleTimeoutParams.ts

1. **Line 3**: `@/app/DynamicHookParams`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/DynamicHookParams` → `@/app/hooks/DynamicHookParams`

---

#### 📄 src/app/hooks/commHooks/useRealtimeDextData.ts

1. **Line 3**: `@/app/models/realtime/RealtimeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/realtime/RealtimeData` → `@/app/api/ApiRealtimeData`

---

#### 📄 src/app/hooks/commHooks/useRealtimeExchangeData.ts

1. **Line 3**: `@/app/crypto/exchangeIntegration`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/crypto/exchangeIntegration` → `@/app/api/exchangeIntegrationServer`

2. **Line 4**: `@/app/models/realtime/RealtimeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/realtime/RealtimeData` → `@/app/api/ApiRealtimeData`

---

#### 📄 src/app/hooks/dataHooks/RealtimeUpdatesComponent.tsx

1. **Line 6**: `@/app/components/auth/AuthContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/auth/AuthContext` → `@/app/state/context/AuthContext`

2. **Line 7**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

3. **Line 8**: `@/app/components/web3/dAppAdapter/functionality/RealtimeUpdates`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/web3/dAppAdapter/functionality/RealtimeUpdates` → `@/app/hooks/dataHooks/RealtimeUpdatesComponent`

---

#### 📄 src/app/hooks/documents/useToolbarOptions.ts

1. **Line 3**: `./Toolbar`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./Toolbar` → `@/app/actions/ToolbarActions`

---

#### 📄 src/app/hooks/dynamicHooks/createCustomTransaction.ts

1. **Line 5**: `@/app/crypto/SmartContractInteraction`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/crypto/SmartContractInteraction` → `@/app/typings/cryptoTypes/SmartContractInteraction`

---

#### 📄 src/app/hooks/dynamicHooks/dynamicFormGenerator.ts

1. **Line 4**: `@/dynamicQuestionGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/dynamicQuestionGenerator` → `@/app/hooks/dynamicHooks/dynamicQuestionGenerator`

---

#### 📄 src/app/hooks/generateDynamicDummyHook.tsx

1. **Line 3**: `@/dynamicHooks/dynamicHookGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/dynamicHooks/dynamicHookGenerator` → `@/app/hooks/dynamicHooks/dynamicHookGenerator`

---

#### 📄 src/app/hooks/getCurrentAppType.ts

1. **Line 3**: `./state/redux/slices/RootSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./state/redux/slices/RootSlice` → `@/app/state/redux/slices/RootSlice`

---

#### 📄 src/app/hooks/phaseHooks/CollaborationPhaseHooks.tsx

1. **Line 8**: `@/app/hooks/phases/DynamicPromptPhaseHook`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/hooks/phases/DynamicPromptPhaseHook` → `@/app/hooks/phaseHooks/DynamicPromptPhaseHook`

---

#### 📄 src/app/hooks/phaseHooks/CollaborativeBloggingPlatform.tsx

1. **Line 6**: `@/app/components/web3/dAppAdapter/AdapterContent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/web3/dAppAdapter/AdapterContent` → `@/utils/web3/dAppAdapter/AdapterContent`

---

#### 📄 src/app/hooks/phaseHooks/DynamicPromptPhaseHook.tsx

1. **Line 4**: `@/dynamicHooks/dynamicHookGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/dynamicHooks/dynamicHookGenerator` → `@/app/hooks/dynamicHooks/dynamicHookGenerator`

---

#### 📄 src/app/hooks/phases/LifecycleManager.ts

1. **Line 2**: `./Lifecycle`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./Lifecycle` → `@/app/api/IdeaLifecycleAPI`

2. **Line 2**: `./Lifecycle`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./Lifecycle` → `@/app/api/IdeaLifecycleAPI`

3. **Line 2**: `./Lifecycle`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./Lifecycle` → `@/app/api/IdeaLifecycleAPI`

4. **Line 2**: `./Lifecycle`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./Lifecycle` → `@/app/api/IdeaLifecycleAPI`

---

#### 📄 src/app/hooks/phases/UIPhase.ts

1. **Line 16**: `@/app/state/stores/CalendarEvent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/stores/CalendarEvent` → `@/app/actions/CalendarEventActions`

2. **Line 21**: `@/app/models/data/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/data/BaseConfig` → `@/app/api/config`

3. **Line 21**: `@/app/models/data/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/data/BaseConfig` → `@/app/api/config`

4. **Line 21**: `@/app/models/data/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/data/BaseConfig` → `@/app/api/config`

5. **Line 22**: `@/app/models/data/Attachment`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/data/Attachment` → `@/app/components/calendar/AttachmentsAndLinks`

---

#### 📄 src/app/hooks/phases/lifecycles.ts

1. **Line 15**: `@/app/typings/entities/PhaseEntiity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/PhaseEntiity` → `@/app/models/phases/Phase`

2. **Line 15**: `@/app/typings/entities/PhaseEntiity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/PhaseEntiity` → `@/app/models/phases/Phase`

3. **Line 15**: `@/app/typings/entities/PhaseEntiity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/PhaseEntiity` → `@/app/models/phases/Phase`

4. **Line 15**: `@/app/typings/entities/PhaseEntiity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/PhaseEntiity` → `@/app/models/phases/Phase`

5. **Line 15**: `@/app/typings/entities/PhaseEntiity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/PhaseEntiity` → `@/app/models/phases/Phase`

6. **Line 15**: `@/app/typings/entities/PhaseEntiity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/PhaseEntiity` → `@/app/models/phases/Phase`

---

#### 📄 src/app/hooks/useChatDashboard.tsx

1. **Line 6**: `@/dynamicHooks/dynamicHookGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/dynamicHooks/dynamicHookGenerator` → `@/app/hooks/dynamicHooks/dynamicHookGenerator`

2. **Line 7**: `@/libraries/animations/text/TypingAnimation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/libraries/animations/text/TypingAnimation` → `@/app/libraries/animations/text/TypingAnimation`

---

#### 📄 src/app/hooks/useCryptoIntegration.ts

1. **Line 4**: `@/services/CryptoIntegrationService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/services/CryptoIntegrationService` → `@/app/components/documents/documentation/report/Integration`

2. **Line 4**: `@/services/CryptoIntegrationService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/services/CryptoIntegrationService` → `@/app/components/documents/documentation/report/Integration`

3. **Line 5**: `@/config/endpoints/EnvironmentAwareEndpointManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/endpoints/EnvironmentAwareEndpointManager` → `@/app/config/endpoints/EnvironmentAwareEndpointManager`

---

#### 📄 src/app/hooks/useDynamicNavigation.ts

1. **Line 3**: `./NavigationContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./NavigationContext` → `@/app/state/context/NavigationContext`

---

#### 📄 src/app/hooks/useEventSystem.ts

1. **Line 11**: `@/types/baseTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types/baseTypes` → `@/app/config/DatabaseTypes`

2. **Line 11**: `@/types/baseTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types/baseTypes` → `@/app/config/DatabaseTypes`

3. **Line 12**: `@/types/attachmentTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types/attachmentTypes` → `@/app/documents/attachment/Attachment`

---

#### 📄 src/app/hooks/useFetchUser.ts

1. **Line 4**: `@/security/AuthValidation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/security/AuthValidation` → `@/app/server/security/AuthValidation`

2. **Line 5**: `@/users/UserActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/users/UserActions` → `@/app/actions/UserActions`

---

#### 📄 src/app/hooks/useIconLoaderAsync.tsx

1. **Line 5**: `@/app/icons/fontAwesomeIconLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/icons/fontAwesomeIconLoader` → `@/app/components/icons/IconLoader`

2. **Line 5**: `@/app/icons/fontAwesomeIconLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/icons/fontAwesomeIconLoader` → `@/app/components/icons/IconLoader`

3. **Line 6**: `@/app/icons/fontAwesomeIconOptions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/icons/fontAwesomeIconOptions` → `@/app/components/icons/fontAwesomeIconOptions`

4. **Line 7**: `@/app/icons/iconLibraryLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/icons/iconLibraryLoader` → `@/app/components/icons/iconLibraryLoader`

5. **Line 7**: `@/app/icons/iconLibraryLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/icons/iconLibraryLoader` → `@/app/components/icons/iconLibraryLoader`

---

#### 📄 src/app/hooks/useIconStore.ts

1. **Line 3**: `./IconStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./IconStore` → `@/app/components/icons/icons`

2. **Line 3**: `./IconStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./IconStore` → `@/app/components/icons/icons`

3. **Line 4**: `./IconStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./IconStore` → `@/app/components/icons/icons`

---

#### 📄 src/app/hooks/useLifecycle.ts.ts

1. **Line 4**: `../LifecycleManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../LifecycleManager` → `@/app/components/phases/ideaPhase/IdeaLifecycleManager`

2. **Line 5**: `../Lifecycle`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../Lifecycle` → `@/app/api/IdeaLifecycleAPI`

3. **Line 5**: `../Lifecycle`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../Lifecycle` → `@/app/api/IdeaLifecycleAPI`

---

#### 📄 src/app/hooks/usePhaseActivity.ts

1. **Line 4**: `../mobx/PhaseActivityStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../mobx/PhaseActivityStore` → `@/app/hooks/phases/PhaseActivity`

2. **Line 5**: `../redux/phaseActivitySlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../redux/phaseActivitySlice` → `@/app/hooks/phases/PhaseActivity`

3. **Line 6**: `../redux/store`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../redux/store` → `@/app/api/ApiStore`

---

#### 📄 src/app/hooks/useRealtimeEditing.ts

1. **Line 4**: `@/useWebSocket`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/useWebSocket` → `@/app/components/communications/WebSocket`

---

#### 📄 src/app/hooks/useRegistration.ts

1. **Line 3**: `@/app/state/contexts/NotificationContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/contexts/NotificationContext` → `@/app/components/notifications/Notification`

---

#### 📄 src/app/hooks/useSecureDocumentId.ts

1. **Line 4**: `@/security/SanitizationFunctions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/security/SanitizationFunctions` → `@/app/models/cypto/SanitizationFunctions`

---

#### 📄 src/app/hooks/useSecureExchangeId.ts

1. **Line 4**: `@/app/auth/AuthContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/auth/AuthContext` → `@/app/state/context/AuthContext`

2. **Line 5**: `@/app/security/SanitizationFunctions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/SanitizationFunctions` → `@/app/models/cypto/SanitizationFunctions`

---

#### 📄 src/app/hooks/useSecureProjectId.ts

1. **Line 3**: `@/security/SanitizationFunctions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/security/SanitizationFunctions` → `@/app/models/cypto/SanitizationFunctions`

---

#### 📄 src/app/hooks/useSimplePhaseManagement.ts

1. **Line 3**: `@/app/types/phases`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/types/phases` → `@/app/api/ApiPhases`

2. **Line 3**: `@/app/types/phases`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/types/phases` → `@/app/api/ApiPhases`

---

#### 📄 src/app/hooks/useSorting.ts

1. **Line 5**: `@/settings/SortCriteria`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/settings/SortCriteria` → `@/app/settings/SortCriteria`

2. **Line 6**: `@/app/state/stores/CalendarEvent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/stores/CalendarEvent` → `@/app/actions/CalendarEventActions`

---

#### 📄 src/app/hooks/useSupportTickets.ts

1. **Line 4**: `@/app/state/store`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/store` → `@/app/api/ApiStore`

2. **Line 5**: `@/app/state/slices/ApiManagerSlice`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

3. **Line 6**: `@/features/support/SupportTicketComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/features/support/SupportTicketComponent` → `@/app/features/support/SupportTicketComponent`

4. **Line 6**: `@/features/support/SupportTicketComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/features/support/SupportTicketComponent` → `@/app/features/support/SupportTicketComponent`

---

#### 📄 src/app/hooks/useTestPhaseHooks.tsx

1. **Line 2**: `@/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types` → `@/app/actions/AppActionTypes`

2. **Line 2**: `@/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types` → `@/app/actions/AppActionTypes`

3. **Line 2**: `@/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types` → `@/app/actions/AppActionTypes`

---

#### 📄 src/app/hooks/useUserProfile.test.tsx

1. **Line 3**: `@/useUserProfile`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/useUserProfile` → `@/app/documents/File`

---

#### 📄 src/app/hooks/useVideoLifecycle.ts

1. **Line 3**: `../hooks/useLifecycle`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../hooks/useLifecycle` → `@/app/hooks/useLifecycle.ts`

2. **Line 4**: `./VideoLifecycleConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./VideoLifecycleConfig` → `@/app/api/config`

3. **Line 5**: `./VideoLifecyclePhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./VideoLifecyclePhase` → `@/app/models/phases/Phase`

4. **Line 6**: `../store/useVideoStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../store/useVideoStore` → `@/app/state/stores/VideoStore`

---

#### 📄 src/app/hooks/useWebSocket.ts

1. **Line 4**: `@/server/security/csrfToken`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/server/security/csrfToken` → `@/app/api/csrfToken`

---

#### 📄 src/app/hooks/userInterface/NavigationGenerator.tsx

1. **Line 2**: `@/dynamicHooks/dynamicHookGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/dynamicHooks/dynamicHookGenerator` → `@/app/hooks/dynamicHooks/dynamicHookGenerator`

---

#### 📄 src/app/hooks/userInterface/ResizablePanels.tsx

1. **Line 7**: `@/react-resizable/css/styles.css`
   - **Reason:** Dynamic ESM import failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/hooks/userInterface/automation_process.tsx

1. **Line 3**: `@/app/components/api/ErrorHandlingActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/api/ErrorHandlingActions` → `@/app/api/ErrorHandlingActions`

2. **Line 4**: `@/app/components/state/stores/ErrorHandlingStore`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

3. **Line 12**: `@/RandomWalkSuggestions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RandomWalkSuggestions` → `@/app/hooks/userInterface/RandomWalkSuggestions`

---

#### 📄 src/app/hooks/userInterface/useCache.ts

1. **Line 5**: `@/lib/cache`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/lib/cache` → `@/app/actions/AppCacheManagerActions`

---

#### 📄 src/app/interfaces/NavigationManager.tsx

1. **Line 7**: `./PhasesNavigation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./PhasesNavigation` → `@/app/models/phases/Phase`

2. **Line 8**: `./useStepNavigation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./useStepNavigation` → `@/app/hooks/useStepNavigation`

3. **Line 8**: `./useStepNavigation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./useStepNavigation` → `@/app/hooks/useStepNavigation`

4. **Line 9**: `./VoiceControlledNavigation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./VoiceControlledNavigation` → `@/app/components/intelligence/VoiceControlledNavigation`

---

#### 📄 src/app/interfaces/NotificationDisplayUI.tsx

1. **Line 4**: `@/notifications/NotificationComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/notifications/NotificationComponent` → `@/app/components/notifications/Notification`

---

#### 📄 src/app/interfaces/chat/GroupChat.ts

1. **Line 2**: `@/app/communications/chat/ChatMessage`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communications/chat/ChatMessage` → `@/app/actions/ChatMessageActions`

---

#### 📄 src/app/interfaces/features/FeatureTogglePage.tsx

1. **Line 4**: `@/app/components/state/featureStateManagement`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/featureStateManagement` → `@/app/state/featureStateManagement`

---

#### 📄 src/app/interfaces/options/CustomizationOptions.tsx

1. **Line 5**: `@/config//LayoutCustomization`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config//LayoutCustomization` → `@/app/components/configs/LayoutCustomization`

2. **Line 9**: `@/app/components/state/redux/slices/ThemeSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/redux/slices/ThemeSlice` → `@/app/libraries/ui/theme/Theme`

---

#### 📄 src/app/interfaces/provider/CloudStorageProvider.ts

1. **Line 2**: `@/app/typings/file/FileManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/file/FileManager` → `@/app/components/models/file/FileManager`

---

#### 📄 src/app/interfaces/provider/dataProviderInstance.ts

1. **Line 2**: `@/app/api/axiosInstance`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/axiosInstance` → `@/app/server/security/axiosInstance`

---

#### 📄 src/app/libraries/animations/AnimationControls.tsx

1. **Line 3**: `@/AnimationComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/AnimationComponent` → `@/app/libraries/animations/AnimationComponent`

2. **Line 3**: `@/AnimationComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/AnimationComponent` → `@/app/libraries/animations/AnimationComponent`

---

#### 📄 src/app/libraries/animations/text/TypingAnimation.tsx

1. **Line 2**: `@/app/styling/AnimationsAndTansitions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/styling/AnimationsAndTansitions` → `@/app/components/styling/AnimationsAndTansitions`

---

#### 📄 src/app/libraries/cache/client/CacheManager.ts

1. **Line 5**: `@/constants`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/constants` → `@/app/hooks/commHooks/idleTimeoutConstants`

2. **Line 8**: `@/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types` → `@/app/actions/AppActionTypes`

---

#### 📄 src/app/libraries/cache/client/DocumentCreator.tsx

1. **Line 4**: `@/app/lib/documents/client/DocumentGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/lib/documents/client/DocumentGenerator` → `@/app/components/documents/YourDocumentGeneratorComponent`

2. **Line 4**: `@/app/lib/documents/client/DocumentGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/lib/documents/client/DocumentGenerator` → `@/app/components/documents/YourDocumentGeneratorComponent`

---

#### 📄 src/app/libraries/categories/getCategoryFromFilePath.ts

1. **Line 3**: `@/app/components/libraries/categories/fileCategoryMapping`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/categories/fileCategoryMapping` → `@/app/documents/File`

2. **Line 4**: `@/app/components/logging/determineFileCategoryLogger`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/logging/determineFileCategoryLogger` → `@/app/documents/File`

---

#### 📄 src/app/libraries/drawing/drawingLibrary.ts

1. **Line 6**: `@/generateDrawingJSON`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/generateDrawingJSON` → `@/app/api/documents/generate`

---

#### 📄 src/app/libraries/menu/ClearFiltersButton.tsx

1. **Line 3**: `@/app/ui/buttons/ReusableButton`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ui/buttons/ReusableButton` → `@/app/libraries/ui/buttons/ReusableButton`

---

#### 📄 src/app/libraries/menu/Dropdown.tsx

1. **Line 3**: `@/app/animations/DynamicSelectionControls`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/animations/DynamicSelectionControls` → `@/app/libraries/animations/DynamicSelectionControls`

---

#### 📄 src/app/libraries/presentations/generatePresentationJSON.ts

1. **Line 2**: `@/app/documents/Presentation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/documents/Presentation` → `@/app/documents/editing/Presentation`

---

#### 📄 src/app/libraries/presentations/presentationLibrary.ts

1. **Line 3**: `@/app/documents/Presentation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/documents/Presentation` → `@/app/documents/editing/Presentation`

2. **Line 3**: `@/app/documents/Presentation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/documents/Presentation` → `@/app/documents/editing/Presentation`

---

#### 📄 src/app/libraries/theme/ThemeManagerServiceContext.tsx

1. **Line 2**: `@/app/components/libraries/ui/theme/ThemeConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/theme/ThemeConfig` → `@/app/api/config`

---

#### 📄 src/app/libraries/theme/ThemeService.ts

1. **Line 3**: `@/app/actions/themeChangeAction`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/actions/themeChangeAction` → `@/app/libraries/actions/themeChangeAction`

---

#### 📄 src/app/libraries/ui/DraggableDiv.tsx

1. **Line 5**: `@/app/components/libraries/animations/movementAnimations/MovementAnimationActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/animations/movementAnimations/MovementAnimationActions` → `@/app/libraries/animations/movementAnimations/MovementAnimationActions`

---

#### 📄 src/app/libraries/ui/DynamicRenderer.tsx

1. **Line 4**: `@/app/DynamicComponentsContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/DynamicComponentsContext` → `@/app/components/DynamicComponentsContext`

2. **Line 9**: `@/app/event/DynamicEventHandlerExample`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/event/DynamicEventHandlerExample` → `@/app/events/Event`

---

#### 📄 src/app/libraries/ui/buttons/FullscreenButtonComponent.tsx

1. **Line 4**: `@/app/platform/shared/SharedButton`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/platform/shared/SharedButton` → `@/app/components/shared/Share`

2. **Line 6**: `@/app/menu/ToggleSwitch`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/menu/ToggleSwitch` → `@/app/components/containers/ToggleSwitchContainer`

---

#### 📄 src/app/libraries/ui/buttons/ReusableButton.tsx

1. **Line 4**: `@/platform/shared/SharedButton`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/platform/shared/SharedButton` → `@/app/components/shared/Share`

2. **Line 4**: `@/platform/shared/SharedButton`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/platform/shared/SharedButton` → `@/app/components/shared/Share`

---

#### 📄 src/app/libraries/ui/theme/AliasToken.ts

1. **Line 3**: `@/MapProperties`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/MapProperties` → `@/app/libraries/ui/theme/MapProperties`

---

#### 📄 src/app/libraries/ui/useUIStore.ts

1. **Line 3**: `@/app/components/state/stores/UIStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/stores/UIStore` → `@/app/libraries/ui/useUIStore`

---

#### 📄 src/app/middleware/pipeline/createMiddlewarePipeline.ts

1. **Line 3**: `@/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types` → `@/app/actions/AppActionTypes`

2. **Line 3**: `@/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types` → `@/app/actions/AppActionTypes`

---

#### 📄 src/app/middleware/pipeline/middlewareManager.ts

1. **Line 2**: `@/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types` → `@/app/actions/AppActionTypes`

2. **Line 2**: `@/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types` → `@/app/actions/AppActionTypes`

3. **Line 2**: `@/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types` → `@/app/actions/AppActionTypes`

4. **Line 3**: `@/createMiddlewarePipeline`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/createMiddlewarePipeline` → `@/app/middleware/pipeline/createMiddlewarePipeline`

---

#### 📄 src/app/models/ProjectModel.tsx

1. **Line 7**: `@/app/todos/tasks/DatabaseClient`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/todos/tasks/DatabaseClient` → `@/app/actions/database`

---

#### 📄 src/app/models/UserManagement.ts

1. **Line 3**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

---

#### 📄 src/app/models/UserProfileManagement.ts

1. **Line 3**: `./User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./User` → `@/app/actions/UserActions`

---

#### 📄 src/app/models/builders/TaskSnapshotConfigBuilder.ts

1. **Line 12**: `@/app/snapshots/SnapshotMeta`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/snapshots/SnapshotMeta` → `@/app/config/metadata/SnapshotMetadata`

---

#### 📄 src/app/models/content/BlogAndContentEditorWrapper.tsx

1. **Line 3**: `@/app/components/typings/ContentType`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/typings/ContentType` → `@/app/products/YourProductContentType`

2. **Line 5**: `@/blogs/BlogAction`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/blogs/BlogAction` → `@/app/actions/BlogAction`

3. **Line 9**: `@/app/pages/blog/BlogAndContentEditor`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/pages/blog/BlogAndContentEditor` → `@/app/components/framework/BlogAndContentEditorFramework`

---

#### 📄 src/app/models/content/fetchContent.tsx

1. **Line 27**: `./contentApiService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./contentApiService` → `@/app/api/contentApiService`

---

#### 📄 src/app/models/cypto/detectArbitrage.ts

1. **Line 2**: `./parseData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./parseData` → `@/app/dataIntegration/SafeParseData`

2. **Line 2**: `./parseData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./parseData` → `@/app/dataIntegration/SafeParseData`

---

#### 📄 src/app/models/cypto/realTimePriceComparison.ts

1. **Line 16**: `@/app/models/crypto/exchangeIntegration`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/crypto/exchangeIntegration` → `@/app/api/exchangeIntegrationServer`

2. **Line 16**: `@/app/models/crypto/exchangeIntegration`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/crypto/exchangeIntegration` → `@/app/api/exchangeIntegrationServer`

---

#### 📄 src/app/models/data/DataService.ts

1. **Line 3**: `@/app/models/StatusType`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/StatusType` → `@/app/models/data/StatusType`

---

#### 📄 src/app/models/data/DetailsContext.tsx

1. **Line 2**: `@/app/components/state/stores/DetailsListStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/stores/DetailsListStore` → `@/app/components/lists/DetailsList`

2. **Line 7**: `@/CommonData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CommonData` → `@/app/models/CommonData.test`

3. **Line 8**: `@/Data`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Data` → `@/app/actions/DataActions`

---

#### 📄 src/app/models/data/ExchangeData.ts

1. **Line 6**: `@/app/models/crypto/exchangeIntegration`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/crypto/exchangeIntegration` → `@/app/api/exchangeIntegrationServer`

---

#### 📄 src/app/models/data/fetchExchangeData.ts

1. **Line 4**: `@/app/typings/dataAnalysisTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/dataAnalysisTypes` → `@/app/libraries/cache/client/types`

---

#### 📄 src/app/models/phases/Phase.ts

1. **Line 13**: `@/app/models/members/Members`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/members/Members` → `@/app/components/phases/steps/TeamMembersStep`

---

#### 📄 src/app/models/phases/Phases.tsx

1. **Line 5**: `@/app/calendar/CalendarPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/calendar/CalendarPhase` → `@/app/components/calendar/Calendar`

2. **Line 6**: `@/app/documents/CourseBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/documents/CourseBuilder` → `@/app/documents/editing/CourseBuilder`

---

#### 📄 src/app/models/realtime/RealTimeDataCollection.tsx

1. **Line 5**: `@/app/components/state/stores/CalendarEvent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/stores/CalendarEvent` → `@/app/actions/CalendarEventActions`

2. **Line 6**: `@/app/crypto/DEX`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/crypto/DEX` → `@/app/actions/DEXActions`

3. **Line 19**: `./RealtimeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./RealtimeData` → `@/app/api/ApiRealtimeData`

4. **Line 19**: `./RealtimeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./RealtimeData` → `@/app/api/ApiRealtimeData`

---

#### 📄 src/app/models/realtime/RealTimeDataStore.tsx

1. **Line 2**: `@/app/utils/web3/dAppAdapter/AppEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/web3/dAppAdapter/AppEntity` → `@/app/typings/entities/AppEntity`

2. **Line 2**: `@/app/utils/web3/dAppAdapter/AppEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/web3/dAppAdapter/AppEntity` → `@/app/typings/entities/AppEntity`

3. **Line 2**: `@/app/utils/web3/dAppAdapter/AppEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/web3/dAppAdapter/AppEntity` → `@/app/typings/entities/AppEntity`

4. **Line 2**: `@/app/utils/web3/dAppAdapter/AppEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/web3/dAppAdapter/AppEntity` → `@/app/typings/entities/AppEntity`

---

#### 📄 src/app/models/realtime/RealTimeVisualization.tsx

1. **Line 4**: `@/RealTimeDataStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RealTimeDataStore` → `@/app/models/data/Data`

---

#### 📄 src/app/models/teams/TeamManagementApp.tsx

1. **Line 4**: `@/app/components/interfaces/settings/CollaborationPreferences`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/interfaces/settings/CollaborationPreferences` → `@/app/interfaces/settings/CollaborationPreferences`

2. **Line 5**: `@/TeamData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/TeamData` → `@/app/components/models/teams/TeamData`

---

#### 📄 src/app/models/tracker/ExampleComponent.tsx

1. **Line 6**: `@/app/components/features/support/NofiticationsSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/features/support/NofiticationsSlice` → `@/app/server/security/SSL`

2. **Line 7**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

3. **Line 11**: `@/data/FolderData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/data/FolderData` → `@/app/models/data/Data`

4. **Line 12**: `@/Tracker`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Tracker` → `@/app/components/models/tasks/GetTracker`

5. **Line 12**: `@/Tracker`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Tracker` → `@/app/components/models/tasks/GetTracker`

---

#### 📄 src/app/pages/AccessDenied.tsx

1. **Line 4**: `@/app/hooks/useAccessControl`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/pages/Paging.ts

1. **Line 2**: `@/app/components/prompts/PromptPage`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/prompts/PromptPage` → `@/app/page`

---

#### 📄 src/app/pages/YourApp.tsx

1. **Line 6**: `@/forms/UserFormComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/forms/UserFormComponent` → `@/app/libraries/ui/components/Component`

---

#### 📄 src/app/pages/blog/BlogManager.tsx

1. **Line 2**: `@/AIoSBlogPosts`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/AIoSBlogPosts` → `@/app/pages/blog/AIoSBlogPosts`

2. **Line 7**: `@/NewBlogPostForm`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/NewBlogPostForm` → `@/app/pages/blog/Blog`

3. **Line 8**: `@/NotificationDisplay`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/NotificationDisplay` → `@/app/components/notifications/Notification`

---

#### 📄 src/app/pages/blog/BlogOverview.tsx

1. **Line 6**: `@/app/pages/blog/BlogOverview.css`
   - **Reason:** Dynamic ESM import failure
   - **Suggested fix:** `@/app/pages/blog/BlogOverview.css` → `@/app/pages/blog/Blog`

---

#### 📄 src/app/pages/blog/CalendarUtils.ts

1. **Line 3**: `@/app/state/stores/CalendarEvent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/stores/CalendarEvent` → `@/app/actions/CalendarEventActions`

---

#### 📄 src/app/pages/community/CollaborationData.ts

1. **Line 2**: `@/app/components/calendar/CalendarSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/calendar/CalendarSlice` → `@/app/components/calendar/Calendar`

2. **Line 5**: `@/app/components/interfaces/options/CollaborationOptions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/interfaces/options/CollaborationOptions` → `@/app/interfaces/options/CollaborationOptions`

3. **Line 7**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

---

#### 📄 src/app/pages/community/CollaborationPage.tsx

1. **Line 2**: `@/app/components/documents/editing/triggerAutosave`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/documents/editing/triggerAutosave` → `@/app/documents/editing/autosave`

2. **Line 6**: `@/app/state/stores/CalendarEvent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/stores/CalendarEvent` → `@/app/actions/CalendarEventActions`

---

#### 📄 src/app/pages/community/CommunityProjectsPage.tsx

1. **Line 3**: `@/app/components/models/CommunityData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/CommunityData` → `@/app/components/community/Community`

2. **Line 4**: `@/app/components/models/teams/Team`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/teams/Team` → `@/app/actions/TeamActions`

---

#### 📄 src/app/pages/community/configureCollaborationPreferences.ts

1. **Line 3**: `@/app/components/interfaces/settings/CollaborationPreferences`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/interfaces/settings/CollaborationPreferences` → `@/app/interfaces/settings/CollaborationPreferences`

---

#### 📄 src/app/pages/content/CaptionManagementPage.js

1. **Line 4**: `@/app/components/api/api/captionApi`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/pages/content/ContentCreationPage.tsx

1. **Line 3**: `@/app/components/models/content/AddContent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/content/AddContent` → `@/app/models/content/AddContent`

---

#### 📄 src/app/pages/content/MultimediaContentCustomization.tsx

1. **Line 2**: `@/app/components/libraries/ui/ContentHelpers`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/ContentHelpers` → `@/app/libraries/ui/ContentHelpers`

2. **Line 2**: `@/app/components/libraries/ui/ContentHelpers`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/ContentHelpers` → `@/app/libraries/ui/ContentHelpers`

3. **Line 2**: `@/app/components/libraries/ui/ContentHelpers`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/ContentHelpers` → `@/app/libraries/ui/ContentHelpers`

4. **Line 9**: `@/app/components/todos/Todo`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/todos/Todo` → `@/app/actions/TodoActions`

5. **Line 10**: `@/app/components/web3/dAppAdapter/AdapterContent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/web3/dAppAdapter/AdapterContent` → `@/utils/web3/dAppAdapter/AdapterContent`

6. **Line 18**: `@/app/models/content/ContentDetailsListItem`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/content/ContentDetailsListItem` → `@/app/components/lists/DetailsList`

7. **Line 24**: `./DeviceDimensions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DeviceDimensions` → `@/app/models/display/DeviceDimensions`

---

#### 📄 src/app/pages/course/CourseDevelopmentPage.tsx

1. **Line 2**: `@/app/components/auth/AuthContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/auth/AuthContext` → `@/app/state/context/AuthContext`

2. **Line 2**: `@/app/components/auth/AuthContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/auth/AuthContext` → `@/app/state/context/AuthContext`

---

#### 📄 src/app/pages/course/CourseDevelopmentPhaseManager.tsx

1. **Line 5**: `@/app/pages/CourseLearningPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/pages/CourseLearningPhase` → `@/app/models/phases/Phase`

2. **Line 6**: `@/app/pages/CoursePlanningPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/pages/CoursePlanningPhase` → `@/app/models/phases/Phase`

3. **Line 7**: `@/app/pages/CourseSetupPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/pages/CourseSetupPhase` → `@/app/models/phases/Phase`

---

#### 📄 src/app/pages/course/CourseLearningPhase.tsx

1. **Line 5**: `@/CourseDevelopmentPhaseManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CourseDevelopmentPhaseManager` → `@/app/components/phases/CourseDevelopmentPhase`

---

#### 📄 src/app/pages/course/CoursePlanningPhase.tsx

1. **Line 3**: `@/CourseDevelopmentPage`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CourseDevelopmentPage` → `@/app/page`

---

#### 📄 src/app/pages/course/EducationalVideoMetadata.ts

1. **Line 3**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

---

#### 📄 src/app/pages/culture/music/MusicPage.tsx

1. **Line 4**: `@/app/components/users/artist/MusicSection`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/artist/MusicSection` → `@/app/documents/Section`

---

#### 📄 src/app/pages/dashboards/AdapterDashboard.tsx

1. **Line 12**: `@/app/components/web3/dAppAdapter/AdapterContent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/web3/dAppAdapter/AdapterContent` → `@/utils/web3/dAppAdapter/AdapterContent`

2. **Line 17**: `@/app/layouts/CommonLayout`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/layouts/CommonLayout` → `@/app/layout`

3. **Line 22**: `@/dashboards/DashboardLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/dashboards/DashboardLoader` → `@/app/pages/dashboards/DashboardLoader`

---

#### 📄 src/app/pages/dashboards/BugComments.tsx

1. **Line 2**: `@/app/components/models/data/Comments`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/Comments` → `@/app/config/endpoints/commentsConfig`

2. **Line 2**: `@/app/components/models/data/Comments`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/Comments` → `@/app/config/endpoints/commentsConfig`

3. **Line 2**: `@/app/components/models/data/Comments`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/Comments` → `@/app/config/endpoints/commentsConfig`

---

#### 📄 src/app/pages/dashboards/BugTrackingDashboard.tsx

1. **Line 3**: `@/app/components/api/api`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/api/api` → `@/app/actions/ApiActions`

2. **Line 8**: `@/BugFilter`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/BugFilter` → `@/app/pages/dashboards/BugFilter`

3. **Line 9**: `@/BugSort`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/BugSort` → `@/app/pages/dashboards/BugSort`

4. **Line 10**: `@/BugTable`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/BugTable` → `@/app/pages/dashboards/BugTable`

---

#### 📄 src/app/pages/dashboards/ChatDashboard.tsx

1. **Line 6**: `@/app/models/teams/Team`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/teams/Team` → `@/app/actions/TeamActions`

---

#### 📄 src/app/pages/dashboards/ClientDesignDashboard.tsx

1. **Line 14**: `@/app/personas/recruiter_dashboard/PersonaBuilderDashboard`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/personas/recruiter_dashboard/PersonaBuilderDashboard` → `@/app/pages/personas/Persona`

2. **Line 16**: `@/app/todos/lists/TodoList`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/todos/lists/TodoList` → `@/app/components/lists/TodoList`

---

#### 📄 src/app/pages/dashboards/DashboardManager.ts

1. **Line 4**: `./DashboardComponents`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DashboardComponents` → `@/app/dashboards/DashboardComponent`

2. **Line 4**: `./DashboardComponents`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DashboardComponents` → `@/app/dashboards/DashboardComponent`

3. **Line 4**: `./DashboardComponents`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DashboardComponents` → `@/app/dashboards/DashboardComponent`

4. **Line 5**: `./AppTreeExplorer`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./AppTreeExplorer` → `@/app/services/AppTreeExplorer`

---

#### 📄 src/app/pages/dashboards/DesignDashboard.tsx

1. **Line 12**: `@/configs/appStructure/FrontendStructureComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/configs/appStructure/FrontendStructureComponent` → `@/app/config/appStructure/FrontendStructure`

---

#### 📄 src/app/pages/dashboards/EnhancedTreeView.tsx

1. **Line 6**: `./FileTreeService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./FileTreeService` → `@/app/documents/File`

2. **Line 6**: `./FileTreeService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./FileTreeService` → `@/app/documents/File`

---

#### 📄 src/app/pages/dashboards/FileStructureViewer.tsx

1. **Line 4**: `@/app/hooks/useAccessControl`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

2. **Line 5**: `@/app/components/AccessDenied`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/AccessDenied` → `@/app/pages/AccessDenied`

---

#### 📄 src/app/pages/dashboards/ProjectDashboard.tsx

1. **Line 4**: `./FrontendStructureViewer`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./FrontendStructureViewer` → `@/app/components/development/FrontendStructureViewer`

2. **Line 5**: `./AccessGuard`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/pages/dashboards/RealTimeDashboardPage.tsx

1. **Line 3**: `@/app/components/libraries/toolbar/Sidebar`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/toolbar/Sidebar` → `@/app/api/ChatSidebarProvider`

2. **Line 10**: `./RealTimeChart`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./RealTimeChart` → `@/app/components/models/realtime/RealTimeChart`

---

#### 📄 src/app/pages/dashboards/RecruiterSeekerDashboard.tsx

1. **Line 2**: `@/app/components/auth/AuthContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/auth/AuthContext` → `@/app/state/context/AuthContext`

---

#### 📄 src/app/pages/dashboards/SearchableVisualFlowDashboard.tsx

1. **Line 3**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

2. **Line 5**: `@/TreeView`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/TreeView` → `@/app/pages/dashboards/EnhancedTreeView`

3. **Line 6**: `@/VisualFlowDashboard`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/VisualFlowDashboard` → `@/app/pages/dashboards/SearchableVisualFlowDashboard`

---

#### 📄 src/app/pages/dashboards/ServerDesignDashboard.tsx

1. **Line 22**: `@/app/components/backend/BackendStructureWrapper`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/backend/BackendStructureWrapper` → `@/app/config/appStructure/BackendStructureWrapper`

2. **Line 23**: `@/app/store/slices/apiConfigSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/store/slices/apiConfigSlice` → `@/app/api/config`

3. **Line 24**: `@/app/utils/pathUtils`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/pages/dashboards/UserDashboard.tsx

1. **Line 2**: `@/app/projects/projectManagement/ProjectTimelineDashboard`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/projects/projectManagement/ProjectTimelineDashboard` → `@/app/dashboards/ProjectTimelineDashboard`

---

#### 📄 src/app/pages/development/AndroidSpecificContent.tsx

1. **Line 4**: `@/app/components/models/content/AddContent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/content/AddContent` → `@/app/models/content/AddContent`

---

#### 📄 src/app/pages/development/AppDevelopmentProcess.tsx

1. **Line 2**: `@/blog/AIoSBlogPosts`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/blog/AIoSBlogPosts` → `@/app/pages/blog/AIoSBlogPosts`

2. **Line 2**: `@/blog/AIoSBlogPosts`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/blog/AIoSBlogPosts` → `@/app/pages/blog/AIoSBlogPosts`

---

#### 📄 src/app/pages/development/EmailConfirmationPhase.tsx

1. **Line 5**: `./DevelopmentPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DevelopmentPhase` → `@/app/components/phases/AppDevelopmentPhase`

---

#### 📄 src/app/pages/development/EmailConfirmationPhaseComponent.tsx

1. **Line 3**: `@/app/components/libraries/ui/useUIStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/useUIStore` → `@/app/libraries/ui/useUIStore`

2. **Line 5**: `@/api/ApiData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/api/ApiData` → `@/app/api/ApiData`

---

#### 📄 src/app/pages/development/PlanningPhase.tsx

1. **Line 3**: `./DevelopmentPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DevelopmentPhase` → `@/app/components/phases/AppDevelopmentPhase`

---

#### 📄 src/app/pages/forms/DynamicForm.tsx

1. **Line 7**: `@/app/onboarding/OnboardingPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/onboarding/OnboardingPhase` → `@/app/hooks/dynamicHooks/dynamicOnboardingPhaseHook`

---

#### 📄 src/app/pages/forms/FeedbackForm.tsx

1. **Line 2**: `@/app/components/support/Feedback`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/support/Feedback` → `@/app/actions/UserSupportFeedbackActions`

---

#### 📄 src/app/pages/forms/FormControl.tsx

1. **Line 3**: `@/app/libraries/logging/Logger`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/libraries/logging/Logger` → `@/app/config/LoggerConfig`

---

#### 📄 src/app/pages/forms/FormDocumentMiddleware.tsx

1. **Line 6**: `@/DynamicForm`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/DynamicForm` → `@/app/config/DynamicFormConfig`

---

#### 📄 src/app/pages/forms/FormUI.tsx

1. **Line 3**: `@/app/components/libraries/ui/components/CreateComponentForm`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/components/CreateComponentForm` → `@/app/libraries/ui/components/Component`

2. **Line 4**: `@/app/components/libraries/ui/components/ComponentActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/components/ComponentActions` → `@/app/actions/ComponentActions`

---

#### 📄 src/app/pages/forms/PreviewForm.tsx

1. **Line 7**: `@/app/pages/forms/PreviewForm.css`
   - **Reason:** Dynamic ESM import failure
   - **Suggested fix:** `@/app/pages/forms/PreviewForm.css` → `@/app/pages/forms/PreviewForm`

---

#### 📄 src/app/pages/forms/ProjectCreationForm.tsx

1. **Line 2**: `@/app/components/auth/AuthContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/auth/AuthContext` → `@/app/state/context/AuthContext`

2. **Line 5**: `@/projects/Project`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/projects/Project` → `@/app/actions/ProjectActions`

3. **Line 5**: `@/projects/Project`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/projects/Project` → `@/app/actions/ProjectActions`

---

#### 📄 src/app/pages/forms/formBuilder/FormBuilder.tsx

1. **Line 4**: `@/FormInput`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/FormInput` → `@/app/pages/forms/FormInputComponent`

---

#### 📄 src/app/pages/forms/formBuilder/FormInput.tsx

1. **Line 5**: `@/app/components/crypto/SanitizationFunctions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/crypto/SanitizationFunctions` → `@/app/models/cypto/SanitizationFunctions`

---

#### 📄 src/app/pages/layouts/AnimatedDashboard.tsx

1. **Line 2**: `@/app/components/DynamicIntroTooltip`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/DynamicIntroTooltip` → `@/app/DynamicIntroTooltip`

2. **Line 5**: `@/app/components/cards/animation/SwingCard`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/cards/animation/SwingCard` → `@/app/cards/animation/SwingCard`

3. **Line 15**: `@/app/components/todos/TodoList`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/todos/TodoList` → `@/app/components/lists/TodoList`

4. **Line 28**: `@/app/ponents/styling/ResponsiveDesign`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ponents/styling/ResponsiveDesign` → `@/app/components/styling/ResponsiveDesign`

---

#### 📄 src/app/pages/layouts/DashboardLayout.tsx

1. **Line 3**: `@/CommonLayout`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/CommonLayout` → `@/app/layout`

2. **Line 4**: `@/app/components/dashboards/DashboardLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/dashboards/DashboardLoader` → `@/app/pages/dashboards/DashboardLoader`

3. **Line 6**: `@/app/components/libraries/toolbar/CryptoSectionToolbar`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/toolbar/CryptoSectionToolbar` → `@/app/components/crypto/CryptoSectionToolbar`

---

#### 📄 src/app/pages/layouts/LayoutEditor.tsx

1. **Line 3**: `@/app/components/libraries/ui/DraggableDiv`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/DraggableDiv` → `@/app/libraries/ui/DraggableDiv`

---

#### 📄 src/app/pages/layouts/usePhaseWithLoad.ts

1. **Line 2**: `@/usePhaseMeta`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/usePhaseMeta` → `@/app/config/metadata/usePhaseMeta`

2. **Line 3**: `@/waitForLoad`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/waitForLoad` → `@/app/pages/layouts/waitForLoad`

---

#### 📄 src/app/pages/logs/LoggingPage.tsx

1. **Line 2**: `@/app/components/cards/CardFrame`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/cards/CardFrame` → `@/app/cards/CardFrame`

2. **Line 3**: `@/app/components/libraries/ui/buttons/ReusableButton`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/buttons/ReusableButton` → `@/app/libraries/ui/buttons/ReusableButton`

3. **Line 30**: `@/app/components/models/data/fetchExchangeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/fetchExchangeData` → `@/app/models/cypto/Exchange`

4. **Line 31**: `@/app/components/projects/projectManagement/ProjectManagementSimulator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/projects/projectManagement/ProjectManagementSimulator` → `@/app/dataIntegration/projectIntegration/projectManagement`

5. **Line 33**: `@/app/typings/dataAnalysisTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/dataAnalysisTypes` → `@/app/libraries/cache/client/types`

---

#### 📄 src/app/pages/onboarding/FeatureImplementationSubPhase.tsx

1. **Line 3**: `@/OnboardingPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/OnboardingPhase` → `@/app/hooks/dynamicHooks/dynamicOnboardingPhaseHook`

---

#### 📄 src/app/pages/onboarding/InitialSetupSubPhase.tsx

1. **Line 2**: `@/app/components/auth/AuthContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/auth/AuthContext` → `@/app/state/context/AuthContext`

2. **Line 3**: `@/app/components/crypto/SanitizationFunctions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/crypto/SanitizationFunctions` → `@/app/models/cypto/SanitizationFunctions`

3. **Line 3**: `@/app/components/crypto/SanitizationFunctions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/crypto/SanitizationFunctions` → `@/app/models/cypto/SanitizationFunctions`

4. **Line 5**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

5. **Line 8**: `@/forms/DynamicForm`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/forms/DynamicForm` → `@/app/config/DynamicFormConfig`

6. **Line 9**: `@/OnboardingPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/OnboardingPhase` → `@/app/hooks/dynamicHooks/dynamicOnboardingPhaseHook`

---

#### 📄 src/app/pages/onboarding/OnboardingManager.tsx

1. **Line 4**: `@/OnboardingPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/OnboardingPhase` → `@/app/hooks/dynamicHooks/dynamicOnboardingPhaseHook`

2. **Line 5**: `@/RegistrationPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RegistrationPhase` → `@/app/models/phases/Phase`

3. **Line 6**: `@/WelcomePage`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/WelcomePage` → `@/app/page`

---

#### 📄 src/app/pages/onboarding/OnboardingScreen.tsx

1. **Line 3**: `@/UserJourneyManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/UserJourneyManager` → `@/app/pages/onboarding/onboardingTests/UserJourneyManager.test`

---

#### 📄 src/app/pages/onboarding/PlanningSubPhase.tsx

1. **Line 3**: `@/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types` → `@/app/actions/AppActionTypes`

2. **Line 3**: `@/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types` → `@/app/actions/AppActionTypes`

---

#### 📄 src/app/pages/onboarding/Registration.tsx

1. **Line 3**: `@/RegistrationPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RegistrationPhase` → `@/app/models/phases/Phase`

---

#### 📄 src/app/pages/onboarding/onboardingTests/UserJourneyManager.test.tsx

1. **Line 5**: `@/app/components/personas/UserJourneyManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/personas/UserJourneyManager` → `@/app/pages/onboarding/onboardingTests/UserJourneyManager.test`

---

#### 📄 src/app/pages/onboarding/onboardingTests/questionnaireLogic.test.ts

1. **Line 3**: `@/questionnaireLogic`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/questionnaireLogic` → `@/app/pages/onboarding/Question`

2. **Line 3**: `@/questionnaireLogic`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/questionnaireLogic` → `@/app/pages/onboarding/Question`

---

#### 📄 src/app/pages/personas/PersonaPage.tsx

1. **Line 5**: `@/PersonaData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/PersonaData` → `@/app/models/data/Data`

2. **Line 5**: `@/PersonaData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/PersonaData` → `@/app/models/data/Data`

3. **Line 6**: `@/PersonaBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/PersonaBuilder` → `@/app/pages/onboarding/PersonaBuilderData`

---

#### 📄 src/app/pages/personas/ProfessionalTraderCalls.tsx

1. **Line 9**: `@/app/components/trading/Trades`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/trading/Trades` → `@/app/components/phases/crypto/TradeStatistics`

---

#### 📄 src/app/pages/personas/ProfessionalTraderDocuments.tsx

1. **Line 2**: `@/app/components/documents/File`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/documents/File` → `@/app/actions/FileActions`

---

#### 📄 src/app/pages/personas/ProjectManagerPersona.tsx

1. **Line 3**: `@/app/components/models/teams/Team`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/teams/Team` → `@/app/actions/TeamActions`

---

#### 📄 src/app/pages/personas/ScenarioBuilder.tsx

1. **Line 129**: `@/app/components/UserJourney`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/UserJourney` → `@/app/api/clientUserJourney`

2. **Line 158**: `@/app/components/UserScenario`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/UserScenario` → `@/app/hooks/userScenarioCreation`

3. **Line 187**: `@/app/components/UserJourneyMap`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/UserJourneyMap` → `@/app/pages/personas/UserJourney`

4. **Line 216**: `@/app/components/NewsItem`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

5. **Line 254**: `@/app/components/NewsItem`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

6. **Line 303**: `@/app/components/UserScenarioMap`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/UserScenarioMap` → `@/app/users/User`

7. **Line 337**: `@/app/forms/ChartComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/forms/ChartComponent` → `@/app/components/charts/ChartComponent`

8. **Line 379**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

---

#### 📄 src/app/pages/personas/TestBuilder.tsx

1. **Line 3**: `./TestPhaseManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./TestPhaseManager` → `@/app/models/phases/Phase`

2. **Line 4**: `./TestScenarioBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./TestScenarioBuilder` → `@/app/pages/personas/ScenarioBuilder`

3. **Line 4**: `./TestScenarioBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./TestScenarioBuilder` → `@/app/pages/personas/ScenarioBuilder`

---

#### 📄 src/app/pages/personas/UserJourney.tsx

1. **Line 5**: `@/app/pages/onboarding/OnboardinPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/pages/onboarding/OnboardinPhase` → `@/app/models/phases/Phase`

---

#### 📄 src/app/pages/personas/UserQuestionnaire.tsx

1. **Line 2**: `@/onboarding/Question`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/onboarding/Question` → `@/app/hooks/baseQuestionnaireData`

2. **Line 3**: `@/onboarding/QuestionnairePage`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/onboarding/QuestionnairePage` → `@/app/page`

---

#### 📄 src/app/pages/personas/recruiterDashboard/PersonaBuilderDashboard.tsx

1. **Line 5**: `@/app/components/cards/DummyCardLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/cards/DummyCardLoader` → `@/app/cards/DummyCard`

2. **Line 6**: `@/app/components/cards/PersonaCard`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/cards/PersonaCard` → `@/app/cards/PersonaCard`

3. **Line 16**: `@/app/PersonaBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/PersonaBuilder` → `@/app/pages/onboarding/PersonaBuilderData`

4. **Line 16**: `@/app/PersonaBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/PersonaBuilder` → `@/app/pages/onboarding/PersonaBuilderData`

---

#### 📄 src/app/pages/personas/recruiterDashboard/PersonaPanel.tsx

1. **Line 2**: `@/app/components/cards/DummyCardLoader`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/cards/DummyCardLoader` → `@/app/cards/DummyCard`

2. **Line 3**: `@/PersonaBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/PersonaBuilder` → `@/app/pages/onboarding/PersonaBuilderData`

3. **Line 5**: `./PersonaData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./PersonaData` → `@/app/models/data/Data`

---

#### 📄 src/app/pages/projects/IdeaLifecycleComponent.tsx

1. **Line 2**: `@/app/components/phases/lifecycles`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/phases/lifecycles` → `@/app/hooks/phases/lifecycles`

---

#### 📄 src/app/pages/searches/EventFilterComponent.tsx

1. **Line 5**: `@/Filter`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Filter` → `@/app/actions/FilterActions`

2. **Line 7**: `@/app//eventActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app//eventActions` → `@/app/actions/CalendarEventActions`

---

#### 📄 src/app/pages/searches/FilterCriteria.ts

1. **Line 45**: `@/app/personas/ScenarioBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/personas/ScenarioBuilder` → `@/app/components/phases/ScenarioBuilderPhase`

---

#### 📄 src/app/pages/searches/FilterTasksRequest.tsx

1. **Line 6**: `@/Filter`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Filter` → `@/app/actions/FilterActions`

---

#### 📄 src/app/pages/searches/FilteredEvents.tsx

1. **Line 6**: `./FilterState`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./FilterState` → `@/app/pages/searches/Filter`

---

#### 📄 src/app/pages/searches/SearchCriteria.tsx

1. **Line 10**: `@/app/form/FormatEnum`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/form/FormatEnum` → `@/app/components/form/FormatEnum`

2. **Line 14**: `@/app/phases/ContentManagementPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/phases/ContentManagementPhase` → `@/app/components/phases/ContentManagementPhase`

3. **Line 15**: `@/app/phases/FeedbackPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/phases/FeedbackPhase` → `@/app/components/phases/FeedbackPhase`

4. **Line 16**: `@/app/phases/TaskProcess`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/phases/TaskProcess` → `@/app/components/models/tasks/Task`

5. **Line 17**: `@/app/phases/TenantManagementPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/phases/TenantManagementPhase` → `@/app/components/phases/TenantManagementPhase`

6. **Line 19**: `@/app/security/SecurityFeatureEnum`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/SecurityFeatureEnum` → `@/app/server/security/SecurityFeatureEnum`

7. **Line 30**: `@/app/security/SanitizationFunctions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/SanitizationFunctions` → `@/app/models/cypto/SanitizationFunctions`

8. **Line 36**: `@/app/documents/DocumentBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/documents/DocumentBuilder` → `@/app/components/documents/DocumentBuilderComponent`

---

#### 📄 src/app/pages/searches/SearchLibrary.tsx

1. **Line 7**: `@/app/libraries/logging/Logger`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/libraries/logging/Logger` → `@/app/config/LoggerConfig`

2. **Line 9**: `@/app/pages/searches/SearchContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/pages/searches/SearchContext` → `@/app/components/routing/Search`

---

#### 📄 src/app/payment/PaymentGateways.tsx

1. **Line 5**: `@/app/event/DynamicEventHandlerExample`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/event/DynamicEventHandlerExample` → `@/app/events/Event`

2. **Line 13**: `@/initCryptoPayments`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/initCryptoPayments` → `@/app/payment/Payments`

3. **Line 13**: `@/initCryptoPayments`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/initCryptoPayments` → `@/app/payment/Payments`

4. **Line 14**: `@/support/NotificationSettings`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/support/NotificationSettings` → `@/app/components/notifications/Notification`

5. **Line 15**: `@/users/UserRole`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/users/UserRole` → `@/app/actions/UserRoleActions`

---

#### 📄 src/app/payment/Payments.tsx

1. **Line 2**: `@/app/documents/screenFunctionality/ShortcutKeys`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/documents/screenFunctionality/ShortcutKeys` → `@/app/features/shortcuts/ShortcutKeys`

---

#### 📄 src/app/payment/initCryptoPayments.tsx

1. **Line 4**: `@/app/event/DynamicEventHandlerExample`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/event/DynamicEventHandlerExample` → `@/app/events/Event`

---

#### 📄 src/app/phases/VideoLifecyclePhase.ts

1. **Line 3**: `../Lifecycle`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../Lifecycle` → `@/app/api/IdeaLifecycleAPI`

---

#### 📄 src/app/phases/steps/ReviewSteps.tsx

1. **Line 5**: `@/app/trading/TradeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/trading/TradeData` → `@/app/components/trading/TradeData`

---

#### 📄 src/app/phases/steps/steps.tsx

1. **Line 5**: `@/app/components/trading/TradingPreferencesStep`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/trading/TradingPreferencesStep` → `@/app/components/phases/TradingPreferencesStep`

2. **Line 8**: `@/app/components/trading/TradingBasicInfoStep`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/trading/TradingBasicInfoStep` → `@/app/components/shared/steps/BasicInfoStep`

3. **Line 9**: `@/app/components/trading/TradingSummaryStep`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/trading/TradingSummaryStep` → `@/app/phases/steps/SummaryStep`

---

#### 📄 src/app/phases/steps/trading/TradingAssetsStep.tsx

1. **Line 3**: `@/app/components/users/BlockchainAsset`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/BlockchainAsset` → `@/app/typings/cryptoTypes/BlockchainAsset`

---

#### 📄 src/app/phases/steps/trading/TradingReviewStep.tsx

1. **Line 6**: `@/app/models/trading/TradeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/trading/TradeData` → `@/app/components/trading/TradeData`

---

#### 📄 src/app/phases/steps/trading/TradingSummaryStep.tsx

1. **Line 3**: `@/app/trading/TradeData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/trading/TradeData` → `@/app/components/trading/TradeData`

2. **Line 5**: `./steps`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./steps` → `@/app/phases/steps/ReviewSteps`

---

#### 📄 src/app/plugins/PluginManager.ts

1. **Line 6**: `@/app/components/dapp/DAppAdapter`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/dapp/DAppAdapter` → `@/utils/web3/crossPlatformLayer/platform/DAppAdapter`

---

#### 📄 src/app/projects/DataAnalysisPhase/AnalyzeData/AnalyzeData.tsx

1. **Line 4**: `@/app/components/todos/tasks/DataProcessingTask`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/todos/tasks/DataProcessingTask` → `@/app/components/models/tasks/Task`

2. **Line 5**: `@/app/components/todos/tasks/DataSetModel`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/todos/tasks/DataSetModel` → `@/app/models/data/Data`

3. **Line 6**: `@/app/components/typings/dataAnalysisTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/typings/dataAnalysisTypes` → `@/app/libraries/cache/client/types`

---

#### 📄 src/app/projects/DataAnalysisPhase/DataProcessing/processData.tsx

1. **Line 2**: `@/DataProcessingService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/DataProcessingService` → `@/app/api/service/DataProcessingService`

2. **Line 2**: `@/DataProcessingService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/DataProcessingService` → `@/app/api/service/DataProcessingService`

---

#### 📄 src/app/projects/PostLaunchActivitiesManager.tsx

1. **Line 3**: `@/phases/collaborationPhase/CollaborationSettingsPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/phases/collaborationPhase/CollaborationSettingsPhase` → `@/app/components/phases/collaborationPhase/CollaborationSettingsPhase`

2. **Line 5**: `@/RefactoringRebrandingPhase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RefactoringRebrandingPhase` → `@/app/components/phases/BrandingPhase`

---

#### 📄 src/app/projects/UpdateProjectDetails.tsx

1. **Line 3**: `@/Project`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Project` → `@/app/actions/ProjectActions`

2. **Line 3**: `@/Project`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Project` → `@/app/actions/ProjectActions`

---

#### 📄 src/app/projects/projectManagement/ProjectManagement.tsx

1. **Line 4**: `./ProjectCreationForm`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./ProjectCreationForm` → `@/app/models/projects/Project`

2. **Line 5**: `@/projects/Project`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/projects/Project` → `@/app/actions/ProjectActions`

---

#### 📄 src/app/projects/projectManagement/ProjectPhaseService.ts.ts

1. **Line 3**: `@/config/endpoints/EnvironmentAwareEndpointManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/endpoints/EnvironmentAwareEndpointManager` → `@/app/config/endpoints/EnvironmentAwareEndpointManager`

---

#### 📄 src/app/projects/projectManagement/ProjectTimeline.tsx

1. **Line 3**: `@/app/Project`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/Project` → `@/app/actions/ProjectActions`

---

#### 📄 src/app/projects/projectManagement/TeamProgress.tsx

1. **Line 2**: `@/TeamProgressBar`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/TeamProgressBar` → `@/app/components/models/tracker/ProgressBar`

---

#### 📄 src/app/projects/projectManagement/TeamProgressBar.tsx

1. **Line 4**: `@/app/components/models/teams/Team`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/teams/Team` → `@/app/actions/TeamActions`

---

#### 📄 src/app/prompts/DynamicPromptHookGenerator.tsx

1. **Line 4**: `@/intelligence/AutoGPTSpaCyIntegration`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/intelligence/AutoGPTSpaCyIntegration` → `@/app/components/documents/documentation/report/Integration`

---

#### 📄 src/app/prompts/PromptSystem.tsx

1. **Line 5**: `@/prompts/promptGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/prompts/promptGenerator` → `@/app/libraries/theme/PromptGeneratorService`

---

#### 📄 src/app/quality/reports/ImportStatistics..ts

1. **Line 2**: `@/generators/corrections/reports/ImportReport`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/generators/corrections/reports/ImportReport` → `@/app/documents/Report`

---

#### 📄 src/app/scripts/ApplicationSetupScript.ts

1. **Line 3**: `@/app/scripts/DependencyInstallationScript`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

2. **Line 4**: `@/app/scripts/DatabaseSetupScript`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/scripts/DatabaseSetupScript` → `@/app/actions/database`

3. **Line 5**: `@/app/scripts/ConfigurationGenerationScript`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/scripts/ConfigurationGenerationScript` → `@/app/api/config`

---

#### 📄 src/app/scripts/generate-commands-doc.ts

1. **Line 4**: `./src/app/generators/corrections/StructureValidator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./src/app/generators/corrections/StructureValidator` → `@/app/generators/corrections/StructureValidator`

---

#### 📄 src/app/server/GenerateComponent.tsx

1. **Line 14**: `@/app/components/documents/editing/DocumentBuilderComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/documents/editing/DocumentBuilderComponent` → `@/app/components/documents/DocumentBuilderComponent`

---

#### 📄 src/app/server/auth/AdminLogin.ts

1. **Line 4**: `@/app/server/AuthService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/server/AuthService` → `@/app/server/auth/AuthService`

---

#### 📄 src/app/server/auth/AppRouter.tsx

1. **Line 10**: `@/app/containers/LoginContainer`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/containers/LoginContainer` → `@/app/components/containers/LoginContainer`

2. **Line 16**: `@/app/pages/team/TeamManagementPage`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/pages/team/TeamManagementPage` → `@/app/components/teams/Team`

---

#### 📄 src/app/server/auth/AuthClientService.ts

1. **Line 3**: `@/app/server/AuthService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/server/AuthService` → `@/app/server/auth/AuthService`

---

#### 📄 src/app/server/auth/AuthComponent.tsx

1. **Line 6**: `@/dashboards/LoadDashboard`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/dashboards/LoadDashboard` → `@/app/dashboards/LoadDashboard`

---

#### 📄 src/app/server/auth/AuthService.ts

1. **Line 2**: `@/configs/JwtConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/configs/JwtConfig` → `@/app/api/config`

---

#### 📄 src/app/server/auth/login.ts

1. **Line 4**: `@/app/server/AuthServerService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/server/AuthServerService` → `@/app/server/auth/AuthServerService`

---

#### 📄 src/app/server/database/CalendarActionPayload.ts

1. **Line 3**: `@/app/components/state/stores/DetailsListStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/stores/DetailsListStore` → `@/app/components/lists/DetailsList`

---

#### 📄 src/app/server/database/Connection.ts

1. **Line 2**: `@/Client`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Client` → `@/app/actions/ClientActions`

---

#### 📄 src/app/server/database/CustomDataProvider.tsx

1. **Line 3**: `@/app/components/auth/AuthContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/auth/AuthContext` → `@/app/state/context/AuthContext`

---

#### 📄 src/app/server/database/DataBaseMethods.ts

1. **Line 4**: `@/DatabasePool`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/DatabasePool` → `@/app/actions/database`

---

#### 📄 src/app/server/database/storage/DataStoreComponent.tsx

1. **Line 2**: `@/app/components/models/data/Data`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/Data` → `@/app/actions/DataActions`

2. **Line 4**: `@/StorageManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/StorageManager` → `@/app/hooks/useStorageManager`

---

#### 📄 src/app/server/repository/UserRepo.ts

1. **Line 3**: `./db`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./db` → `@/app/actions/UserSupportFeedbackActions`

2. **Line 4**: `@/app/models/data/CacheData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/data/CacheData` → `@/app/models/data/Data`

---

#### 📄 src/app/server/repository/entityMapper.ts

1. **Line 5**: `@/app/typings/CacheData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/CacheData` → `@/app/models/data/Data`

---

#### 📄 src/app/server/repository/mappers.ts

1. **Line 5**: `@/app/models/CacheData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/CacheData` → `@/app/models/data/Data`

---

#### 📄 src/app/server/repository/secureMappers.ts

1. **Line 3**: `@/app/types/CacheData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/types/CacheData` → `@/app/models/data/Data`

2. **Line 5**: `@/app/typings/entities/Document`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/Document` → `@/app/api/ApiDocument`

---

#### 📄 src/app/server/repository/userMapper.ts

1. **Line 2**: `@/app/types/CacheData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/types/CacheData` → `@/app/models/data/Data`

---

#### 📄 src/app/server/route.ts

1. **Line 3**: `@/app/components/lib/cache/server/CacheManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/lib/cache/server/CacheManager` → `@/app/actions/AppCacheManagerActions`

2. **Line 3**: `@/app/components/lib/cache/server/CacheManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/lib/cache/server/CacheManager` → `@/app/actions/AppCacheManagerActions`

---

#### 📄 src/app/services/BackgroundService.ts

1. **Line 6**: `@/app/config/PersistenceConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/config/PersistenceConfig` → `@/app/api/config`

---

#### 📄 src/app/services/ConfigurationService.ts

1. **Line 4**: `./endpointConfigurations`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./endpointConfigurations` → `@/app/api/config`

---

#### 📄 src/app/services/CryptoIntegrationService.ts

1. **Line 3**: `@/config/endpoints/EnvironmentAwareEndpointManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/endpoints/EnvironmentAwareEndpointManager` → `@/app/config/endpoints/EnvironmentAwareEndpointManager`

2. **Line 5**: `@/app/api/PortfolioService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/PortfolioService` → `@/app/api/service/PortfolioService`

3. **Line 5**: `@/app/api/PortfolioService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/PortfolioService` → `@/app/api/service/PortfolioService`

4. **Line 6**: `@/app/api/PriceApiService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/PriceApiService` → `@/app/api/service/ApiService`

5. **Line 7**: `@/app/libraries/logging/TradeLogger`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/libraries/logging/TradeLogger` → `@/app/logging/Logger`

---

#### 📄 src/app/services/InitApp.ts

1. **Line 2**: `@/services/ConfigurationService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/services/ConfigurationService` → `@/app/api/config`

---

#### 📄 src/app/services/NotificationManagerService.ts

1. **Line 4**: `@/app/features/support/NotificationContainer`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/features/support/NotificationContainer` → `@/app/components/notifications/Notification`

---

#### 📄 src/app/services/dataAnalysisOrchestrator.ts

1. **Line 4**: `@/app/api/DataProcessingService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/DataProcessingService` → `@/app/api/service/DataProcessingService`

2. **Line 4**: `@/app/api/DataProcessingService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/DataProcessingService` → `@/app/api/service/DataProcessingService`

---

#### 📄 src/app/services/documentService.ts

1. **Line 6**: `./../configs/database/updateDocumentInDatabase`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./../configs/database/updateDocumentInDatabase` → `@/app/actions/database`

---

#### 📄 src/app/services/roadmapService.ts

1. **Line 5**: `@/types/roadmap`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types/roadmap` → `@/app/hooks/RoadmapScoringPlugin`

2. **Line 5**: `@/types/roadmap`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types/roadmap` → `@/app/hooks/RoadmapScoringPlugin`

3. **Line 5**: `@/types/roadmap`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types/roadmap` → `@/app/hooks/RoadmapScoringPlugin`

4. **Line 68**: `./analysisTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./analysisTypes` → `@/app/libraries/cache/client/types`

5. **Line 69**: `./roadmapTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./roadmapTypes` → `@/app/libraries/cache/client/types`

6. **Line 69**: `./roadmapTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./roadmapTypes` → `@/app/libraries/cache/client/types`

7. **Line 70**: `./roadmapGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./roadmapGenerator` → `@/app/typings/roadmap`

---

#### 📄 src/app/services/stakeholderRoadmap.ts

1. **Line 3**: `@/types/roadmap`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/types/roadmap` → `@/app/hooks/RoadmapScoringPlugin`

2. **Line 5**: `./analysisTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./analysisTypes` → `@/app/libraries/cache/client/types`

---

#### 📄 src/app/settings/CalendarSettings.ts

1. **Line 2**: `@/app/settings/NotificationChannels`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/settings/NotificationChannels` → `@/app/components/notifications/Notification`

---

#### 📄 src/app/shared/DynamicErrorBoundary.tsx

1. **Line 3**: `@/app//errorBoundaryProvider`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app//errorBoundaryProvider` → `@/app/components/Provider`

---

#### 📄 src/app/shared/SharedMetadata.ts

1. **Line 2**: `@/app/confg/MetadataStateManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/confg/MetadataStateManager` → `@/app/config/MetadataStateManager`

2. **Line 11**: `@/app/server/security/getPermission`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/server/security/getPermission` → `@/app/permissions/Permission`

---

#### 📄 src/app/shoppingCenter/Shop.tsx

1. **Line 3**: `@/app/ShoppingCenterConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ShoppingCenterConfig` → `@/app/api/config`

---

#### 📄 src/app/snapshots/RetrieveSnapshotData.tsx

1. **Line 3**: `@/configs/StructuredMetadata`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/configs/StructuredMetadata` → `@/app/config/StructuredMetadata`

2. **Line 4**: `@/app/utils/retrieveSnapshotData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/retrieveSnapshotData` → `@/app/models/data/Data`

---

#### 📄 src/app/snapshots/SnapshotContainerComponent.tsx

1. **Line 4**: `@/app/components/api/endpointConfigurations`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/api/endpointConfigurations` → `@/app/api/config`

---

#### 📄 src/app/snapshots/SnapshotOptions.tsx

1. **Line 3**: `@/app/confgs/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/confgs/BaseConfig` → `@/app/api/config`

2. **Line 3**: `@/app/confgs/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/confgs/BaseConfig` → `@/app/api/config`

3. **Line 3**: `@/app/confgs/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/confgs/BaseConfig` → `@/app/api/config`

---

#### 📄 src/app/snapshots/SnapshotStoreComponent.ts

1. **Line 3**: `@/app/hooks/SnapshotStoreOptions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/hooks/SnapshotStoreOptions` → `@/app/server/snapshots/createServerSnapshotStoreOptions`

---

#### 📄 src/app/snapshots/SnapshotStoreContainer.ts

1. **Line 17**: `@/createSnapshotOptions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/createSnapshotOptions` → `@/app/snapshots/Snapshot`

---

#### 📄 src/app/snapshots/SnapshotStoreMethods.ts

1. **Line 4**: `@/app/personas/ScenarioBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/personas/ScenarioBuilder` → `@/app/components/phases/ScenarioBuilderPhase`

---

#### 📄 src/app/snapshots/SnapshotStoreSubset.ts

1. **Line 18**: `./SnpapshotStore`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/snapshots/SnapshotType.ts

1. **Line 12**: `@/app/components/libraries/categories/generateCategoryProperties`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/categories/generateCategoryProperties` → `@/app/api/documents/generate`

2. **Line 13**: `@/app/ysis/frontend/buddease/src/app/components/models/data/Data`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ysis/frontend/buddease/src/app/components/models/data/Data` → `@/app/actions/DataActions`

3. **Line 14**: `@/app/ysis/frontend/buddease/src/app/utils/snapshotUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ysis/frontend/buddease/src/app/utils/snapshotUtils` → `@/app/snapshots/Snapshot`

4. **Line 14**: `@/app/ysis/frontend/buddease/src/app/utils/snapshotUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ysis/frontend/buddease/src/app/utils/snapshotUtils` → `@/app/snapshots/Snapshot`

5. **Line 14**: `@/app/ysis/frontend/buddease/src/app/utils/snapshotUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ysis/frontend/buddease/src/app/utils/snapshotUtils` → `@/app/snapshots/Snapshot`

6. **Line 15**: `@/app/ysis/frontend/buddease/src/app/components/utils/useSecureStoreId`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ysis/frontend/buddease/src/app/components/utils/useSecureStoreId` → `@/app/hooks/useSecureStoreId`

7. **Line 16**: `@/app/ysis/frontend/buddease/src/app/configs/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ysis/frontend/buddease/src/app/configs/BaseConfig` → `@/app/api/config`

8. **Line 16**: `@/app/ysis/frontend/buddease/src/app/configs/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ysis/frontend/buddease/src/app/configs/BaseConfig` → `@/app/api/config`

9. **Line 16**: `@/app/ysis/frontend/buddease/src/app/configs/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ysis/frontend/buddease/src/app/configs/BaseConfig` → `@/app/api/config`

---

#### 📄 src/app/snapshots/SnapshotWithCriteria.ts

1. **Line 42**: `@/app/routing/Fields`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/routing/Fields` → `@/app/components/routing/Fields`

---

#### 📄 src/app/snapshots/addToSnapshotList.tsx

1. **Line 3**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

2. **Line 3**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

3. **Line 3**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

4. **Line 3**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

5. **Line 10**: `./SnapshotActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./SnapshotActions` → `@/app/actions/SnapshotActions`

6. **Line 14**: `@/app/users/Subscriber`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/users/Subscriber` → `@/app/api/subscriberApi`

---

#### 📄 src/app/snapshots/convertSnapshotContainer.ts

1. **Line 5**: `@/app/snapshots/SnapshotContainerType`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/snapshots/SnapshotContainerType` → `@/app/snapshots/Snapshot`

---

#### 📄 src/app/snapshots/convertSnapshotToItem.ts

1. **Line 6**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

2. **Line 6**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

3. **Line 6**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

4. **Line 6**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

---

#### 📄 src/app/snapshots/convertSnapshotsArray.ts

1. **Line 4**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

2. **Line 4**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

3. **Line 4**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

4. **Line 4**: `@/config/BaseConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/BaseConfig` → `@/app/api/config`

---

#### 📄 src/app/snapshots/createSnapshot.ts

1. **Line 20**: `@/app/subscribe/subscribeToSnapshotsImplementation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/subscribe/subscribeToSnapshotsImplementation` → `@/app/snapshots/Snapshot`

---

#### 📄 src/app/snapshots/createSnapshotOptions.ts

1. **Line 5**: `@/app/documents/SharedIdentifiers`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/documents/SharedIdentifiers` → `@/app/components/shared/Share`

2. **Line 21**: `@/users/Subscriber`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/users/Subscriber` → `@/app/api/subscriberApi`

---

#### 📄 src/app/snapshots/createSnapshots.ts

1. **Line 11**: `@/app/database/Payload`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/database/Payload` → `@/app/components/models/tasks/ExportTasksPayload`

2. **Line 19**: `@/methods/subscriptionMethods`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/methods/subscriptionMethods` → `@/app/snapshots/methods/subscriptionMethods`

---

#### 📄 src/app/snapshots/createStoreConfig.tsx

1. **Line 19**: `@/convertMetadata`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/convertMetadata` → `@/app/models/data/Data`

---

#### 📄 src/app/snapshots/defaultSnapshotSubscribeFunctions.ts

1. **Line 7**: `./subscribeToSnapshotsImplementation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./subscribeToSnapshotsImplementation` → `@/app/snapshots/Snapshot`

---

#### 📄 src/app/snapshots/isCompatibleTempData.ts

1. **Line 3**: `@/app/components/models/data/TempData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/TempData` → `@/app/models/data/Data`

2. **Line 21**: `./subscribeToSnapshotsImplementation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./subscribeToSnapshotsImplementation` → `@/app/snapshots/Snapshot`

---

#### 📄 src/app/snapshots/methods/containerMethods.ts

1. **Line 3**: `@/app/components/libraries/categories/generateCategoryProperties`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/categories/generateCategoryProperties` → `@/app/api/documents/generate`

2. **Line 6**: `@/app/snapshotstore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/snapshotstore` → `@/app/documents/DocumentSnapshotStore`

---

#### 📄 src/app/snapshots/methods/subscriptionMethods.ts

1. **Line 12**: `@/app/typings/eventTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/eventTypes` → `@/app/events/Event`

2. **Line 13**: `@/app/users/Subscriber`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/users/Subscriber` → `@/app/api/subscriberApi`

---

#### 📄 src/app/snapshots/methods/validationMethods.ts

1. **Line 2**: `@/app/components/libraries/categories/generateCategoryProperties`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/categories/generateCategoryProperties` → `@/app/api/documents/generate`

2. **Line 5**: `@/app/snapshot/Snapshot`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/snapshot/Snapshot` → `@/app/actions/SnapshotActions`

3. **Line 7**: `@/app/snapshotstore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/snapshotstore` → `@/app/documents/DocumentSnapshotStore`

4. **Line 8**: `@/app/snapshotstoreOptions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/snapshotstoreOptions` → `@/app/server/snapshots/createServerSnapshotStoreOptions`

---

#### 📄 src/app/snapshots/safeCastSnapshotStore.ts

1. **Line 11**: `@/app/typings/eventTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/eventTypes` → `@/app/events/Event`

2. **Line 12**: `@/config/s/StructuredMetadata`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/s/StructuredMetadata` → `@/app/config/StructuredMetadata`

---

#### 📄 src/app/snapshots/snapshotCreation.ts

1. **Line 3**: `@/app/components/libraries/categories/generateCategoryProperties`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/categories/generateCategoryProperties` → `@/app/api/documents/generate`

2. **Line 4**: `@/app/components/models/content/AddContent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/content/AddContent` → `@/app/models/content/AddContent`

3. **Line 15**: `@/snaphots/Snapshot`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/snaphots/Snapshot` → `@/app/actions/SnapshotActions`

---

#### 📄 src/app/snapshots/snapshotDelegate.ts

1. **Line 5**: `@/app/components/libraries/categories/generateCategoryProperties`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/categories/generateCategoryProperties` → `@/app/api/documents/generate`

2. **Line 23**: `@/app/utils/dataTypeGuards`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/dataTypeGuards` → `@/app/models/data/Data`

---

#### 📄 src/app/snapshots/snapshotStorageOptionsInstance.ts

1. **Line 8**: `@/app/typings/entities/SnapshotStorageEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/SnapshotStorageEntity` → `@/app/snapshots/Snapshot`

2. **Line 8**: `@/app/typings/entities/SnapshotStorageEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/SnapshotStorageEntity` → `@/app/snapshots/Snapshot`

3. **Line 8**: `@/app/typings/entities/SnapshotStorageEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/SnapshotStorageEntity` → `@/app/snapshots/Snapshot`

4. **Line 8**: `@/app/typings/entities/SnapshotStorageEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/SnapshotStorageEntity` → `@/app/snapshots/Snapshot`

5. **Line 8**: `@/app/typings/entities/SnapshotStorageEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/SnapshotStorageEntity` → `@/app/snapshots/Snapshot`

6. **Line 8**: `@/app/typings/entities/SnapshotStorageEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entities/SnapshotStorageEntity` → `@/app/snapshots/Snapshot`

---

#### 📄 src/app/snapshots/transformDataToSnapshot.ts

1. **Line 11**: `@/app/typings/eventTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/eventTypes` → `@/app/events/Event`

---

#### 📄 src/app/snapshots/transformSnapshotsToStores.tsx

1. **Line 2**: `@/app/crypto/exchangeIntegration`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/crypto/exchangeIntegration` → `@/app/api/exchangeIntegrationServer`

---

#### 📄 src/app/snapshots/updateSubscribersAndSnapshots.ts

1. **Line 5**: `@/app//personas/ScenarioBuilder`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app//personas/ScenarioBuilder` → `@/app/components/phases/ScenarioBuilderPhase`

2. **Line 6**: `@/app/users/Subscriber`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/users/Subscriber` → `@/app/api/subscriberApi`

3. **Line 14**: `@/app/utils/trading/TradingUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/trading/TradingUtils` → `@/utils/trading/TradingUtils`

4. **Line 14**: `@/app/utils/trading/TradingUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/trading/TradingUtils` → `@/utils/trading/TradingUtils`

5. **Line 14**: `@/app/utils/trading/TradingUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/trading/TradingUtils` → `@/utils/trading/TradingUtils`

6. **Line 15**: `@/app/users/ApiUser`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/users/ApiUser` → `@/app/api/ApiUser`

7. **Line 16**: `@/app/utils/web3/applicationUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/web3/applicationUtils` → `@/utils/web3/applicationUtils`

---

#### 📄 src/app/socialMedia/InstagramIntegration.ts

1. **Line 4**: `@/app/auth/authToken`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/auth/authToken` → `@/app/hooks/useAuthToken`

---

#### 📄 src/app/state/context/AppContext.tsx

1. **Line 6**: `@/app/state/stores/TaskStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/stores/TaskStore` → `@/app/components/models/tasks/Task`

---

#### 📄 src/app/state/context/AppContextBridge.ts

1. **Line 3**: `./AppStoresContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./AppStoresContext` → `@/app/state/stores/AppStore`

---

#### 📄 src/app/state/context/ContentContext.tsx

1. **Line 2**: `@/api/ApiContent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/api/ApiContent` → `@/app/api/ApiContent`

2. **Line 3**: `@/api/endpointConfigurations`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/api/endpointConfigurations` → `@/app/api/config`

---

#### 📄 src/app/state/context/DatabaseContext.ts

1. **Line 5**: `@/app/database/DatabaseClient`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/database/DatabaseClient` → `@/app/actions/database`

---

#### 📄 src/app/state/context/DynamicPromptContext.tsx

1. **Line 4**: `./DynamicPromptHookGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./DynamicPromptHookGenerator` → `@/app/prompts/DynamicPromptHookGenerator`

---

#### 📄 src/app/state/context/UIContext.tsx

1. **Line 4**: `@/app/components/models/display/ShowToast`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/display/ShowToast` → `@/app/models/display/ShowToast`

---

#### 📄 src/app/state/mobx/reactions.tsx

1. **Line 3**: `@/app/components/todos/Todo`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/todos/Todo` → `@/app/actions/TodoActions`

2. **Line 4**: `@/stores/TaskStore `
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/stores/TaskStore ` → `@/app/components/models/tasks/Task`

3. **Line 5**: `@/stores/TodoStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/stores/TodoStore` → `@/app/state/stores/TodoStore`

---

#### 📄 src/app/state/redux/ReducerGenerator.tsx

1. **Line 4**: `@/app/typings/entites/CollaboratorEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/entites/CollaboratorEntity` → `@/app/collaborators/Collaborator`

---

#### 📄 src/app/state/redux/RootSagas.ts

1. **Line 9**: `@/app/state/redux/sagas/calendarSagas`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/redux/sagas/calendarSagas` → `@/app/components/calendar/Calendar`

2. **Line 13**: `@/app/state/redux/sagas/detailsSaga`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/redux/sagas/detailsSaga` → `@/app/components/models/data/Details`

3. **Line 20**: `@/app/state/redux/sagas/teamSagas`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/redux/sagas/teamSagas` → `@/app/components/teams/Team`

4. **Line 21**: `@/app/state/redux/sagas/tenantSags`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/state/redux/actions/DetailsListActions.ts

1. **Line 4**: `@/app/components/stores/DetailsListStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/stores/DetailsListStore` → `@/app/components/lists/DetailsList`

---

#### 📄 src/app/state/redux/actions/MarkerActions.ts

1. **Line 3**: `@/app/components/models/data/Marker`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/Marker` → `@/app/api/ApiMarker`

---

#### 📄 src/app/state/redux/sagas/ThemeSettingsSagas.ts

1. **Line 4**: `@/app/components/libraries/ui/theme/Theme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/theme/Theme` → `@/app/actions/ThemeActions`

2. **Line 5**: `@/app/components/security/ValidationActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/security/ValidationActions` → `@/app/actions/ValidationActions`

3. **Line 5**: `@/app/components/security/ValidationActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/security/ValidationActions` → `@/app/actions/ValidationActions`

4. **Line 5**: `@/app/components/security/ValidationActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/security/ValidationActions` → `@/app/actions/ValidationActions`

5. **Line 6**: `@/app/components/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

---

#### 📄 src/app/state/redux/sagas/UndoRedoSaga.ts

1. **Line 3**: `@/app/components/models/display/ShowToast`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/display/ShowToast` → `@/app/models/display/ShowToast`

2. **Line 3**: `@/app/components/models/display/ShowToast`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/display/ShowToast` → `@/app/models/display/ShowToast`

3. **Line 4**: `@/app/slices/UndoRedoSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/slices/UndoRedoSlice` → `@/app/state/redux/slices/UndoRedoSlice`

4. **Line 4**: `@/app/slices/UndoRedoSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/slices/UndoRedoSlice` → `@/app/state/redux/slices/UndoRedoSlice`

5. **Line 4**: `@/app/slices/UndoRedoSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/slices/UndoRedoSlice` → `@/app/state/redux/slices/UndoRedoSlice`

6. **Line 11**: `@/app/components/auth/authToken`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/auth/authToken` → `@/app/hooks/useAuthToken`

7. **Line 16**: `@/app/slices/RootSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/slices/RootSlice` → `@/app/state/redux/slices/RootSlice`

---

#### 📄 src/app/state/redux/sagas/apiSagas.ts

1. **Line 3**: `@/app/api/ApiConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/ApiConfig` → `@/app/api/ApiConfigManager`

2. **Line 3**: `@/app/api/ApiConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/ApiConfig` → `@/app/api/ApiConfigManager`

3. **Line 4**: `@/app/api/ApiConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/ApiConfig` → `@/app/api/ApiConfigManager`

---

#### 📄 src/app/state/redux/sagas/authorizationSagas.ts

1. **Line 5**: `./authorizationApi`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

2. **Line 5**: `./authorizationApi`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

3. **Line 5**: `./authorizationApi`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

4. **Line 5**: `./authorizationApi`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

5. **Line 5**: `./authorizationApi`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

6. **Line 5**: `./authorizationApi`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/state/redux/sagas/dataAnalysisSagas.tsx

1. **Line 5**: `@/app/projects/DataAnalysisPhase/DataAnalysisActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/projects/DataAnalysisPhase/DataAnalysisActions` → `@/app/actions/DataAnalysisActions`

2. **Line 6**: `@/app/typings/dataAnalysisTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/dataAnalysisTypes` → `@/app/libraries/cache/client/types`

---

#### 📄 src/app/state/redux/sagas/dataSaga.ts

1. **Line 3**: `@/app/projects/DataAnalysisPhase/DataActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/projects/DataAnalysisPhase/DataActions` → `@/app/actions/DataActions`

---

#### 📄 src/app/state/redux/sagas/featureSaga.ts

1. **Line 4**: `./api`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./api` → `@/app/actions/ApiActions`

2. **Line 5**: `./featureSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./featureSlice` → `@/app/users/featureSlice`

3. **Line 5**: `./featureSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./featureSlice` → `@/app/users/featureSlice`

---

#### 📄 src/app/state/redux/sagas/fileSagas.ts

1. **Line 12**: `@/api/DataframeApi`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/api/DataframeApi` → `@/app/api/DataframeApi`

2. **Line 12**: `@/api/DataframeApi`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/api/DataframeApi` → `@/app/api/DataframeApi`

3. **Line 12**: `@/api/DataframeApi`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/api/DataframeApi` → `@/app/api/DataframeApi`

4. **Line 13**: `@/slices/DataFrameSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/slices/DataFrameSlice` → `@/app/models/data/Data`

5. **Line 14**: `@/slices/DataSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/slices/DataSlice` → `@/app/models/data/Data`

---

#### 📄 src/app/state/redux/sagas/markerSagas.ts

1. **Line 2**: `@/app/actions/MarkerActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/actions/MarkerActions` → `@/app/models/data/Marker`

2. **Line 3**: `@/app/components/features/support/NotificationMessages`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/features/support/NotificationMessages` → `@/app/components/notifications/Notification`

3. **Line 4**: `@/app/components/marker/MarkerService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/marker/MarkerService` → `@/app/models/data/Marker`

4. **Line 5**: `@/app/components/models/data/Marker`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/Marker` → `@/app/api/ApiMarker`

---

#### 📄 src/app/state/redux/sagas/notificationSaga.ts

1. **Line 4**: `@/app/support/NotificationActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/support/NotificationActions` → `@/app/actions/NotificationActions`

---

#### 📄 src/app/state/redux/sagas/personaSagas/freelancerSaga.ts

1. **Line 2**: `@/app/actions/FreelancerActions`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

2. **Line 3**: `@/app/components/models/FreelancerService`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/state/redux/sagas/personaSagas/moderatorSaga.ts

1. **Line 2**: `@/app/actions/ModeratorActions`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

2. **Line 3**: `@/app/components/models/ModeratorService`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/state/redux/sagas/personaSagas/phaseSaga.ts

1. **Line 3**: `@/app/components/phases/PhaseActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/phases/PhaseActions` → `@/app/actions/phases/IdeationPhaseActions`

2. **Line 6**: `@/phases/PhaseService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/phases/PhaseService` → `@/app/api/service/PhaseService`

---

#### 📄 src/app/state/redux/sagas/personaSagas/projectOwnerSaga.ts

1. **Line 4**: `@/app/components/models/teams/Team`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/teams/Team` → `@/app/actions/TeamActions`

---

#### 📄 src/app/state/redux/sagas/preferences/brandingPreferencesSaga.ts

1. **Line 8**: `@/userPreferencesSagaManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/userPreferencesSagaManager` → `@/app/config/UserPreferences`

---

#### 📄 src/app/state/redux/sagas/preferences/userPreferencesSagaManager.ts

1. **Line 6**: `@/app/communicationPreferencesSaga`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communicationPreferencesSaga` → `@/app/state/redux/sagas/preferences/communicationPreferencesSaga`

2. **Line 7**: `@/brandingPreferencesSaga`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/brandingPreferencesSaga` → `@/app/libraries/ui/theme/Branding`

3. **Line 8**: `@/userPreferencesSaga`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/userPreferencesSaga` → `@/app/config/UserPreferences`

4. **Line 9**: `@/visualPreferencesSaga`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/visualPreferencesSaga` → `@/app/state/redux/sagas/preferences/visualPreferencesSaga`

---

#### 📄 src/app/state/redux/sagas/promptSagas.ts

1. **Line 4**: `@/app/components/support/NotificationTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/support/NotificationTypes` → `@/app/components/notifications/Notification`

2. **Line 4**: `@/app/components/support/NotificationTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/support/NotificationTypes` → `@/app/components/notifications/Notification`

---

#### 📄 src/app/state/redux/sagas/snapshotSagas.ts

1. **Line 4**: `@/app/components/typings/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/typings/types` → `@/app/actions/AppActionTypes`

---

#### 📄 src/app/state/redux/sagas/taskSagas.ts

1. **Line 2**: `@/app/components/tasks/TaskService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/tasks/TaskService` → `@/app/components/models/tasks/Task`

---

#### 📄 src/app/state/redux/sagas/todoSagas.ts

1. **Line 7**: `@/app/oActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/oActions` → `@/app/actions/CryptoActions`

---

#### 📄 src/app/state/redux/sagas/validationSagas.ts

1. **Line 2**: `@/app/libraries/logging/Logger`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/libraries/logging/Logger` → `@/app/config/LoggerConfig`

2. **Line 3**: `@/app/components/security/ValidationActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/security/ValidationActions` → `@/app/actions/ValidationActions`

3. **Line 3**: `@/app/components/security/ValidationActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/security/ValidationActions` → `@/app/actions/ValidationActions`

4. **Line 3**: `@/app/components/security/ValidationActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/security/ValidationActions` → `@/app/actions/ValidationActions`

---

#### 📄 src/app/state/redux/slices/AuthorizationSlice.tsx

1. **Line 4**: `@/RootSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RootSlice` → `@/app/state/redux/slices/RootSlice`

---

#### 📄 src/app/state/redux/slices/BlogSlice.ts

1. **Line 5**: `@/app/components/models/data/Comments`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/Comments` → `@/app/config/endpoints/commentsConfig`

2. **Line 5**: `@/app/components/models/data/Comments`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/Comments` → `@/app/config/endpoints/commentsConfig`

3. **Line 5**: `@/app/components/models/data/Comments`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/Comments` → `@/app/config/endpoints/commentsConfig`

4. **Line 5**: `@/app/components/models/data/Comments`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/data/Comments` → `@/app/config/endpoints/commentsConfig`

---

#### 📄 src/app/state/redux/slices/CalendarEventCollaboratorsState.tsx

1. **Line 3**: `@/app/components/calendar/CalendarEventCollaborator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/calendar/CalendarEventCollaborator` → `@/app/calendar/CalendarEvent`

---

#### 📄 src/app/state/redux/slices/CalendarSlice.tsx

1. **Line 59**: `@/app/models/members/Members`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/members/Members` → `@/app/components/phases/steps/TeamMembersStep`

---

#### 📄 src/app/state/redux/slices/CallSlice.ts

1. **Line 3**: `@/app/stores/DetailsListStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/stores/DetailsListStore` → `@/app/components/lists/DetailsList`

2. **Line 4**: `@/app/ReducerGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ReducerGenerator` → `@/app/state/redux/ReducerGenerator`

3. **Line 6**: `@/app/components/models/tracker/Tag`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/tracker/Tag` → `@/app/api/InstagramAPI`

---

#### 📄 src/app/state/redux/slices/ChatSlice.ts

1. **Line 8**: `@/app/ReducerGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ReducerGenerator` → `@/app/state/redux/ReducerGenerator`

---

#### 📄 src/app/state/redux/slices/DataFrameSlice.ts

1. **Line 4**: `@/app/ReducerGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ReducerGenerator` → `@/app/state/redux/ReducerGenerator`

---

#### 📄 src/app/state/redux/slices/DataSlice.ts

1. **Line 4**: `@/app/components/video/Video`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/video/Video` → `@/app/actions/VideoActions`

2. **Line 6**: `@/app/stores/CommonEvent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/stores/CommonEvent` → `@/app/events/Event`

3. **Line 7**: `@/app/ReducerGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ReducerGenerator` → `@/app/state/redux/ReducerGenerator`

---

#### 📄 src/app/state/redux/slices/DocumentSlice.test.tsx

1. **Line 4**: `@/RootSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RootSlice` → `@/app/state/redux/slices/RootSlice`

---

#### 📄 src/app/state/redux/slices/DynamicComponentSlice.ts

1. **Line 3**: `@/app/SliceGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/SliceGenerator` → `@/app/state/redux/SliceGenerator`

---

#### 📄 src/app/state/redux/slices/EntitySlice.ts

1. **Line 5**: `@/RootSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RootSlice` → `@/app/state/redux/slices/RootSlice`

---

#### 📄 src/app/state/redux/slices/FilteredEventsSlice.ts

1. **Line 13**: `@/app/typiings/entities/FilterEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/FilterEntity` → `@/app/pages/searches/Filter`

2. **Line 13**: `@/app/typiings/entities/FilterEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/FilterEntity` → `@/app/pages/searches/Filter`

3. **Line 13**: `@/app/typiings/entities/FilterEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/FilterEntity` → `@/app/pages/searches/Filter`

4. **Line 13**: `@/app/typiings/entities/FilterEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/FilterEntity` → `@/app/pages/searches/Filter`

5. **Line 13**: `@/app/typiings/entities/FilterEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/FilterEntity` → `@/app/pages/searches/Filter`

6. **Line 13**: `@/app/typiings/entities/FilterEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/FilterEntity` → `@/app/pages/searches/Filter`

7. **Line 13**: `@/app/typiings/entities/FilterEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typiings/entities/FilterEntity` → `@/app/pages/searches/Filter`

---

#### 📄 src/app/state/redux/slices/HistorySlice.ts

1. **Line 3**: `@/sagas/UndoRedoSaga`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/sagas/UndoRedoSaga` → `@/app/state/redux/sagas/UndoRedoSaga`

---

#### 📄 src/app/state/redux/slices/MeetingSlice.ts

1. **Line 3**: `@/app/ReducerGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ReducerGenerator` → `@/app/state/redux/ReducerGenerator`

---

#### 📄 src/app/state/redux/slices/NotificationSlice.ts

1. **Line 6**: `@/app/ReducerGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ReducerGenerator` → `@/app/state/redux/ReducerGenerator`

---

#### 📄 src/app/state/redux/slices/ProjectFeedbackSlice.tsx

1. **Line 3**: `@/RootSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RootSlice` → `@/app/state/redux/slices/RootSlice`

2. **Line 4**: `@/app/support/ProjectFeedback`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/support/ProjectFeedback` → `@/app/features/support/Feedback`

---

#### 📄 src/app/state/redux/slices/ProjectManagerSlice.ts

1. **Line 2**: `@/app/components/calendar/CalendarSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/calendar/CalendarSlice` → `@/app/components/calendar/Calendar`

---

#### 📄 src/app/state/redux/slices/ProjectOwnerSlice.ts

1. **Line 2**: `@/app/communications/scheduler/Meeting`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communications/scheduler/Meeting` → `@/app/actions/MeetingActions`

---

#### 📄 src/app/state/redux/slices/TeamSlice.ts

1. **Line 2**: `@/app/components/interfaces/settings/CollaborationPreferences`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/interfaces/settings/CollaborationPreferences` → `@/app/interfaces/settings/CollaborationPreferences`

2. **Line 5**: `@/app/ReducerGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/ReducerGenerator` → `@/app/state/redux/ReducerGenerator`

---

#### 📄 src/app/state/redux/slices/ThemeSlice.ts

1. **Line 4**: `@/app/components/libraries/ui/theme/Theme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/theme/Theme` → `@/app/actions/ThemeActions`

2. **Line 6**: `@/app/components/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

---

#### 📄 src/app/state/redux/slices/TodoSlice.ts

1. **Line 2**: `@/app/components/todos/Todo`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/todos/Todo` → `@/app/actions/TodoActions`

2. **Line 5**: `@/ReducerGenerator`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/ReducerGenerator` → `@/app/state/redux/ReducerGenerator`

---

#### 📄 src/app/state/redux/slices/TrackerSlice.tsx

1. **Line 3**: `@/app/components/calendar/CalendarSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/calendar/CalendarSlice` → `@/app/components/calendar/Calendar`

---

#### 📄 src/app/state/redux/slices/UserSlice.ts

1. **Line 16**: `@/app/service/crypto/NFT`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/service/crypto/NFT` → `@/app/actions/NFTActions`

---

#### 📄 src/app/state/redux/slices/UserSupportFeedbackPreferencesSlice.ts

1. **Line 3**: `@/RootSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RootSlice` → `@/app/state/redux/slices/RootSlice`

---

#### 📄 src/app/state/redux/slices/pagingSlice.tsx

1. **Line 46**: `@/path/to/pagingSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/path/to/pagingSlice` → `@/app/pages/Paging`

2. **Line 46**: `@/path/to/pagingSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/path/to/pagingSlice` → `@/app/pages/Paging`

---

#### 📄 src/app/state/redux/slices/useTagManagerSlice.ts

1. **Line 2**: `@/app/components/models/tracker/Tag`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/tracker/Tag` → `@/app/api/InstagramAPI`

2. **Line 2**: `@/app/components/models/tracker/Tag`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/tracker/Tag` → `@/app/api/InstagramAPI`

3. **Line 4**: `@/RootSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RootSlice` → `@/app/state/redux/slices/RootSlice`

---

#### 📄 src/app/state/stores/AppCacheManagerStore.ts

1. **Line 3**: `@/app/utils/AppCacheManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/AppCacheManager` → `@/app/actions/AppCacheManagerActions`

---

#### 📄 src/app/state/stores/AppStore.ts

1. **Line 3**: `@/app/components/calendar/CalendarSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/calendar/CalendarSlice` → `@/app/components/calendar/Calendar`

---

#### 📄 src/app/state/stores/CalendarManagerStore.spec.ts

1. **Line 2**: `@/app/components/context/NotificationContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/context/NotificationContext` → `@/app/components/notifications/Notification`

2. **Line 3**: `@/app/components/models/teams/Contributor`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/models/teams/Contributor` → `@/app/models/teams/Contributor`

3. **Line 4**: `@/app/components/utils/useSecureDocumentId`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/utils/useSecureDocumentId` → `@/app/hooks/useSecureDocumentId`

4. **Line 11**: `@/AssignEventStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/AssignEventStore` → `@/app/api/projects/assign`

---

#### 📄 src/app/state/stores/ContentStore.ts

1. **Line 5**: `@/app/models/content/ContentItem`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/content/ContentItem` → `@/app/components/models/content/ContentItem`

---

#### 📄 src/app/state/stores/FilterStore.ts

1. **Line 7**: `@/app/documents/screenFunctionality/HighlightEvent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/documents/screenFunctionality/HighlightEvent` → `@/app/api/ApiHighlightEvent`

---

#### 📄 src/app/state/stores/PhaseStore.tsx

1. **Line 7**: `@/app/video/Video`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/video/Video` → `@/app/actions/VideoActions`

---

#### 📄 src/app/state/stores/RootStores.ts

1. **Line 21**: `@/app/state/hybrid/SettingManagerStore`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/state/stores/StoreKeyGenerator.ts

1. **Line 17**: `@/store_key_generator`
   - **Reason:** ESM resolution failure
   - **⚠️ No suggestion available**

---

#### 📄 src/app/state/stores/ThemeStore.ts

1. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

2. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

3. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

4. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

5. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

6. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

7. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

8. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

9. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

10. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

11. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

12. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

13. **Line 4**: `@/app/security/validateTheme`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/security/validateTheme` → `@/app/libraries/ui/theme/Theme`

---

#### 📄 src/app/state/stores/TodoStore.ts

1. **Line 22**: `@/DetailsListStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/DetailsListStore` → `@/app/components/lists/DetailsList`

---

#### 📄 src/app/state/stores/TrackerStore.ts

1. **Line 4**: `@/RootStores`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RootStores` → `@/app/state/stores/RootStores`

---

#### 📄 src/app/state/stores/UIStore.ts

1. **Line 7**: `@/app/crypto/SafeParseData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/crypto/SafeParseData` → `@/app/dataIntegration/SafeParseData`

2. **Line 13**: `@/app/typings/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/types` → `@/app/actions/AppActionTypes`

3. **Line 14**: `@/app/utils/createMessage`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/createMessage` → `@/utils/web3/createMessage`

---

#### 📄 src/app/state/stores/UserPreferences/UserPreferencesStore.ts

1. **Line 4**: `@/app/components/libraries/ui/theme/ThemeConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/libraries/ui/theme/ThemeConfig` → `@/app/api/config`

---

#### 📄 src/app/state/stores/hooks/useProjectManager.ts

1. **Line 5**: `../mobx/ProjectManagerStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../mobx/ProjectManagerStore` → `@/app/models/projects/Project`

---

#### 📄 src/app/state/useEditorState.ts

1. **Line 6**: `@/app/components/state/BrowserBehaviorManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/BrowserBehaviorManager` → `@/app/state/BrowserBehaviorManager`

---

#### 📄 src/app/subscribers/Subscriber.tsx

1. **Line 79**: `@/config/DatabaseService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/config/DatabaseService` → `@/app/actions/database`

---

#### 📄 src/app/subscriptions/SubscriptionService.tsx

1. **Line 3**: `@/app/auth/AuthService`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/auth/AuthService` → `@/app/server/auth/AuthService`

2. **Line 5**: `@/app/web3/Web3Provider`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/web3/Web3Provider` → `@/app/components/Provider`

---

#### 📄 src/app/todos/Todo.ts

1. **Line 34**: `@/app/snapshots/SubscriberCollection`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/snapshots/SubscriberCollection` → `@/app/subscribers/Subscriber`

---

#### 📄 src/app/todos/TodoItem.tsx

1. **Line 3**: `@/Todo`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/Todo` → `@/app/actions/TodoActions`

---

#### 📄 src/app/trading/TradeIdea.ts

1. **Line 2**: `@/app/components/crypto/TradingStrategy`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/crypto/TradingStrategy` → `@/app/trading/TradingStrategy`

2. **Line 5**: `@/crypto/TradingStrategy`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/crypto/TradingStrategy` → `@/app/trading/TradingStrategy`

---

#### 📄 src/app/trading/Trades.tsx

1. **Line 2**: `@/app/crypto/TradingPlatform`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/crypto/TradingPlatform` → `@/app/components/crypto/TradingPlatform`

---

#### 📄 src/app/ts/EventDataService.tsx

1. **Line 5**: `@/app/api/ApiConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/ApiConfig` → `@/app/api/ApiConfigManager`

---

#### 📄 src/app/typings/BaseTypes.ts

1. **Line 51**: `@/app/tyings/entities/TaskEntity`
   - **Reason:** Dynamic ESM import failure
   - **Suggested fix:** `@/app/tyings/entities/TaskEntity` → `@/app/components/models/tasks/Task`

2. **Line 52**: `@/app/tyings/entities/ProjectEntity`
   - **Reason:** Dynamic ESM import failure
   - **Suggested fix:** `@/app/tyings/entities/ProjectEntity` → `@/app/models/projects/Project`

3. **Line 53**: `@/app/tyings/entities/UserEntity`
   - **Reason:** Dynamic ESM import failure
   - **Suggested fix:** `@/app/tyings/entities/UserEntity` → `@/app/typings/entities/AdminUserEntity`

4. **Line 54**: `@/app/tyings/entities/TeamEntity`
   - **Reason:** Dynamic ESM import failure
   - **Suggested fix:** `@/app/tyings/entities/TeamEntity` → `@/app/components/teams/Team`

5. **Line 55**: `@/app/tyings/entities/SnapshotEntity`
   - **Reason:** Dynamic ESM import failure
   - **Suggested fix:** `@/app/tyings/entities/SnapshotEntity` → `@/app/snapshots/Snapshot`

6. **Line 56**: `@/app/tyings/entities/AppEntity`
   - **Reason:** Dynamic ESM import failure
   - **Suggested fix:** `@/app/tyings/entities/AppEntity` → `@/app/typings/entities/AppEntity`

---

#### 📄 src/app/typings/determineType.ts

1. **Line 3**: `@/app/components/documents/FileLoadOptions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/documents/FileLoadOptions` → `@/app/documents/File`

---

#### 📄 src/app/typings/entities/DetailsEntity.ts

1. **Line 8**: `@/app/content/Content`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/content/Content` → `@/app/actions/ContentActions`

2. **Line 8**: `@/app/content/Content`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/content/Content` → `@/app/actions/ContentActions`

---

#### 📄 src/app/typings/entities/ProductEntity.ts

1. **Line 5**: `@/app/models/common/CommonData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/common/CommonData` → `@/app/models/CommonData.test`

2. **Line 6**: `@/app/models/visualization/VisualizationData`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/visualization/VisualizationData` → `@/app/hooks/userInterface/Visualization`

3. **Line 7**: `./RelatedProps`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./RelatedProps` → `@/app/documents/RelatedProps`

---

#### 📄 src/app/typings/entities/TeamEntity.ts

1. **Line 6**: `@/app/models/members/Members`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/members/Members` → `@/app/components/phases/steps/TeamMembersStep`

---

#### 📄 src/app/typings/meetingTypes.ts

1. **Line 4**: `@/app/models/meetings/Meeting`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/meetings/Meeting` → `@/app/actions/MeetingActions`

2. **Line 6**: `@/app/models/todos/Todo`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/todos/Todo` → `@/app/actions/TodoActions`

---

#### 📄 src/app/typings/persistenceTypes.ts

1. **Line 4**: `@/app/snapshots/snapshotTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/snapshots/snapshotTypes` → `@/app/libraries/cache/client/types`

---

#### 📄 src/app/typings/projectManagerTypes.ts

1. **Line 3**: `./ProjectManagerEntity`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./ProjectManagerEntity` → `@/app/models/projects/Project`

---

#### 📄 src/app/users/ActivityLog.tsx

1. **Line 2**: `./UserSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./UserSlice` → `@/app/state/redux/slices/UserSlice`

---

#### 📄 src/app/users/DataPreview.tsx

1. **Line 2**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

---

#### 📄 src/app/users/createSystemMessage.ts

1. **Line 2**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

2. **Line 2**: `@/app/components/users/User`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/users/User` → `@/app/actions/UserActions`

3. **Line 8**: `@/settings/PrivacySettings`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/settings/PrivacySettings` → `@/app/cards/modal/displayPrivacySettingsModal`

4. **Line 9**: `@/UserRoles`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/UserRoles` → `@/app/components/users/UserRolesEditor`

---

#### 📄 src/app/users/preferences/handleNotificationPreferences.ts

1. **Line 3**: `@/app/communications/chat/ChatSettingsModal`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communications/chat/ChatSettingsModal` → `@/app/cards/modal/ChatSettingsModal`

2. **Line 4**: `@/app/event/DynamicEventHandlerExample`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/event/DynamicEventHandlerExample` → `@/app/events/Event`

---

#### 📄 src/app/users/userJourney/IdeaLifecycle.tsx

1. **Line 4**: `./hooks/useLifecycle`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./hooks/useLifecycle` → `@/app/hooks/useLifecycle.ts`

2. **Line 5**: `./lifecycles`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./lifecycles` → `@/app/hooks/phases/lifecycles`

---

#### 📄 src/app/users/userJourney/TeamBuildingPhaseManagement.tsx

1. **Line 4**: `@/ConceptValidation`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/ConceptValidation` → `@/app/users/userJourney/ConceptValidation`

2. **Line 5**: `@/RequirementsGathering`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/RequirementsGathering` → `@/app/users/userJourney/RequirementsGathering`

---

#### 📄 src/app/versions/BlogPostHistory.tsx

1. **Line 3**: `@/app/community/DiscussionForumComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/community/DiscussionForumComponent` → `@/app/components/community/DiscussionForumComponent`

2. **Line 4**: `@/app/components/state/stores/HistoryStore`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/state/stores/HistoryStore` → `@/app/state/stores/HistoryStore`

---

#### 📄 src/app/versions/DocumentVersion.ts

1. **Line 2**: `@/app/libraries/logging/Logger`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/libraries/logging/Logger` → `@/app/config/LoggerConfig`

---

#### 📄 src/documentation/app/AppVersion.test.ts

1. **Line 3**: `../AppVersionImpl`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `../AppVersionImpl` → `@/app/versions/AppVersion`

2. **Line 4**: `@/app/core/types`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/core/types` → `@/app/actions/AppActionTypes`

---

#### 📄 src/index.ts

1. **Line 7**: `@/styles/main.css`
   - **Reason:** Dynamic ESM import failure
   - **⚠️ No suggestion available**

---

#### 📄 src/utils/CallControlPanel.tsx

1. **Line 3**: `@/app/utils/CallButton`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/CallButton` → `@/utils/web3/CallButton`

2. **Line 4**: `@/app/utils/commonUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/commonUtils` → `@/utils/web3/commonUtils`

3. **Line 4**: `@/app/utils/commonUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/commonUtils` → `@/utils/web3/commonUtils`

---

#### 📄 src/utils/DynamicNamingConventions.tsx

1. **Line 5**: `@/shared/sharedError`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/shared/sharedError` → `@/app/components/shared/Share`

---

#### 📄 src/utils/RandomWalk.ts

1. **Line 3**: `./RandomWalkActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./RandomWalkActions` → `@/app/hooks/userInterface/RandomWalkActions`

2. **Line 4**: `@/app/support/NotificationsSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/support/NotificationsSlice` → `@/app/components/notifications/Notification`

---

#### 📄 src/utils/Reporting.tsx

1. **Line 6**: `./report/Report`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./report/Report` → `@/app/api/ApiReport`

---

#### 📄 src/utils/cache/AppCacheManager.tsx

1. **Line 3**: `@/app/state/context/context/NotificationContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/state/context/context/NotificationContext` → `@/app/components/notifications/Notification`

2. **Line 6**: `@/app/components/video/Video`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/video/Video` → `@/app/actions/VideoActions`

3. **Line 7**: `@/configs/appStructure/FrontendStructureComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/configs/appStructure/FrontendStructureComponent` → `@/app/config/appStructure/FrontendStructure`

---

#### 📄 src/utils/cache/IntegratedCacheManager.ts

1. **Line 2**: `@/app/utils/AppCacheManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/utils/AppCacheManager` → `@/app/actions/AppCacheManagerActions`

---

#### 📄 src/utils/integrateMachineLearningUtilities.ts

1. **Line 2**: `@/crypto/TradingStrategy`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/crypto/TradingStrategy` → `@/app/trading/TradingStrategy`

---

#### 📄 src/utils/retrieveSnapshotData.ts

1. **Line 4**: `@/app/components/server/database/Payload`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/server/database/Payload` → `@/app/components/models/tasks/ExportTasksPayload`

2. **Line 4**: `@/app/components/server/database/Payload`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/server/database/Payload` → `@/app/components/models/tasks/ExportTasksPayload`

3. **Line 4**: `@/app/components/server/database/Payload`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/components/server/database/Payload` → `@/app/components/models/tasks/ExportTasksPayload`

---

#### 📄 src/utils/setUserData.ts

1. **Line 3**: `@/app/users/UserSlice`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/users/UserSlice` → `@/app/state/redux/slices/UserSlice`

---

#### 📄 src/utils/syncEndpointsWithExternalServicesUtils.ts

1. **Line 3**: `@/api/ApiEndpoints`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/api/ApiEndpoints` → `@/app/api/ApiEndpoints`

---

#### 📄 src/utils/urlGenerator.ts

1. **Line 3**: `@/app/api/EndpointConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/EndpointConfig` → `@/app/api/config`

2. **Line 3**: `@/app/api/EndpointConfig`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/api/EndpointConfig` → `@/app/api/config`

---

#### 📄 src/utils/videos/displayVideoOptionsMenu.ts

1. **Line 1**: `@/app/communications/chat/ChatSettingsModal`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communications/chat/ChatSettingsModal` → `@/app/cards/modal/ChatSettingsModal`

2. **Line 2**: `@/app/users/VideoActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/users/VideoActions` → `@/app/actions/VideoActions`

---

#### 📄 src/utils/videos/openPrivacySettingsMenu.ts

1. **Line 5**: `./VideoAPI`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./VideoAPI` → `@/app/api/videos/VideoAPI`

---

#### 📄 src/utils/videos/openVideoOptionsMenu.ts

1. **Line 4**: `@/app/communications/chat/ChatRoomContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communications/chat/ChatRoomContext` → `@/app/communications/ChatRoom`

2. **Line 4**: `@/app/communications/chat/ChatRoomContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communications/chat/ChatRoomContext` → `@/app/communications/ChatRoom`

3. **Line 5**: `@/app/communications/chat/ChatSettingsModal`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/communications/chat/ChatSettingsModal` → `@/app/cards/modal/ChatSettingsModal`

4. **Line 7**: `./VideoAPI`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./VideoAPI` → `@/app/api/videos/VideoAPI`

5. **Line 8**: `@/app/users/VideoActions`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/users/VideoActions` → `@/app/actions/VideoActions`

---

#### 📄 src/utils/web3/DIDManager.ts

1. **Line 3**: `@/didUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/didUtils` → `@/utils/web3/didUtils`

2. **Line 3**: `@/didUtils`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/didUtils` → `@/utils/web3/didUtils`

---

#### 📄 src/utils/web3/automatedDecisionMakingUtils.ts

1. **Line 1**: `@/app/crypto/TradingStrategy`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/crypto/TradingStrategy` → `@/app/trading/TradingStrategy`

---

#### 📄 src/utils/web3/dAppAdapter/AdapterContent.tsx

1. **Line 5**: `@/app/routing/Link`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/routing/Link` → `@/app/components/calendar/AttachmentsAndLinks`

2. **Line 9**: `@/app/styling/ColorPalette`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/styling/ColorPalette` → `@/app/components/styling/ColorPalette`

---

#### 📄 src/utils/web3/dAppAdapter/functionality/RealtimeUpdates.tsx

1. **Line 6**: `@/app/calendar/DatePicker`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/calendar/DatePicker` → `@/app/components/calendar/DatePicker`

2. **Line 7**: `@/app/community/ActivityFeedComponent`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/community/ActivityFeedComponent` → `@/app/components/community/ActivityFeedComponent`

---

#### 📄 src/utils/web3/dataAnalysisUtils.ts

1. **Line 1**: `@/app/typings/dataAnalysisTypes`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/dataAnalysisTypes` → `@/app/libraries/cache/client/types`

---

#### 📄 src/utils/web3/fileUtils.ts

1. **Line 2**: `@/app/typings/file/FileManager`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/typings/file/FileManager` → `@/app/components/models/file/FileManager`

---

#### 📄 src/utils/web3/useAqua.ts

1. **Line 4**: `@/app/models/aqua/AquaState`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `@/app/models/aqua/AquaState` → `@/app/dashboards/LoadAquaState`

---

#### 📄 src/utils/withSharedProps.tsx

1. **Line 4**: `./../../../app/context/StepContext`
   - **Reason:** ESM resolution failure
   - **Suggested fix:** `./../../../app/context/StepContext` → `@/app/state/context/StepContext`

---

### 🚀 Available Commands

```bash
# Scan and report only
pnpm run fix-imports:scan

# Dry run - show what would change
pnpm run fix-imports:dry-run

# Apply high confidence fixes only (RECOMMENDED)
pnpm run fix-imports:safe

# Apply all suggested fixes (use with caution)
pnpm run fix-imports:all

# Rollback all previous fixes
pnpm run fix-imports:rollback

# Interactive mode (for manual review)
pnpm run fix-imports:interactive
```

### 📋 Recommended Workflow

1. **Scan first:** `pnpm run fix-imports:scan`
2. **Preview changes:** `pnpm run fix-imports:dry-run`
3. **Apply safe fixes:** `pnpm run fix-imports:safe`
4. **Test:** `pnpm run test:types`
5. **Rollback if needed:** `pnpm run fix-imports:rollback`

### 🔍 Common Patterns to Fix Manually

| From | To | Count |
|------|----|-------|
| `@/app/components/users/User` | `@/app/actions/UserActions` | 13 |
| `@/app/security/validateTheme` | `@/app/libraries/ui/theme/Theme` | 13 |
| `@/config/BaseConfig` | `@/app/api/config` | 12 |
| `@/types` | `@/app/actions/AppActionTypes` | 11 |
| `@/app/components/auth/AuthContext` | `@/app/state/context/AuthContext` | 8 |
| `@/app/scripts/migrateUserData` | `@/app/models/data/Data` | 7 |
| `@/app/components/models/data/Comments` | `@/app/config/endpoints/commentsConfig` | 7 |
| `@/app/ReducerGenerator` | `@/app/state/redux/ReducerGenerator` | 7 |
| `@/app/typiings/entities/FilterEntity` | `@/app/pages/searches/Filter` | 7 |
| `@/app/api/ApiConfig` | `@/app/api/ApiConfigManager` | 6 |
