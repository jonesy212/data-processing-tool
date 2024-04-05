// components/DynamicTypography.tsx
import React from "react";
import DummyCardLoader, { ContentItem } from "../cards/DummyCardLoader";

interface BodyTextProps {
  fontSize?: string;
  fontFamily: string;
  children: React.ReactNode;

}

export interface HeadingProps {
  fontSize: string;
  fontFamily: string;
  dynamicFont: string;
}

interface DynamicTypographyProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
  dynamicFont: "Aria, sans-serif";
  dynamicColor: "#000000";
  children?: React.ReactNode;
  variant?: "body1" | "body2" | "caption" | "button" | "h5"
  items?: { type: 'file' | 'folder'; name: string; content: ContentItem }[]; // Include items prop for DummyCardLoader
}

const DynamicTypography: React.FC<
  DynamicTypographyProps & (BodyTextProps | HeadingProps)
> = (props) => {
  const { dynamicContent, dynamicFont, dynamicColor, children, items, ...rest } =
    props;

  return (
    <div>
      <h2>{dynamicContent ? "Dynamic" : "Static"} Typography</h2>
      {/* Utilizing renderDynamicContent for both dynamic and static content */}
      {renderDynamicContent({
        dynamicContent,
        dynamicFont,
        dynamicColor,
        children,
        ...rest,
      })}
      {/* Additional dynamic/static content examples */}
      <p>Additional Example: {dynamicContent ? "Dynamic" : "Static"} Content</p>
      {dynamicContent ? (
        <p
          style={{
            fontSize: dynamicFont,
            fontFamily: dynamicFont,
            color: dynamicColor,
          }}
        >
          Another Dynamic Body Text Example
        </p>
      ) : (
        <div>
          <h3>Another Static Typography Example</h3>
          <p style={{ fontSize: "14px", fontFamily: "Times New Roman, serif" }}>
            Another Static Body Text Example
          </p>
        </div>
      )}
      {/* Add more dynamic/static content examples as needed */}
      {children}
      {/* Include children here */}
      <DummyCardLoader items={items || []} /> {/* Render DummyCardLoader with items */}
    </div>
  );
};

const renderDynamicContent = ({
  dynamicContent,
  dynamicFont,
  dynamicColor,
  ...rest
}: DynamicTypographyProps & (BodyTextProps | HeadingProps)) => {
  if (dynamicContent) {
    // Dynamic rendering
    if ("fontSize" in rest && "fontFamily" in rest) {
      return (
        <p
          style={{
            fontSize: dynamicFont,
            fontFamily: dynamicFont,
            color: dynamicColor,
          }}
        >
          Dynamic Body Text
        </p>
      );
    } else {
      return (
        <h3
          style={{
            fontSize: dynamicFont,
            fontFamily: dynamicFont,
            color: dynamicColor,
          }}
        >
          Dynamic Heading
        </h3>
      );
    }
  } else {
    // Static rendering
    return (
      <div>
        <h3>Static Typography Example</h3>
        <p style={{ fontSize: "16px", fontFamily: "Arial, sans-serif" }}>
          Static Body Text
        </p>
        {/* Add more static content examples as needed */}
      </div>
    );
  }
};

export default DynamicTypography;
export type { BodyTextProps, DynamicTypographyProps };
