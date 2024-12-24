import { BaseData } from '@/app/components/models/data/Data';
import { SnapshotConfig, SnapshotData } from '@/app/components/snapshots';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Snapshot } from "../../snapshots";
import { CategoryKeys } from "./CategoryManager";


type CategoryIdentifier = string | symbol;
type Category = CategoryIdentifier | CategoryProperties | undefined;


// Type Guard to check if category is CategoryProperties
function isCategoryProperties(category: Category): category is CategoryProperties {
  return (category as CategoryProperties)?.name !== undefined;
}

// generateCategoryProperties.ts
function generateCategoryProperties(area: string | undefined): CategoryProperties {
  switch (area) {
    case "UserInterface":
      return {
        id: "ui-001", 
        type: "interface", 
        chartType: "none", 
        dataProperties: [],
        formFields: [],
        name: "User Interface",
        description: "User Interface component",
        icon: "fa-ui",
        color: "#007bff",
        iconColor: "#fff",
        isActive: true,
        isPublic: true,
        isSystem: false,
        isDefault: false,
        isHidden: false,
        isHiddenInList: false,
        UserInterface: ["componentName", "componentDescription"],
        DataVisualization: [],
        Forms: {},
        Analysis: [],
        Communication: [],
        TaskManagement: [],
        Crypto: [],
        brandName: "MyBrand",
        brandLogo: "path/to/logo.png",
        brandColor: "#ff5733",
        brandMessage: "Bringing insights to life",
      };
    case "Analytics":
      return {
        id: "an-001", 
        type: "analytics", 
        chartType: "line", 
        dataProperties: [],
        formFields: [],
        name: "Analytics",
        description: "Analytics components for data analysis and insights",
        icon: "fa-chart-line",
        color: "#28a745",
        iconColor: "#fff",
        isActive: true,
        isPublic: true,
        isSystem: false,
        isDefault: false,
        isHidden: false,
        isHiddenInList: false,
        UserInterface: [],
        DataVisualization: ["dataProperties", "chartType"],
        Forms: {},
        Analysis: [],
        Communication: [],
        TaskManagement: [],
        Crypto: [],
        brandName: "MyBrand",
        brandLogo: "path/to/logo.png",
        brandColor: "#ff5733",
        brandMessage: "Bringing insights to life"
      };
    case "Reports":
      return {
        id: "rp-001", 
        type: "report", 
        chartType: "pie", 
        dataProperties: [],
        formFields: [],
        name: "Reports",
        description: "Reporting components for generating and viewing reports",
        icon: "fa-file-alt",
        color: "#ffc107",
        iconColor: "#fff",
        isActive: true,
        isPublic: true,
        isSystem: false,
        isDefault: false,
        isHidden: false,
        isHiddenInList: false,
        UserInterface: [],
        DataVisualization: ["dataProperties", "chartType"],
        Forms: {},
        Analysis: [],
        Communication: [],
        TaskManagement: [],
        Crypto: [],
        brandName: "MyBrand",
        brandLogo: "path/to/logo.png",
        brandColor: "#ff5733",
        brandMessage: "Bringing insights to life"
      };
    case "Widgets":
      return {
        id: "wg-001", 
        type: "widget", 
        chartType: "custom", 
        dataProperties: [],
        formFields: [],
        name: "Widgets",
        description: "Custom widgets for enhancing user experience",
        icon: "fa-puzzle-piece",
        color: "#6c757d",
        iconColor: "#fff",
        isActive: true,
        isPublic: true,
        isSystem: false,
        isDefault: false,
        isHidden: false,
        isHiddenInList: false,
        UserInterface: [],
        DataVisualization: ["dataProperties", "chartType"],
        Forms: {},
        Analysis: [],
        Communication: [],
        TaskManagement: [],
        Crypto: [],
        brandName: "MyBrand",
        brandLogo: "path/to/logo.png",
        brandColor: "#ff5733",
        brandMessage: "Bringing insights to life"
      };
    case "DataVisualization":
      return {
        id: "dv-001", 
        type: "visualization", 
        chartType: "bar", 
        name: "Data Visualization",
        dataProperties: [],
        formFields: [],
        description: "Data visualization component",
        icon: "fa-chart-bar",
        color: "#007bff",
        iconColor: "#fff",
        isActive: true,
        isPublic: true,
        isSystem: false,
        isDefault: false,
        isHidden: false,
        isHiddenInList: false,
        UserInterface: [],
        DataVisualization: ["dataProperties", "chartType"],
        Forms: {},
        Analysis: [],
        Communication: [],
        TaskManagement: [],
        Crypto: [],
        brandName: "MyBrand",
        brandLogo: "path/to/logo.png",
        brandColor: "#ff5733",
        brandMessage: "Bringing insights to life",
    };
    // Add cases for other categories
    default:
      return {
        id: "default-001", 
        type: "default", 
        chartType: "none", 
        name: "Default",
        description: "Default category",
        dataProperties: [],
        formFields: [],
        icon: "fa-default",
        color: "#000000",
        iconColor: "#fff",
        isActive: true,
        isPublic: true,
        isSystem: false,
        isDefault: true,
        isHidden: false,
        isHiddenInList: false,
        UserInterface: [],
        DataVisualization: [],
        Forms: {},
        Analysis: [],
        Communication: [],
        TaskManagement: [],
        Crypto: [],
        brandName: "",
        brandLogo: "",
        brandColor: "",
        brandMessage: "",
      };
  }
}

function getCategoryLabelForSnapshot(context: string): CategoryKeys | null {

  switch (context) {
    case "team":
      return "teams";
    case "user":
      return "notes"; // Map to 'notes' or any other CategoryKeys
    case "component":
      return "files";
    case "project":
      return "projects";
    case "developer":
      return "developerTasks"; // Example
    case "board":
      return "boardItems";
    // Add more mappings if necessary
    default:
      return null; // Or handle the default case however you need
  }
}

function getOrSetCategoryForSnapshot <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string,
  snapshot: Snapshot<T, K>,
  type: string,
  event: Event,
  snapshotConfig: SnapshotConfig<T, K>,
  categoryProps?: Category,
  additionalHeaders?: Record<string, string>
): Promise<{ categoryProperties?: CategoryProperties; snapshots: Snapshot<T, K>[] }> {
  // Check if the category is already set and is a string or symbol
  if (typeof snapshot.category === 'string' || typeof snapshot.category === 'symbol') {
    return {
      name: snapshot.category.toString(),
      id: snapshot.id ? snapshot.id.toString() : "", 
      description: snapshot.description ? snapshot.description : "",
      type: snapshot.categoryProperties?.type ?? "",
      chartType: snapshot.categoryProperties?.chartType ?? "",
      dataProperties: snapshot.categoryProperties?.dataProperties ?? [],
      formFields: snapshot.categoryProperties?.formFields ?? [],
     
      icon: snapshot.categoryProperties?.icon ?? "",   
      color: snapshot.categoryProperties?.color ?? "",
      iconColor: snapshot.categoryProperties?.iconColor ?? "",
      isActive: snapshot.categoryProperties?.isActive ?? true,
      isPublic: snapshot.categoryProperties?.isPublic ?? true,
      isSystem: snapshot.categoryProperties?.isSystem ?? true,
      isDefault: snapshot.categoryProperties?.isDefault ?? true,
      isHidden: snapshot.categoryProperties?.isHidden ?? false,
      isHiddenInList: snapshot.categoryProperties?.isHiddenInList ?? false,
      UserInterface: snapshot.categoryProperties?.UserInterface ?? [],
      DataVisualization: snapshot.categoryProperties?.DataVisualization ?? [],
      Forms: snapshot.categoryProperties?.Forms ?? undefined,
      Analysis: snapshot.categoryProperties?.Analysis ?? [],
      Communication: snapshot.categoryProperties?.Communication ?? [],
      TaskManagement: snapshot.categoryProperties?.TaskManagement ?? [],
      Crypto: snapshot.categoryProperties?.Crypto ?? [],
      brandName: snapshot.categoryProperties?.brandName ?? "",
      brandLogo: snapshot.categoryProperties?.brandLogo ?? "",
      brandColor: snapshot.categoryProperties?.brandColor ?? "",
      brandMessage: snapshot.categoryProperties?.brandMessage ?? "",
     }; // Ensure it returns a CategoryProperties object
  }
  
  // If it's a CategoryProperties object, return it
  if (snapshot.category && typeof snapshot.category !== 'string' && typeof snapshot.category !== 'symbol') {
    return snapshot.category; // Return as CategoryProperties
  }
  
  // No category provided, set a default one based on the context

  const defaultCategory: CategoryIdentifier = getCategoryLabelForSnapshot(type) || 'defaultCategory';
 
  // If categoryProps is provided and it's a string or symbol, use it; otherwise, use the default category
  const categoryIdentifier: CategoryIdentifier = 
    typeof categoryProps === 'string' || typeof categoryProps === 'symbol'
    ? categoryProps
    : defaultCategory; // Provide a fallback value if defaultCategory is null

  snapshot.category = categoryIdentifier;

  // Optionally, set other properties in snapshot.categoryProperties based on the context
  if (categoryProps && typeof categoryProps !== 'string' && typeof categoryProps !== 'symbol') {
    snapshot.categoryProperties = categoryProps;
  } else {
    snapshot.categoryProperties = generateCategoryProperties(type);
  }
  
  return {
    categoryProperties: snapshot.categoryProperties,
    snapshots: [snapshot] // Return an array of snapshots as required
  };
}




// Update the logic to handle ID assignment and verification
function generateOrVerifySnapshotId <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  id: string | number | undefined,
  snapshotData: SnapshotData<T, K>,
  category: Category
): string {
  if (typeof id === 'number') {
    // Convert number to string
    return id.toString();
  } else if (id === undefined && category !== undefined) {
    // Provide a default string value based on category or label
    
    const categoryLabel = typeof category === 'string' ? category : getCategoryLabelForSnapshot(`${String(category)}`) || 'default-id';
    return UniqueIDGenerator.generateSnapshotIDWithCategory(categoryLabel);
  } else {
    // Return the id if it's already a string
    return id || '';
  }
}
export { generateCategoryProperties, generateOrVerifySnapshotId, getCategoryLabelForSnapshot, getOrSetCategoryForSnapshot, isCategoryProperties };

    export type { Category, CategoryIdentifier };
