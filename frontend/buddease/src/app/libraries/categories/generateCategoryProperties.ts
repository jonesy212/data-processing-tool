// generateCategoryProperties.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { CategoryKeys } from "@/app/libraries/categories/CategoryManager";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SnapshotConfig } from '@/app/snapshots/';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotData } from '@/app/snapshots/SnapshotData';

type CategoryIdentifier = string | symbol;
type Category = CategoryKeys | CategoryIdentifier | CategoryProperties | undefined;



// Shared method signatures for category behavior
type SnapshotCategoryMethods = {
  /**
   * Set the category for a snapshot/store entry.
   * Accepts either a string or a Category union (which itself can include string).
   */
  setSnapshotCategory: (id: string, newCategory: string | Category) => void;

  /**
   * Get the category for a snapshot/store entry.
   */
  getSnapshotCategory: (id: string) => Category | undefined;
};

interface CategoryPropertyBundle<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T
> {
  simple: string[];
  detailed?: CategoryProperties<T, K>[]; // plural because real-world category arrays
}

// Type Guard to check if category is CategoryProperties
function isCategoryProperties(category: Category): category is CategoryProperties {
  return (category as CategoryProperties)?.name !== undefined;
}

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
    case "community":
      return "community"
    case "teams":
      return "teams" 
    case "todos":
      return "todos"  
    case "notes":
      return "notes"  
    case "goals":
      return "goals"  
    case "files":
      return "files"  
    case "events":
      return "events"  
    case "contacts":
      return "contacts"  
    case "bookmarks":
      return "bookmarks" 
    // Add more mappings if necessary
    default:
      return null; // Or handle the default case however you need
  }
}

function getOrSetCategoryForSnapshot <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  type: string,
  event: Event,
  snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  categoryProps?: Category,
  additionalHeaders?: Record<string, string>
): Promise<{ categoryProperties?: CategoryProperties; snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }> {
  
  // Check if the category is already set and is a string or symbol
  if (typeof snapshot.category === 'string' || typeof snapshot.category === 'symbol') {
    const categoryProperties: CategoryProperties = {
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
    };
    
    return Promise.resolve({
      categoryProperties,
      snapshots: [snapshot]
    });
  }
  
  // If it's a CategoryProperties object, return it
  if (snapshot.category && typeof snapshot.category !== 'string' && typeof snapshot.category !== 'symbol') {
    return Promise.resolve({
      categoryProperties: snapshot.category as CategoryProperties,
      snapshots: [snapshot]
    });
  }
  
  // No category provided, set a default one based on the context
  const defaultCategory: CategoryIdentifier = getCategoryLabelForSnapshot(type) || 'defaultCategory';
 
  // If categoryProps is provided and it's a string or symbol, use it; otherwise, use the default category
  const categoryIdentifier: CategoryIdentifier = 
    typeof categoryProps === 'string' || typeof categoryProps === 'symbol'
    ? categoryProps
    : defaultCategory;

  snapshot.category = categoryIdentifier;

  // Optionally, set other properties in snapshot.categoryProperties based on the context
  if (categoryProps && typeof categoryProps !== 'string' && typeof categoryProps !== 'symbol') {
    snapshot.categoryProperties = categoryProps;
  } else {
    snapshot.categoryProperties = generateCategoryProperties(type);
  }
  
  return Promise.resolve({
    categoryProperties: snapshot.categoryProperties,
    snapshots: [snapshot]
  });
}




// Update the logic to handle ID assignment and verification
function generateOrVerifySnapshotId <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string | number | undefined,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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

    export type { Category, CategoryIdentifier, CategoryPropertyBundle, SnapshotCategoryMethods };

