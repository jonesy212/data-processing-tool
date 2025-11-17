import { ButtonGenerator, useButtonGeneratorProps } from "@/app/generators/GenerateButtons";
import { Button } from "antd";
import { FC, useEffect, useState } from "react";
import React from "react";

interface ButtonProps {
  variant?: string;
}

type LibraryType = {
  antd: typeof renderAntdComponent;
  'material-ui': typeof renderMaterialUIComponent;
  'semantic-ui': typeof renderSemanticUIComponent;
  custom: typeof renderCustomComponent;
  buttonGenerator: typeof renderButtonGeneratorComponent;
};

type UIComponentOptions = {
  library?: keyof LibraryType;
  type: keyof LibraryType;
  buttonGeneratorProps?: {
    label?: Record<string, string>;
    variant?: Record<string, string>;
    onSubmit?: () => void;
    onCancel?: () => void;
  };
};

// ✅ ALL RENDER FUNCTIONS PRESERVED
const renderAntdComponent = (props?: ButtonProps): JSX.Element => {
  return (
    <Button 
      type="primary" 
      className={props?.variant || 'antd-btn-primary'}
    >
      Ant Design Component
    </Button>
  );
};

const renderMaterialUIComponent = (props?: ButtonProps): JSX.Element => {
  return (
    <Button 
      type="default"
      className={`material-ui-btn ${props?.variant || 'material-primary'}`}
    >
      Material UI Component
    </Button>
  );
};

const renderSemanticUIComponent = (props?: ButtonProps): JSX.Element => { 
  return (
    <Button 
      className={`semantic-ui-btn ${props?.variant || 'semantic-primary'}`}
    >
      Semantic UI Component
    </Button>
  );
}

const renderCustomComponent = (props?: ButtonProps): JSX.Element => { 
  return (
    <div className={`custom-component ${props?.variant || 'custom-default'}`}>
      Custom Component
    </div>
  );
}

// ✅ ButtonGenerator component renderer
const renderButtonGeneratorComponent = (props?: any): JSX.Element => {
  const { buttonProps } = useButtonGeneratorProps();
  
  return (
    <ButtonGenerator
      {...buttonProps}
      {...props}
      label={props?.label || { submit: "Default Button" }}
      variant={props?.variant || { primary: 'btn-primary' }}
    />
  );
}

// ✅ ORIGINAL HOOK PRESERVED
export const useUIComponent = (options: UIComponentOptions): JSX.Element | null => {
  const [uiComponent, setUIComponent] = useState<JSX.Element | null>(null);

  useEffect(() => {
    const loadUILibrary = () => {
      let component: JSX.Element | null = null;

      switch (options.library) {
        case "antd":
          component = renderAntdComponent(options as ButtonProps);
          break;
        case "material-ui":
          component = renderMaterialUIComponent(options as ButtonProps);
          break;
        case "semantic-ui":
          component = renderSemanticUIComponent(options as ButtonProps);
          break;
        case "custom":
          component = renderCustomComponent(options as ButtonProps);
          break;
        case "buttonGenerator":
          component = renderButtonGeneratorComponent(options.buttonGeneratorProps);
          break;
        default:
          component = renderAntdComponent();
          break;
      }

      if (component) {
        setUIComponent(component);
      }
    };

    loadUILibrary();
  }, [options.library, options.buttonGeneratorProps]);

  return uiComponent;
};

// ✅ ORIGINAL COMPONENT RENDERER PRESERVED
interface UIComponentRendererProps extends UIComponentOptions {
  className?: string;
  style?: React.CSSProperties;
}

export const UIComponentRenderer: React.FC<UIComponentRendererProps> = ({
  library = "antd",
  type,
  buttonGeneratorProps,
  className,
  style,
  ...rest
}) => {
  const component = useUIComponent({
    library,
    type,
    buttonGeneratorProps
  });

  if (!component) {
    return <div>Loading component...</div>;
  }

  return React.cloneElement(component, {
    className: `${component.props.className || ''} ${className || ''}`.trim(),
    style: { ...component.props.style, ...style },
    ...rest
  });
};

// ✅ EXAMPLE USAGE PRESERVED
export const ExampleUsage: React.FC = () => {
  return (
    <div>
      <UIComponentRenderer library="antd" type="antd" />
      <UIComponentRenderer 
        library="buttonGenerator" 
        type="buttonGenerator"
        buttonGeneratorProps={{
          label: { submit: "Custom Submit", cancel: "Custom Cancel" },
          variant: { primary: 'custom-primary-btn' },
          onSubmit: () => console.log("Custom submit handler"),
          onCancel: () => console.log("Custom cancel handler")
        }}
      />
      <UIComponentRenderer 
        library="material-ui" 
        type="material-ui"
        className="my-material-component"
        variant="outlined"
      />
    </div>
  );
};

// 🆕 ENHANCED VERSION ADDED (EXTRA - NOT REPLACEMENT)
export const useEnhancedUIComponent = (options: UIComponentOptions & {
  onComponentLoad?: (componentType: string) => void;
  onComponentError?: (error: Error) => void;
}) => {
  const [component, setComponent] = useState<JSX.Element | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);

        let renderedComponent: JSX.Element | null = null;

        switch (options.library) {
          case "antd":
            renderedComponent = renderAntdComponent(options as ButtonProps);
            break;
          case "material-ui":
            renderedComponent = renderMaterialUIComponent(options as ButtonProps);
            break;
          case "semantic-ui":
            renderedComponent = renderSemanticUIComponent(options as ButtonProps);
            break;
          case "custom":
            renderedComponent = renderCustomComponent(options as ButtonProps);
            break;
          case "buttonGenerator":
            renderedComponent = renderButtonGeneratorComponent(options.buttonGeneratorProps);
            break;
          default:
            renderedComponent = renderAntdComponent();
            break;
        }

        if (renderedComponent) {
          setComponent(renderedComponent);
          options.onComponentLoad?.(options.library || 'default');
        }

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load UI component');
        setError(error.message);
        options.onComponentError?.(error);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [options.library, options.buttonGeneratorProps, options.onComponentLoad, options.onComponentError]);

  return { component, loading, error };
};

// 🆕 ENHANCED COMPONENT ADDED (EXTRA - NOT REPLACEMENT)
export const EnhancedUIComponentRenderer: React.FC<UIComponentRendererProps & {
  onComponentLoad?: (componentType: string) => void;
  onComponentError?: (error: Error) => void;
}> = (props) => {
  const { component, loading, error } = useEnhancedUIComponent(props);

  if (loading) {
    return <div>Loading {props.library} component...</div>;
  }

  if (error) {
    return <div>Error loading component: {error}</div>;
  }

  if (!component) {
    return <div>No component available</div>;
  }

  return React.cloneElement(component, {
    className: `${component.props.className || ''} ${props.className || ''}`.trim(),
    style: { ...component.props.style, ...props.style },
  });
};