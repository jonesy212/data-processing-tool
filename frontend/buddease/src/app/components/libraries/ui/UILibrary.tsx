import { ButtonGenerator, buttonGeneratorProps } from "@/app/generators/GenerateButtons";
import { Button } from "antd";
import { FC, useEffect, useState } from "react";
import React from "react";


interface ButonProps {
  variant?: string
}
type LibraryType = {
  antd: typeof renderAntdComponent;
  'material-ui': typeof renderMaterialUIComponent;
  'semantic-ui': typeof renderSemanticUIComponent;
  custom: FC;
  buttonGenerator: FC; // New type for ButtonGenerator
};

type UIComponentOptions = {
  library?: keyof LibraryType;
  type: keyof LibraryType; // Use keyof LibraryType instead of UIComponentType
};

const renderAntdComponent = (): JSX.Element => {
  // Render Ant Design component
  return <Button type="primary">Ant Design Component</Button>;
};

const renderMaterialUIComponent = (): JSX.Element => {
  // Render Material UI component
  return <Button type="default">Material UI Component</Button>;
};


const renderSemanticUIComponent = (): JSX.Element => { 
  // Render Semantic UI component
  return <Button>Semantic UI Component</Button>;
}

const renderCustomComponent = (): JSX.Element => { 
  // Render custom component
  return <div>Custom Component</div>;
}


export const useUIComponent = (options: UIComponentOptions): JSX.Element | null => {
  const [uiComponent, setUIComponent] = useState<JSX.Element | null>(null);

  useEffect(() => {
    const loadUILibrary = () => {
      let component: JSX.Element | null = null;

      switch (options.library) {
        case "antd":
          component = renderAntdComponent();
          break;
        case "material-ui":
          component = renderMaterialUIComponent();
          break;
        case "semantic-ui":
          component = renderSemanticUIComponent();
          break;
        case "custom":
          component = renderCustomComponent();
          break;
        case "buttonGenerator":
          component = <ButtonGenerator {...buttonGeneratorProps} />;
          break;
        default:
          break;
      }

      if (component) {
        setUIComponent(component);
      }
    };

    loadUILibrary();
  }, [options.library]);

  return uiComponent;
};
