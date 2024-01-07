// components/DynamicComponent.tsx
import React from "react";

interface ButtonProps {
  label: string;
}

interface CardProps {
  title: string;
  content: string;
}

interface DynamicComponentProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
}

const DynamicComponent: React.FC<
  DynamicComponentProps & (ButtonProps | CardProps)
> = (props: DynamicComponentProps & (ButtonProps | CardProps)) => {
  const { dynamicContent, ...rest } = props;

  return (
    <div>
      <h2>{dynamicContent ? "Dynamic" : "Static"} Component</h2>
      {dynamicContent ? renderDynamicContent(rest) : renderStaticContent()}
      {/* Add more dynamic/static content examples as needed */}
      {/* Usage with ButtonProps */}
      {/* New Components */}
      <DynamicComponent dynamicContent label="Click me" />
      {/* OR */}
      <DynamicComponent
        dynamicContent
        title="Card Title"
        content="Card Content"
      />
    </div>
  );
};

const renderStaticContent = () => {
  return (
    <div>
      <h3>Static Card</h3>
      <p>Static Card Content</p>
    </div>
  );
};

const renderDynamicContent = (props: ButtonProps | CardProps) => {
  if ("label" in props) {
    // Dynamic rendering of Button component
    return <button>{props.label}</button>;
  } else {
    // Dynamic rendering of Card component
    return (
      <div>
        <h3>{props.title}</h3>
        <p>{props.content}</p>
      </div>
    );
  }
};

export default DynamicComponent;
