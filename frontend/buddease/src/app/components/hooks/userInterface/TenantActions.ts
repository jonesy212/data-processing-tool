// TenantActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Tenant } from "../../users/TenantStore";

export const TenantActions = {
  // Create tenant actions
  createTenantRequest: createAction<{ name: string; email: string }>(
    "tenant/createRequest"
  ),

  createTenantSuccess: createAction<{
    id: string;
    name: string;
    email: string;
  }>("tenant/createSuccess"),
  createTenantFailure: createAction<string>("tenant/createFailure"),

  // Fetch tenant actions
  fetchTenantData: createAction<{ tenants: Tenant[] }>("tenant/fetchData"), // Adjusted to accept an array of tenants
  fetchTenantRequest: createAction<string>("tenant/fetchRequest"),
  fetchTenantSuccess: createAction<Tenant[]>("tenant/fetchSuccess"), // Adjusted to return an array of fetched tenants

  fetchTenantFailure: createAction<string>("tenant/fetchFailure"),

  // Update tenant actions
  updateTenant: createAction<{ tenantId: string; name: string }>(
    "tenant/update"
  ),

  updateTenantRequest: createAction<{
    id: string;
    name: string;
    email: string;
  }>("tenant/updateRequest"),
  updateTenantSuccess: createAction<{
    id: string;
    name: string;
    email: string;
  }>("tenant/updateSuccess"),
  updateTenantFailure: createAction<string>("tenant/updateFailure"),

  // Remove tenant actions
  removeTenant: createAction<{ tenantId: string }>("tenant/remove"),
  removeTenantRequest: createAction<string>("tenant/removeRequest"),
  removeTenantSuccess: createAction<string>("tenant/removeSuccess"),
  removeTenantFailure: createAction<string>("tenant/removeFailure"),

  // batch tenant actions
  fetchTenantsData: (tenants: Tenant[]) => tenants,

}