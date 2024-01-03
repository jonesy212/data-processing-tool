// components/ResponsiveDesign.tsx
import { action, observable } from "mobx";
import { observer, useLocalStore } from "mobx-react-lite";
import React, { useState } from "react";

let indexToUpdate: number | null = null;

interface ResponsiveDesignProps {
  examples: ResponsiveExample[];
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
}

const handleClearExamples = () => {
  responsiveDesignStore.clearExamples();
};

const ResponsiveDesign: React.FC<ResponsiveDesignProps> = observer(() => {
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
    </div>
  );
});

const responsiveDesignStore = new ResponsiveDesignStore();
export default responsiveDesignStore;
