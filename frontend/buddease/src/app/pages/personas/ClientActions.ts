// ClientActions.ts
import { createAction } from "@reduxjs/toolkit";

export const ClientActions = {
  // View tenant details
  viewTenantDetailsRequest: createAction<string>("client/viewTenantDetailsRequest"),
  viewTenantDetailsSuccess: createAction<{ id: string; name: string; email: string }>("client/viewTenantDetailsSuccess"),
  viewTenantDetailsFailure: createAction<string>("client/viewTenantDetailsFailure"),

  // Select tenant
  selectTenant: createAction<string>("client/selectTenant"),

  // Filter tenants
  filterTenants: createAction<{ criteria: string; value: any }>("client/filterTenants"),

  // Additional robust actions
  fetchClientData: createAction("client/fetchClientData"),
  updateClientSettings: createAction<{ settings: any }>("client/updateClientSettings"),
  createClientNote: createAction<{ note: string }>("client/createClientNote"),
  archiveClient: createAction<string>("client/archiveClient"),
};
