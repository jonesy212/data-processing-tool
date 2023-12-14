// components/ResponsiveDesign.tsx
import { action, observable } from "mobx";
import useStore from "mobx-react";
import observer from "mobx-react-lite";
import React, { useState } from "react";

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
}


const handleClearExamples = () => {
    responsiveDesignStore.clearExamples();
  };

const ResponsiveDesign: React.FC<ResponsiveDesignProps> = observer(
  (
    {
      /* other props */
    }
  ) => {
    const responsiveDesignStore = useStore();

    const [newExample, setNewExample] = useState<ResponsiveExample>({
      title: "",
      description: "",
    });

    const handleAddExample = () => {
      responsiveDesignStore.addExample();
      setNewExample({ title: "", description: "" });
    };

    const handleClearExamples = () => {
      responsiveDesignStore.clearExamples();
    };

    const handleSelectExample = (example: ResponsiveExample) => {
      // Your logic for handling the selection of an example
      console.log(`Selected example: ${example.title}`);
    };

    const handleKeyPress = (
      e: React.KeyboardEvent,
      example: ResponsiveExample
    ) => {
      // Your logic for handling key presses on examples
      if (e.key === "Enter") {
        handleSelectExample(example);
      }
    };

    return (
      <div>
        {/* ... (previous code) */}
        {responsiveDesignStore.examples.map((example: any, index: any) => (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => handleSelectExample(example)}
            onKeyDown={(e) => handleKeyPress(e, example)}
            aria-label={example.title}
            data-tip={example.description}
          >
            <h3>{example.title}</h3>
            <p>{example.description}</p>
          </div>
        ))}
            
        <button onClick={handleAddExample}>Add Example</button>
        <button onClick={handleClearExamples}>Clear Examples</button>
      </div>
    );
  }
);

const responsiveDesignStore = new ResponsiveDesignStore();
export default responsiveDesignStore;
