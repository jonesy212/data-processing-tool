// ResizablePanels.tsx
import React, { ReactNode, useEffect, useRef } from "react";
import { ResizableBox, ResizeCallbackData } from "react-resizable";
import "react-resizable/css/styles.css";
import { DynamicContentProps } from "../../cards/DummyCardLoader";

interface ResizablePanelsProps {
  sizes: () => number[];
  onResize: (newSizes: number[]) => void;
  children: ReactNode[];
}

interface ResizablePanelsProps {
  sizes: () => number[];
  onResize: (newSizes: number[]) => void;
  children: ReactNode[];
}

const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  sizes,
  onResize,
  children,
}) => {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Initialize panel refs based on the number of children
    panelRefs.current = Array.from(
      { length: children.length },
      (_, index) => panelRefs.current[index] || null
    );
  }, [children.length]);

  const handleResize =
    (index: number) =>
    (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      const newSizes: number[] = sizes();
      newSizes[index] = size.width;
      onResize(newSizes);
    };

  const renderStaticContent = () => {
    return (
      <div>
        <h3>Static Typography Example</h3>
        <p style={{ fontSize: "16px", fontFamily: "Arial, sans-serif" }}>
          Static Body Text
        </p>
      </div>
    );
  };

  const renderDynamicContent = (props: DynamicContentProps) => {
    if ("fontSize" in props && "fontFamily" in props) {
      // Dynamic rendering based on the type of props
      if ("fontSize" in props) {
        // Dynamic rendering of BodyText component
        return (
          <p
            style={{
              fontSize: props.fontSize as string,
              fontFamily: props.fontFamily as string,
            }}
          >
            Dynamic Body Text
          </p>
        );
      } else {
        // Dynamic rendering of Heading component
        return (
          <div style={{ display: "flex" }}>
            {React.Children.map(children, (child, index) => (
              <ResizableBox
                key={index}
                width={sizes()[index]}
                height={Infinity}
                axis="x"
                onResize={handleResize(index)}
              >
                <div ref={(ref) => (panelRefs.current[index] = ref)}>
                  {/* You can conditionally render static or dynamic content here */}
                  {renderStaticContent()}
                  {renderDynamicContent({
                    fontSize: "16px",
                    fontFamily: "Arial, sans-serif",
                  })}
                  {child}
                </div>
              </ResizableBox>
            ))}
          </div>
        );
      }
    }

    // Handle the case where neither "fontSize" nor "fontFamily" is present
    return null;
  };

  return <>{renderDynamicContent({} as DynamicContentProps)}</>;
};







export default ResizablePanels;
