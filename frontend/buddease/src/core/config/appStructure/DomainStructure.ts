// DomainStructure.ts
// Enhanced roadmap generation with domain-based organization
import type { ApiInfo, ComponentInfo, InterfaceInfo } from '@/core/generators/ApiCodeGenerator';
import { ProjectStructure } from '@/core/scripts/generateRoadmaps';

export interface DomainStructure {
    frontend: {
        uiComponents: ComponentInfo[];
        pages: ComponentInfo[];
        hooks: ComponentInfo[];
        frontendTypes: InterfaceInfo[]; // Separate array for interface types
        utils: ComponentInfo[];
    };
    backend: {
        apiEndpoints: ApiInfo[];
        services: ApiInfo[];
        dataModels: InterfaceInfo[];
        types: InterfaceInfo[];
    };
    shared: {
        types: InterfaceInfo[];
        utils: InterfaceInfo[];
        constants: InterfaceInfo[];
    };
}

export function categorizeProjectStructure(projectStructure: ProjectStructure): DomainStructure {
  const { interfaces, components, apis } = projectStructure;
  
  const domainStructure: DomainStructure = {
    frontend: { uiComponents: [], pages: [], hooks: [], frontendTypes: [], utils: [] },
    backend: { apiEndpoints: [], services: [], dataModels: [], types: [] },
    shared: { types: [], utils: [], constants: [] }
  };

  // Categorize components
  components.forEach(([name, comp]) => {
    const componentWithName = { ...comp, name };
    
    if (name.includes('Page') || name.includes('View') || comp.file.includes('/pages/')) {
      domainStructure.frontend.pages.push(componentWithName);
    } else if (name.includes('Hook') || name.includes('use') || comp.file.includes('/hooks/')) {
      domainStructure.frontend.hooks.push(componentWithName);
    } else if (comp.file.includes('/utils/') || comp.file.includes('/lib/')) {
      domainStructure.frontend.utils.push(componentWithName);
    } else {
      domainStructure.frontend.uiComponents.push(componentWithName);
    }
  });

  // Categorize interfaces
  interfaces.forEach(([name, iface]) => {
    if (name.match(/props|component|ui|form/i) || iface.file.includes('/components/')) {
      domainStructure.frontend.frontendTypes.push(iface); // Now using the correct array
    } else if (name.match(/api|request|response|dto|entity/i) || iface.file.includes('/api/')) {
      domainStructure.backend.dataModels.push(iface);
    } else if (iface.file.includes('/types/') || iface.file.includes('/interfaces/')) {
      domainStructure.shared.types.push(iface);
    } else {
      domainStructure.backend.types.push(iface);
    }
  });

  // Categorize APIs
  apis.forEach(([file, api]) => {
    if (file.includes('/api/') || file.includes('/routes/') || api.methods.some(m => 
      m.name.match(/get|post|put|delete|patch/i))) {
      domainStructure.backend.apiEndpoints.push(api);
    } else if (file.includes('/services/') || file.includes('/service/')) {
      domainStructure.backend.services.push(api);
    }
  });

  return domainStructure;
}