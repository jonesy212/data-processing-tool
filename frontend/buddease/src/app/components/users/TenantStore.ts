import { Tenant } from '@/app/components/users/TenantStore';
import { makeAutoObservable } from "mobx";


// Tenant.ts
interface Tenant {
  id: string;
  name: string;
  description: string;
}
  
// TenantStore.ts
interface TenantStore {
    tenants: Tenant[];
    currentTenantId: string;
    
    constructor(): void;
    addTenant(name: string, description: string): void;
    removeTenant(tenantId: string): void;
    setCurrentTenant(tenantId: string): void;
  }

  
  class TenantStoreClass implements TenantStore {
    tenants: Tenant[] = [];
    currentTenantId: string = "";
  
    constructor() {
      makeAutoObservable(this);
    }
  
    ["constructor"](): void {
      throw new Error("Method not implemented.");
    }
  
    addTenant(name: string, description: string): void {
      const newTenant: Tenant = {
        id: Date.now().toString(),
        name: name,
        description: description,
      };
      this.tenants.push(newTenant);
    }
  
    removeTenant(tenantId: string): void {
      this.tenants = this.tenants.filter((tenant: Tenant) => tenant.id !== tenantId);
    }
  
    setCurrentTenant(tenantId: string): void {
      this.currentTenantId = tenantId;
    }
  }
  

  const useTenantStore = (): TenantStore => {
    return new TenantStoreClass();
  };

  export { useTenantStore };
export type { Tenant };

