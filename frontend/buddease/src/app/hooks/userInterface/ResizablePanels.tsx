// ResizablePanels.tsx
import React, { ReactNode, useEffect, useRef } from "react";
import { ResizableBox, ResizeCallbackData } from "react-resizable";
import "react-resizable/css/styles.css";

// Define the props interface for the ResizablePanels component
interface ResizablePanelsProps {
  sizes: (() => number[]) | number[]; // Updated type definition
  onResize: (newSizes: number[]) => void;
  onResizeStop: (newSizes: number[]) => void;
  children: ReactNode[];
  snap?: boolean;
  panelSizes?: number[];
  minPanelWidth?: number;
  maxPanelWidth?: number;
  
}

// Define the ResizablePanels component
const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  sizes,
  onResize,
  children,
  panelSizes,
  snap = true,
  minPanelWidth = 100,
  maxPanelWidth = Infinity,
}) => {
  // Define a ref to hold panel elements
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (
      children.length !== (typeof sizes === "function" ? sizes() : sizes).length
    ) {
      console.error(
        "Number of sizes provided does not match the number of children."
      );
    }
    // Initialize panel refs based on the number of children
    panelRefs.current = Array.from(
      { length: children.length },
      (_, index) => panelRefs.current[index] || null
    );
  }, [children.length, sizes]);

  // Define the handleResize function to update sizes when resizing
  const handleResizeCallback =
    (index: number) =>
    (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      const newSizes: number[] =
        typeof sizes === "function" ? sizes() : [...sizes];
      newSizes[index] = size.width;
      onResize(newSizes);
    };

  // Render static content
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

  // Render dynamic content based on props
  const renderDynamicContent = () => {
    return (
      <div style={{ display: "flex" }}>
        {React.Children.map(children, (child, index) => (
          <ResizableBox
            key={index}
            width={
              panelSizes
                ? panelSizes[index]
                : typeof sizes === "function"
                ? sizes()[index]
                : sizes[index]
            }
            height={Infinity}
            axis="x"
            minConstraints={[minPanelWidth, Infinity]}
            maxConstraints={[maxPanelWidth, Infinity]}
            onResize={(e, data) => handleResizeCallback(index)(e, data)} // Ensure onResize is always defined
            draggableOpts={snap ? { grid: [snap, 0] } : {}}
          >
            <div
              ref={(ref) => {
                if (ref) {
                  panelRefs.current[index] = ref;
                }
              }}
            >
              {/* You can conditionally render static or dynamic content here */}
              {renderStaticContent()}
              {child}
            </div>
          </ResizableBox>
        ))}
      </div>
    );
  };

  // Render the ResizablePanels component
  return <>{renderDynamicContent()}</>;
};

export default ResizablePanels;
export type { ResizablePanelsProps };
