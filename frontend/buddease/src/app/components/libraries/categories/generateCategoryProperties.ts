import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";

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
