import React from 'react';

export interface ToolbarOptionsProps {
  isDocumentEditor?: boolean;
  isTextCard?: boolean;
  fontSize?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  link?: boolean;
  image?: boolean;
  audio?: boolean
}

const ToolbarOptions: React.FC<ToolbarOptionsProps> = ({
  isDocumentEditor,
  isTextCard,
  audio,
  fontSize,
  bold,
  italic,
  underline,
  strike,
  code,
  link,
  image,
}) => {
  interface Options {
    [key: string]: string[];
  }

  let options: Options = {};

  const addOptions = (property: string, propertyOptions: string[]) => {
    if (property) {
      options = {
        ...options,
        [`${property}Options`]: propertyOptions,
      };
    }
  };

  if (isDocumentEditor) {
    options = {
      documentOptions: ["bold", "italic", "underline", "strike"],
      alignmentOptions: ["align", "center", "right"],
      colorOptions: ["color", "background"],
      listOptions: ["list", "bullet", "ordered"],
      headingOptions: ["header", "1", "2", "3", "4", "5", "6"],
      linkOptions: ["link", "image", "video", "audio"],
    };
  } else if (isTextCard) {
    options = {
      textCardOptions: ["align", "color", "italic"],

    };

    addOptions("fontSize", ["fontSize"]);
    addOptions("bold", ["bold"]);
    addOptions("italic", ["italic"]);
    addOptions("underline", ["underline"]);
    addOptions("strike", ["strike"]);
    addOptions("code", ["code"]);
    addOptions("link", ["link"]);
    addOptions("image", ["image"]);
    // Add more properties/options as needed
  }

  return (
    <div>
      <ul>
        {Object.keys(options).map((key) => (
          <li key={key}>
            {key}: {JSON.stringify(options[key])}
          </li>
        ))}
      </ul>
    </div>
  );
};

export { ToolbarOptions };
