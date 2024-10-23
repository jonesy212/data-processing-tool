// components/DynamicComponent.tsx
import React from "react";

interface ButtonProps {
  label: string;
}

interface CardProps {
  title: string;
  content: string;
}

interface EntityProps {
  id: string;
  name: string;
  type: string;
  // Add more properties as needed
}

interface DynamicComponentProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
  entity?: EntityProps; // Add EntityProps as a prop
}

const DynamicComponent: React.FC<
  DynamicComponentProps & (ButtonProps | CardProps)
> = (props: DynamicComponentProps & (ButtonProps | CardProps)) => {
  const { dynamicContent, entity, ...rest } = props;

  return (
    <div>
      <h2>{dynamicContent ? "Dynamic" : "Static"} Component</h2>
      {dynamicContent ? renderDynamicContent(rest) : renderStaticContent()}
      {/* Add more dynamic/static content examples as needed */}
      {/* Usage with ButtonProps */}
      {/* New Components */}
      {entity ? (
        <DynamicComponent
          dynamicContent
          entity={entity}
          title={entity.name}
          content={entity.type}
        />
      ) : (
        <></>
      )}

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

const renderDynamicContent = (props: ButtonProps | CardProps | EntityProps) => {
  if ("label" in props) {
    // Dynamic rendering of Button component
    return <button>{props.label}</button>;
  } else if ("title" in props && "content" in props) {
    // Dynamic rendering of Card component
    return (
      <div>
        <h3>{props.title}</h3>
        <p>{props.content}</p>
      </div>
    );
  } else {
    // Dynamic rendering of Entity component
    return (
      <div>
        <h3>{props.name}</h3>
        <p>ID: {props.id}</p>
        <p>Type: {props.type}</p>
      </div>
    );
  }
};

export default DynamicComponent;
