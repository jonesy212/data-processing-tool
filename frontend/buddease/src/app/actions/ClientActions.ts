// ClientActions.ts
import { createAction } from "@reduxjs/toolkit";

export const ClientActions = {

  fetchClientsRequest: createAction("client/fetchClientsRequest"),
  fetchClientDetailsSuccess: createAction<{clientDetails: any}>("client/fetchClientDetailsSuccess"),
  fetchClientDetailsRequest: createAction<string>("client/fetchClientDetailsRequest"),
  fetchClientDetailsFailure: createAction<string>("client/fetchClientDetailsFailure"),
  
  updateClientDetailsRequest: createAction<{ clientId: string, clientData: any }>("client/updateClientDetailsRequest"),
  // View tenant details
  viewTenantDetailsRequest: createAction<string>("client/viewTenantDetailsRequest"),
  viewTenantDetailsSuccess: createAction<{ id: string; name: string; email: string }>("client/viewTenantDetailsSuccess"),
  viewTenantDetailsFailure: createAction<string>("client/viewTenantDetailsFailure"),


  updateClientDetailsSuccess: createAction<{ clientId: string; clientDetails: any }>("client/updateClientDetailsSuccess"),
  updateClientDetailsFailure: createAction<{error: string}>("client/updateClientDetailsFailure"),
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
