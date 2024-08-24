import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { BaseData } from "../../models/data/Data";
import { Snapshot } from "../../snapshots";


type CategoryIdentifier = string | symbol;
type Category = CategoryIdentifier | CategoryProperties | undefined;


// generateCategoryProperties.ts
function generateCategoryProperties(area: string): CategoryProperties {
  switch (area) {
    case "UserInterface":
      return {
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
    case "DataVisualization":
      return {
        name: "Data Visualization",
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
        name: "Default",
        description: "Default category",
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


function getCategoryLabelForSnapshot(context: string): string {
  switch (context) {
    case "team":
      return "Team Category";
    case "user":
      return "User Category";
    case "component":
      return "Component Category";
    case "project":
      return "Project Category";
    case "developer":
      return "Developer Category";
    case "board":
      return "Board Category";
    // Add more cases as needed
    default:
      return "Default Category";
  }
}

function getOrSetCategoryForSnapshot<T extends BaseData, K extends BaseData>(
  snapshotId: string,
  snapshot: Snapshot<T, K>,
  type: string,
  event: Event,
  categoryProps?: Category
): CategoryProperties {
  // Check if the category is already set and is a string or symbol
  if (typeof snapshot.category === 'string' || typeof snapshot.category === 'symbol') {
    return {
      name: snapshot.category.toString(),
      description: snapshot.description ? snapshot.description : "",
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
  const defaultCategory = getCategoryLabelForSnapshot(type);

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
  
  return snapshot.categoryProperties;
}



export {getOrSetCategoryForSnapshot, getCategoryLabelForSnapshot};

export type {Category, CategoryIdentifier};