    import { useThemeConfig } from "@/app/components/hooks/userInterface/ThemeConfigContext";

    // Define color properties for the design system
    interface ColorProperties {
        primary: string;
        secondary: string;
        accent: string;
        // Add more colors as needed
    }
    
    // Define size properties for the design system
    interface SizeProperties {
        small: string;
        medium: string;
        large: string;
        // Add more sizes as needed
    }
    
    // Define style properties for the design system
    interface StyleProperties {
        bold: string;
        italic: string;
        underline: string;
        // Add more styles as needed
    }
    
    
    // Combine all design properties into one interface
    interface DesignProperties extends ColorProperties, SizeProperties, StyleProperties {
        // Add more design properties as needed
    }
    
    // Create a configuration for the design system
    export interface DesignSystemConfig {
        // Extend the existing mapConfig with design properties
        design: DesignProperties;
    }
    
    const themeConfig = useThemeConfig()

    // Use the design system configuration in the theme configuration
    export const productionThemeConfig: DesignSystemConfig = {
        ...themeConfig, // Assuming you have an existing themeConfig
        design: {
        // Add values for the design properties
        primary: '#3498db',
        secondary: '#2ecc71',
        accent: '#e74c3c',
        small: '12px',
        medium: '18px',
        large: '24px',
        bold: '700',
        italic: 'italic',
        underline: 'underline',
        // Add more values as needed
        },
    };
    


    export type { SizeProperties, StyleProperties };
