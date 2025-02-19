// ComponentsConfig.ts
export interface ComponentsConfig {
  button: {
    textColor?: string;
    backgroundColor?: string;
    hoverColor?: string;
    borderColor?: string;
    borderRadius?: string;
    // Add other button-related properties here
  };
  input: {
    textColor?: string;
    backgroundColor?: string;
    border?: string;
    placeholderColor?: string;
    modal?: string;
    // Add other input-related properties here
  };
  header: {
    textColor?: string;
    backgroundColor?: string;
    fontSize?: string;
    // Add other header-related properties here
  };
  // Add configurations for other components as needed

  // Example: Add configuration for a new component named "footer"
  footer: {
    textColor?: string;
    backgroundColor?: string;
    linkColor?: string;
    // Add other footer-related properties here
  };

  modal: {
    overlayColor: string;
    borderColor: string;
    // Add other modal-related properties here
  };
    
  dropdown: {
    textColor: string,
    backgroundColor: string,
    borderColor: string,
  },
  // Example: Add configuration for a new component named "carousel"
  carousel: {
    slideBackgroundColor?: string;
    slideTextColor?: string;
    navigationColor?: string;
    // Add other carousel-related properties here
  };

  // Example: Add configuration for a new component named "tooltip"
  tooltip: {
    backgroundColor?: string;
    borderColor: string;
    textColor?: string;
    arrowColor?: string;
    // Add other tooltip-related properties here
  };

  // Add more configurations for additional components as needed
}

// Define component configurations
const componentConfigurations: ComponentsConfig = {
    button: {
        textColor: "#ffffff",
        backgroundColor: "#007bff",
    },
    input: {
        textColor: "#333333",
        backgroundColor: "#ffffff",
    },
    header: {
        textColor: "#ffffff",
        backgroundColor: "#333333",
    },
    // Add configurations for additional components
    footer: {
        textColor: "#ffffff",
        backgroundColor: "#333333",
    },
    modal: {
        overlayColor: "rgba(0, 0, 0, 0.5)",
        borderColor: "#cccccc",
    },
    dropdown: {
        textColor: "#333333",
        backgroundColor: "#ffffff",
        borderColor: "#cccccc",
    },
    tooltip: {
        textColor: "#ffffff",
        backgroundColor: "#333333",
        borderColor: "#cccccc",
    },
    carousel: {
        slideBackgroundColor: undefined,
        slideTextColor: undefined,
        navigationColor: undefined
    }
};

// Example usage in code
const buttonTextColor = componentConfigurations.button.textColor; // Get button text color
const inputBackgroundColor = componentConfigurations.input.backgroundColor; // Get input background color
const modalOverlayColor = componentConfigurations.modal.overlayColor; // Get modal overlay color

// Use the configurations as needed in your application
console.log("Button text color:", buttonTextColor);
console.log("Input background color:", inputBackgroundColor);
console.log("Modal overlay color:", modalOverlayColor);
