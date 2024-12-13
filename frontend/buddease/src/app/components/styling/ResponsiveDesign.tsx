// components/ResponsiveDesign.tsx
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import { action, observable } from "mobx";
import { observer, useLocalStore } from "mobx-react-lite";
import React, { useState } from "react";
import getAppPath from "../../../../appPath";
import { getCurrentAppInfo } from "../versions/VersionGenerator";
import { ColorSwatchProps } from "./ColorPalette";
import { BoardItem, CollaborationBoardStore } from "../state/stores/CollaborationBoardStore";
 
// Usage of getCurrentAppInfo
interface CustomDivProps extends React.HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
  dataTip?: string;
}
let currentIndex: number; // Declare currentIndex before using it
let indexToUpdate: number | null = null; // Declare the variable
let newExample: ResponsiveExample | null = null; // Declare the variable

const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);

const getButtonProps = ({ index }: { index: number }): CustomDivProps => {
  return {
    onClick: (e: React.MouseEvent<HTMLDivElement>) =>
      handleSelectExample(responsiveDesignStore.examples[index], index),
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) =>
      handleKeyPress(e, index, responsiveDesignStore.examples.length),
    "aria-label": responsiveDesignStore.examples[index].title,
    dataTip: responsiveDesignStore.examples[index].description,
    className: index === indexToUpdate ? "selected-example" : "normal-example",
    tabIndex: 0,
    // Add other div properties as needed
  };
};

const handleKeyPress = (
  e: React.KeyboardEvent<HTMLDivElement>,
  index: number,
  examplesLength: number
) => {
  if (e.key === "Enter") {
    // Use the global 'newExample' variable
    newExample = {
      title: "",
      description: "",
    };

    responsiveDesignStore.updateExample(indexToUpdate!, newExample);
    indexToUpdate = null;
  }
};

export interface ResponsiveDesignProps {
  examples: ResponsiveExample[];
  breakpoints: Record<string, number>;
  mediaQueries: Record<string, string>;
  typography: Record<string, Record<string, number>>;
  imageSizes: Record<string, Record<string, number>>;
  viewportConfig: Record<string, number>;
  navigationStyles: Record<string, Record<string, any>>;
  animationSettings: Record<string, Record<string, any>>;
  formElementStyling: Record<string, Record<string, any>>;
  touchGestures: Record<string, Record<string, any>>;
  deviceOrientation: Record<string, Record<string, any>>;
  responsiveImages: Record<string, Record<string, string>>;
  progressiveEnhancement: Record<string, boolean>;
  accessibilityAdjustments: Record<string, Record<string, string>>;
  performanceConsiderations: Record<string, boolean>;
  viewportMetaTagSettings: Record<string, string>;
  touchFeedbackStyles: Record<string, string>;
  cssGridFlexboxSettings: {
    small: {
      container: string;
      gap: string | number; // Allow both string and number
      columnGap: string | number; // Allow both string and number
      rowGap: string | number; // Allow both string and number
    };
    medium: {
      container: string;
      gap: string | number;
      columnGap: string | number;
      rowGap: string | number;
    };
    large: {
      container: string;
      gap: string | number;
      columnGap: string | number;
      rowGap: string | number;
    };
  };
  collaborationBoardStore: CollaborationBoardStore;
}

interface ResponsiveDesignStoreProps {
  breakpoints: Record<string, number>;
  mediaQueries: Record<string, string>;
  typography: Record<string, Record<string, number>>;
  imageSizes: Record<string, Record<string, number>>;
  viewportConfig: Record<string, number>;
  navigationStyles: Record<string, Record<string, any>>;
  animationSettings: Record<string, Record<string, any>>;
  formElementStyling: Record<string, Record<string, any>>;
  touchGestures: Record<string, Record<string, any>>;
  deviceOrientation: Record<string, Record<string, any>>;
  responsiveImages: Record<string, Record<string, string>>;
  progressiveEnhancement: Record<string, boolean>;
  accessibilityAdjustments: Record<string, Record<string, string>>;
  performanceConsiderations: Record<string, boolean>;
  viewportMetaTagSettings: Record<string, string>;
  touchFeedbackStyles: Record<string, string>;
  collaborationBoardStore: CollaborationBoardStore;
  cssGridFlexboxSettings: {
    small: {
      container: string;
      gap: string | number;
      columnGap: string | number;
      rowGap: string | number;
    };
    medium: {
      container: string;
      gap: string | number;
      columnGap: string | number;
      rowGap: string | number;
    };
    large: {
      container: string;
      gap: string | number;
      columnGap: string | number;
      rowGap: string | number;
    };
  };
}
// stores/ResponsiveDesignStore.ts

export interface ResponsiveExample {
  title: string;
  description: string;
}

class ResponsiveDesignStore {
  @observable
  examples: ResponsiveExample[] = [];

  @action
  addExample(example: ResponsiveExample) {
    this.examples.push(example);
  }

  @observable
  colors: string[] = [];

  @observable
  frontendStructure: FrontendStructure = new FrontendStructure(projectPath);

  @observable
  backendStructure: BackendStructure = new BackendStructure(projectPath);

  
  onColorChange: (color: ColorSwatchProps) => void = () => {};
  

  @observable structure: FrontendStructure & BackendStructure = Object.assign(
    this.frontendStructure, this.backendStructure);
  
  @observable
  responsiveProps: ResponsiveDesignProps = {
    breakpoints: {
      small: 600,
      medium: 900,
      large: 1200,
    },
    mediaQueries: {
      small: `(max-width: ${600}px)`,
      medium: `(max-width: ${900}px)`,
      large: `(max-width: ${1200}px)`,
    },
    typography: {
      small: {
        fontSize: 14,
        lineHeight: 1.5,
      },
      medium: {
        fontSize: 16,
        lineHeight: 1.6,
      },
      large: {
        fontSize: 18,
        lineHeight: 1.8,
      },
    },
    imageSizes: {
      small: {
        width: 100,
        height: 100,
      },
      medium: {
        width: 200,
        height: 200,
      },
      large: {
        width: 300,
        height: 300,
      },
    },
    viewportConfig: {
      initialScale: 1.0,
      minimumScale: 0.8,
      maximumScale: 1.5,
    },
    examples: [],
    navigationStyles: {
      small: {
        fontSize: 14,
        padding: "0.5em",
      },
      medium: {
        fontSize: 16,
        padding: "1em",
      },
      large: {
        fontSize: 18,
        padding: "1.5em",
      },
    },
    animationSettings: {
      duration: {
        fast: 200,
        normal: 400,
        slow: 800,
      },
    },
    formElementStyling: {
      small: {
        fontSize: 14,
        padding: "0.5em",
      },
      medium: {
        fontSize: 16,
        padding: "1em",
      },
      large: {
        fontSize: 18,
        padding: "1.5em",
      },
    },
    touchGestures: {
      small: {
        tapTargetSize: 48,
        doubleTapSpeed: 300,
      },
      medium: {
        tapTargetSize: 64,
        doubleTapSpeed: 400,
      },
      large: {
        tapTargetSize: 80,
        doubleTapSpeed: 500,
      },
    },
    deviceOrientation: {
      small: {
        orientation: "portrait",
      },
      medium: {
        orientation: "landscape",
      },
      large: {
        orientation: "landscape",
        touchZoom: true,
      },
    },
    responsiveImages: {
      small: {
        srcset: "image-small.jpg",
        sizes: "100px",
      },
      medium: {
        srcset: "image-medium.jpg",
        sizes: "200px",
      },
      large: {
        srcset: "image-large.jpg",
        sizes: "(min-width: 1200px) 300px, 100vw",
      },
    },
    progressiveEnhancement: {
      small: true,
      medium: true,
      large: false,
    },
    accessibilityAdjustments: {
      small: {
        contrast: "AAA",
        textSize: "125%",
      },
      medium: {
        contrast: "AA",
        textSize: "150%",
      },
      large: {
        contrast: "AA",
        textSize: "100%",
      },
    },
    cssGridFlexboxSettings: {
      small: {
        container: "grid",
        gap: 10,
        columnGap: 10,
        rowGap: 10,
      },
      medium: {
        container: "grid",
        gap: 10,
        columnGap: 10,
        rowGap: 10,
      },
      large: {
        container: "grid",
        gap: 10,
        columnGap: 10,
        rowGap: 10,
      },
    },
    performanceConsiderations: {
      small: true,
      medium: false,
      large: false,
    },
    viewportMetaTagSettings: {
      small: "width=device-width, initial-scale=1",
      medium: "width=device-width, initial-scale=1",
      large: "width=device-width, initial-scale=1",
    },
    touchFeedbackStyles: {
      small: "shrink-grow-fast",
      medium: "shrink-grow-normal",
      large: "shrink-grow-slow",
    },
    collaborationBoardStore: {
      boardItems: [], // Correctly typed as an array of BoardItem
      addBoardItem: (item: BoardItem) => {
        this.responsiveProps.collaborationBoardStore.boardItems.push(item);
      },
      removeBoardItem: (itemId: string) => {
        this.responsiveProps.collaborationBoardStore.boardItems =
          this.responsiveProps.collaborationBoardStore.boardItems.filter(
            (item) => item.id !== itemId
          );
      },
      updateBoardItem: (itemId: string, updatedItem: Partial<BoardItem>) => {
        const itemIndex = this.responsiveProps.collaborationBoardStore.boardItems.findIndex(
          (item) => item.id === itemId
        );
        if (itemIndex !== -1) {
          this.responsiveProps.collaborationBoardStore.boardItems[itemIndex] = {
            ...this.responsiveProps.collaborationBoardStore.boardItems[itemIndex],
            ...updatedItem,
          };
        }
      },
    },
  };

  @action
  updateBreakpoint(
    breakpoint: keyof ResponsiveDesignProps["breakpoints"],
    value: number
  ) {
    this.responsiveProps.breakpoints[breakpoint] = value;
    // Additional logic if needed
  }

  @action
  updateMediaQuery(
    query: keyof ResponsiveDesignProps["mediaQueries"],
    value: string
  ) {
    this.responsiveProps.mediaQueries[query] = value;
    // Additional logic if needed
  }

  @action
  updateTypographyAdjustment(
    screen: keyof ResponsiveDesignProps["typography"],
    property: keyof ResponsiveDesignProps["typography"][keyof ResponsiveDesignProps["typography"]],
    value: number
  ) {
    this.responsiveProps.typography[screen][property] = value;
    // Additional logic if needed
  }

  @action
  updateImageSize(
    screen: keyof ResponsiveDesignProps["imageSizes"],
    property: keyof ResponsiveDesignProps["imageSizes"][keyof ResponsiveDesignProps["imageSizes"]],
    value: number
  ) {
    this.responsiveProps.imageSizes[screen][property] = value;
    // Additional logic if needed
  }

  @action
  updateViewportConfig(
    property: keyof ResponsiveDesignProps["viewportConfig"],
    value: number
  ) {
    this.responsiveProps.viewportConfig[property] = value;
    // Additional logic if needed
  }

  @action
  updateNavigationStyles(
    screen: keyof ResponsiveDesignProps["navigationStyles"],
    property: keyof ResponsiveDesignProps["navigationStyles"][keyof ResponsiveDesignProps["navigationStyles"]],
    value: any // Update 'any' with the appropriate type for navigation styles
  ) {
    this.responsiveProps.navigationStyles[screen][property] = value;
  }

  @action
  updateAnimationSettings(
    screen: keyof ResponsiveDesignProps["animationSettings"],
    property: keyof ResponsiveDesignProps["animationSettings"][keyof ResponsiveDesignProps["animationSettings"]],
    value: any // Update 'any' with the appropriate type for animation settings
  ) {
    this.responsiveProps.animationSettings[screen][property] = value;
  }

  @action
  updateFormElementStyling(
    screen: keyof ResponsiveDesignProps["formElementStyling"],
    property: keyof ResponsiveDesignProps["formElementStyling"][keyof ResponsiveDesignProps["formElementStyling"]],
    value: any // Update 'any' with the appropriate type for form element styling
  ) {
    this.responsiveProps.formElementStyling[screen][property] = value;
  }

  @action
  implementResponsiveImages(
    screen: keyof ResponsiveDesignProps["responsiveImages"],
    imageType: keyof ResponsiveDesignProps["responsiveImages"][keyof ResponsiveDesignProps["responsiveImages"]],
    source: string
  ) {
    this.responsiveProps.responsiveImages[screen][imageType] = source;
  }

  @action
  applyProgressiveEnhancement(
    feature: keyof ResponsiveDesignProps["progressiveEnhancement"],
    isEnabled: boolean
  ) {
    this.responsiveProps.progressiveEnhancement[feature] = isEnabled;
  }
  @action
  makeAccessibilityAdjustments(
    screen: keyof ResponsiveDesignProps["accessibilityAdjustments"],
    adjustmentType: keyof ResponsiveDesignProps["accessibilityAdjustments"][keyof ResponsiveDesignProps["accessibilityAdjustments"]],
    adjustmentValue: string
  ) {
    this.responsiveProps.accessibilityAdjustments[screen][adjustmentType] =
      adjustmentValue;
  }

  @action
  manageCSSGridFlexboxSettings(
    screen: keyof ResponsiveDesignProps["cssGridFlexboxSettings"],
    property: keyof ResponsiveDesignProps["cssGridFlexboxSettings"][keyof ResponsiveDesignProps["cssGridFlexboxSettings"]],
    value: string | number
  ) {
    if (property === "container" && typeof value === "string") {
      this.responsiveProps.cssGridFlexboxSettings[screen][property] =
        value as string;
    } else if (property !== "container" && typeof value === "number") {
      this.responsiveProps.cssGridFlexboxSettings[screen][property] =
        value as number;
    }
  }

  @action
  optimizePerformance(
    capability: keyof ResponsiveDesignProps["performanceConsiderations"],
    shouldOptimize: boolean
  ) {
    this.responsiveProps.performanceConsiderations[capability] = shouldOptimize;
    // Additional logic if needed
  }

  @action
  adjustViewportMetaTag(
    setting: keyof ResponsiveDesignProps["viewportMetaTagSettings"],
    value: string
  ) {
    this.responsiveProps.viewportMetaTagSettings[setting] = value;
    // Additional logic if needed
  }

  @action
  clearExamples() {
    this.examples = [];
  }

  @action
  deleteExample(index: number) {
    this.examples.splice(index, 1);
  }

  @action
  updateExample(index: number, updatedExample: ResponsiveExample) {
    this.examples[index] = updatedExample;
  }
  @action
  duplicateExample(index: number) {
    this.examples.push({ ...this.examples[index] });
  }

  @action
  deleteSelectedExamples(index: number) {
    this.examples.splice(index, 1);
    indexToUpdate = null;
  }

  @action
  handleTouchGestures(
    screen: keyof ResponsiveDesignProps["touchGestures"],
    gestureType: keyof ResponsiveDesignProps["touchGestures"][keyof ResponsiveDesignProps["touchGestures"]],
    handler: any // Update 'any' with the appropriate type for touch gesture handler
  ) {
    this.responsiveProps.touchGestures[screen][gestureType] = handler;
  }

  @action
  adjustForDeviceOrientation(
    orientation: keyof ResponsiveDesignProps["deviceOrientation"],
    adjustment: any // Update 'any' with the appropriate type for orientation adjustment
  ) {
    this.responsiveProps.deviceOrientation[orientation] = adjustment;
  }
}

const handleClearExamples = () => {
  responsiveDesignStore.clearExamples();
};


const handleSelectExample = (example: ResponsiveExample, index: number) => {
  // Store the selected index
  indexToUpdate = index; // Set the selected index

  // Additional logic for handling the selection of an example
  console.log(`Selected example: ${example.title}`);

  // Example: Highlight the selected example
  const selectedExampleElement = document.getElementById(`example-${index}`);
  if (selectedExampleElement) {
    selectedExampleElement.classList.add("selected-example");
  }
};

const ResponsiveDesign: React.FC<ResponsiveDesignProps> = observer(() => {
  let indexToUpdate: number | null = null; // Declare the variable

  const responsiveDesignStore = useLocalStore<ResponsiveDesignStore>(
    () => new ResponsiveDesignStore()
  );

  const [newExample, setNewExample] = useState<ResponsiveExample>({
    title: "",
    description: "",
  });


  const [updatedExample, setUpdatedExample] =
    useState<ResponsiveExample | null>(null);

  const handleAddExample = (example: ResponsiveExample) => {
    responsiveDesignStore.addExample(example);
    setNewExample({ title: "", description: "" });
  };

  const handleClearExamples = () => {
    responsiveDesignStore.clearExamples();
  };

  const handleSelectExample = (example: ResponsiveExample, index: number) => {
    indexToUpdate = index;
    // Your logic for handling the selection of an example
    console.log(`Selected example: ${example.title}`);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    example: ResponsiveExample,
    index: number
  ) => {
    // Your logic for handling key presses on examples
    if (e.key === "Enter") {
      handleSelectExample(example, index);
    }
  };

  const handleDeleteExample = (index: number) => {
    responsiveDesignStore.deleteExample(index);
  };

  const handleUpdateExample = (
    index: number,
    updatedExample: ResponsiveExample
  ) => {
    responsiveDesignStore.updateExample(index, updatedExample);
  };

  const handleDuplicateExample = (index: number) => {
    responsiveDesignStore.duplicateExample(index);
  };

  // Your UI logic here
  // Add this example to your list of responsive design examples
  const mobilePortraitExample: ResponsiveExample = {
    title: "Mobile Portrait",
    description: "Optimized for smartphones in portrait orientation.",
  };

  const crossBrowserCompatibilityExample: ResponsiveExample = {
    title: "Chrome vs. Firefox",
    description: "Ensuring consistent design across different browsers.",
  };

  const highResolutionDisplaysExample: ResponsiveExample = {
    title: "Retina Display",
    description:
      "Optimizing for high-resolution displays, such as Apple's Retina.",
  };

  const printStylesheetExample: ResponsiveExample = {
    title: "Print-Friendly Version",
    description: "Creating a stylesheet for optimal printing.",
  };

  const accessibilityImprovementsExample: ResponsiveExample = {
    title: "Screen Reader Compatibility",
    description: "Enhancing accessibility for users with screen readers.",
  };

  const darkModeExample: ResponsiveExample = {
    title: "Dark Theme",
    description: "Supporting dark mode for users who prefer a dark interface.",
  };

  const animationPerformanceExample: ResponsiveExample = {
    title: "Smooth Animations",
    description:
      "Testing smooth transitions and animations for a polished user experience.",
  };

  const touchFriendlyDesignExample: ResponsiveExample = {
    title: "Touch Gestures",
    description:
      "Ensuring usability on touch devices with swipe and tap gestures.",
  };

  const internationalizationExample: ResponsiveExample = {
    title: "Multilingual Support",
    description: "Testing layout adjustments for different languages.",
  };

  // Assuming this is where you handle adding examples
  handleAddExample(mobilePortraitExample);
  handleAddExample(crossBrowserCompatibilityExample);
  handleAddExample(highResolutionDisplaysExample);
  handleAddExample(printStylesheetExample);
  handleAddExample(accessibilityImprovementsExample);
  handleAddExample(darkModeExample);
  handleAddExample(animationPerformanceExample);
  handleAddExample(touchFriendlyDesignExample);
  handleAddExample(internationalizationExample);

  return (
    <div>
      {/* ... (previous code) */}
      {responsiveDesignStore.examples.map(
        (example: ResponsiveExample, index: number) => (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => handleSelectExample(example, index)}
            onKeyDown={(e) => handleKeyPress(e, example, index)}
            aria-label={example.title}
            data-tip={example.description}
            className={index === currentIndex ? "selected-example" : ""}
            {...getButtonProps({ index })}
          >
            <h3>{example.title}</h3>
            <p>{example.description}</p>
          </div>
        )
      )}

      <button onClick={() => handleAddExample}>Add Example</button>
      <button onClick={handleClearExamples}>Clear Examples</button>

      {/* Pass index as a parameter */}
      <button
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          const index = Number(
            (event.target as HTMLButtonElement).getAttribute("data-index")
          );
          if (updatedExample !== null && updatedExample) {
            handleUpdateExample(index, updatedExample);
          }
        }}
      >
        Update Example
      </button>

      {/* Pass index as a parameter */}
      <button
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          const index = Number(
            (event.target as HTMLButtonElement).getAttribute("data-index")
          );
          handleDuplicateExample(index);
        }}
      >
        Duplicate Example
      </button>

      {/* Pass index as a parameter */}
      <button
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          const index = Number(
            (event.target as HTMLButtonElement).getAttribute("data-index")
          );
          handleDeleteExample(index);
        }}
      >
        Delete Example
      </button>

      <button
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          const index = Number(
            (event.target as HTMLButtonElement).getAttribute("data-index")
          );
          responsiveDesignStore.deleteSelectedExamples(index);
        }}
      >
        Delete Selected Example
      </button>
      {responsiveDesignStore.examples.map(
        (example: ResponsiveExample, index: number) => (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={(e) => handleSelectExample(example, index)}
            onKeyDown={(e) => handleKeyPress(e, example, index)}
            aria-label={example.title}
            data-tip={example.description}
            className={index === indexToUpdate ? "selected-example" : ""}
            {...getButtonProps({ index })}
          >
            <h3>{example.title}</h3>
            <p>{example.description}</p>
          </div>
        )
      )}
    </div>
  );
});


function handleNewExample(newExample: any) {
  setNewExample(newExample);
}

function setNewExample(arg0: { title: string; description: string }) {
  const newExample: ResponsiveExample = {
    title: arg0.title,
    description: arg0.description,
  };
  responsiveDesignStore.addExample(newExample);
}

const responsiveDesignStore = new ResponsiveDesignStore();
const responsiveDesignStoreProps: ResponsiveDesignStoreProps = {} as ResponsiveDesignStoreProps;
export default responsiveDesignStore; 
export { ResponsiveDesign, responsiveDesignStoreProps };

// Examples
// Now you can use these actions in your application to dynamically update breakpoints, media queries, and other responsive properties.
// For example:
responsiveDesignStore.updateBreakpoint("small", 480);
responsiveDesignStore.updateMediaQuery("small", `(max-width: ${480}px)`);
responsiveDesignStore.addExample({} as ResponsiveExample)