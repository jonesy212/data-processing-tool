// tenantSags.ts
import { TenantActions } from '@/app/components/hooks/userInterface/TenantActions';
import MemberData from '@/app/components/models/teams/TeamMembers';
import { takeLatest, put, call } from 'redux-saga/effects';

// Worker saga to handle creating a new tenant
function* createTenantSaga(action: { type: string; payload: { tenantData: any } }): Generator<any,any, any> {
  try {
    const { tenantData } = action.payload;
    const response = yield call(tenantAPI.createTenant, tenantData); // Make API call to create a new tenant
    // Dispatch success action with the response data
    yield put(TenantActions.createTenantSuccess(response.data));
  } catch (error) {
    // Dispatch failure action with the error message
    yield put(TenantActions.createTenantFailure(error.message));
  }
}
function* fetchTenantDataSaga(action: { tenantId: string, payload: { tenant: MemberData } }) {
    try {
        const { tenant } = action.payload
        
    } catch (err) { 
        
    }
}
// Watcher saga to watch for the create tenant action
function* watchCreateTenant() {
    yield takeLatest(TenantActions.createTenant.type, createTenantSaga);
    yield takeLatest(TenantActions.createTenantSuccess.type, createTenantSaga);
    yield takeLatest(TenantActions.createTenantFailure.type, createTenantSaga);
    
    
    yield takeLatest(TenantActions.updateTenant.type, createTenantSaga);
    yield takeLatest(TenantActions.updateTenantRequest.type, createTenantSaga);
    yield takeLatest(TenantActions.updateTenantSuccess.type, createTenantSaga);
    yield takeLatest(TenantActions.updateTenantFailure.type, createTenantSaga);



    yield takeLatest(TenantActions.createTenantRequest.type, createTenantSaga);
    //todo updat tenant sagas
    // / Tenant CRUD operations
yield takeLatest(TenantActions.createTenantRequest.type, createTenantSaga);
yield takeLatest(TenantActions.fetchTenantDataRequest.type, fetchTenantDataSaga);
yield takeLatest(TenantActions.updateTenantInfoRequest.type, updateTenantInfoSaga);
yield takeLatest(TenantActions.deleteTenantRequest.type, deleteTenantSaga);

// Export and Import Tenant Data
yield takeLatest(TenantActions.exportTenantDataRequest.type, exportTenantDataSaga);
yield takeLatest(TenantActions.importTenantDataRequest.type, importTenantDataSaga);

// Backup and Restore Tenant Data
yield takeLatest(TenantActions.backupTenantRequest.type, backupTenantSaga);
yield takeLatest(TenantActions.restoreTenantRequest.type, restoreTenantSaga);

// Archive and Clone Tenant
yield takeLatest(TenantActions.archiveTenantRequest.type, archiveTenantSaga);
yield takeLatest(TenantActions.cloneTenantRequest.type, cloneTenantSaga);

// View Usage Reports and Customize Notifications
yield takeLatest(TenantActions.viewTenantUsageReportsRequest.type, viewTenantUsageReportsSaga);
yield takeLatest(TenantActions.customizeTenantNotificationsRequest.type, customizeTenantNotificationsSaga);

// Manage Collaborations and Integrations
yield takeLatest(TenantActions.manageTenantCollaborationsRequest.type, manageTenantCollaborationsSaga);
yield takeLatest(TenantActions.enableTenantSpecificIntegrationsRequest.type, enableTenantSpecificIntegrationsSaga);

// Monitor Performance and Audit Changes
yield takeLatest(TenantActions.monitorTenantPerformanceRequest.type, monitorTenantPerformanceSaga);
yield takeLatest(TenantActions.auditTenantChangesRequest.type, auditTenantChangesSaga);

// Additional Actions
yield takeLatest(TenantActions.validateTenantDataRequest.type, validateTenantDataSaga);
yield takeLatest(TenantActions.notifyTenantUsersRequest.type, notifyTenantUsersSaga);
    // yield takeLatest(TenantActions.updateTenantInfoRequest.type, fetchTenantDataSaga);

     
    // yield takeLatest(TenantActions.deleteTenantRequest.type, deleteTenantSaga);
    // yield takeLatest(TenantActions.exportTenantDataRequest.type, exportTenantDataSaga);
    // yield takeLatest(TenantActions.importTenantDataRequest.type, importTenantDataSaga);
    // yield takeLatest(TenantActions.backupTenantDataRequest.type, backupTenantDataSaga);
    // yield takeLatest(TenantActions.restoreTenantDataRequest.type, restoreTenantDataSaga);
    // yield takeLatest(TenantActions.archiveTenantRequest.type, archiveTenantSaga);
    // yield takeLatest(TenantActions.cloneTenantRequest.type, coneTenantSaga);
    // yield takeLatest(TenantActions.exportTenantConfigRequest.type, exportTenantConfig),




    // yield takeLatest(TenantActions.fetchTenantData.type, fetchTenantDataSaga);
    // yield takeLatest(TenantActions.updateTenantInfo.type, updateTenantInfoSaga);
    // yield takeLatest(TenantActions.deleteTenant.type, deleteTenantSaga);
    // yield takeLatest(TenantActions.exportTenantData.type, exportTenantDataSaga);
    // yield takeLatest(TenantActions.importTenantData.type, importTenantDataSaga);
    // yield takeLatest(TenantActions.backupTenant.type, backupTenantSaga);
    // yield takeLatest(TenantActions.restoreTenant.type, restoreTenantSaga);
    // yield takeLatest(TenantActions.viewTenantUsageReports.type, viewTenantUsageReportsSaga);
    // yield takeLatest(TenantActions.customizeTenantNotifications.type, customizeTenantNotificationsSaga);
    // yield takeLatest(TenantActions.manageTenantCollaborations.type, manageTenantCollaborationsSaga);
    // yield takeLatest(TenantActions.enableTenantSpecificIntegrations.type, enableTenantSpecificIntegrationsSaga);
    // yield takeLatest(TenantActions.monitorTenantPerformance.type, monitorTenantPerformanceSaga);
    // yield takeLatest(TenantActions.auditTenantChanges.type, auditTenantChangesSaga);
  
    // yield takeLatest(TenantActions.createTenantSaga, createTenantSaga);
    // yield takeLatest(TenantActions.fetchTenant, fetchTenantSaga);
    // yield takeLatest(TenantActions.updateTenant, updateTenantSaga);
    // yield takeLatest(TenantActions.deleteTenant, deleteTenantSaga);
    // yield takeLatest(TenantActions.exportTenantData, exportTenantDataSaga);
    // yield takeLatest(TenantActions.importTenantData, importTenantDataSaga);
    // yield takeLatest(TenantActions.backupTenantData, backupTenantDataSaga);
    // yield takeLatest(TenantActions.restoreTenantData, restoreTenantDataSaga);
    // yield takeLatest(TenantActions.archiveTenant, archiveTenantSaga);
    // yield takeLatest(TenantActions.cloneTenant, cloneTenantSaga);
    // yield takeLatest(TenantActions.exportTenantConfig, exportTenantConfigSaga);
    // yield takeLatest(TenantActions.importTenantConfig, importTenantConfigSaga);
    // yield takeLatest(TenantActions.validateTenantData, validateTenantDataSaga);
    // yield takeLatest(TenantActions.notifyTenantUsers, notifyTenantUsersSaga);
  
  
    // // Fetch tenant data
    // yield takeLatest(TenantActions.fetchTenant.type, fetchTenantSaga);
    
    // // Update tenant data
    // yield takeLatest(TenantActions.updateTenant.type, updateTenantSaga);
    
    // // Delete tenant data
    // yield takeLatest(TenantActions.deleteTenant.type, deleteTenantSaga);
    
    //
}

// Other sagas for fetching, updating, or deleting tenants can be defined similarly

// Root saga to combine all tenant-related sagas
export function* tenantSagas() {
  yield all([
    watchCreateTenant(),
    // Other watcher sagas for different tenant actions
  ]);
}
