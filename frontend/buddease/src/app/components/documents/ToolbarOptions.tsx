import React from 'react';

export interface ToolbarOptionsProps {
  isDocumentEditor?: boolean;
  isTextCard?: boolean;
  fontSize?: boolean; // Add this line to include fontSize property
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  link?: boolean;
  image?: boolean;
}

const ToolbarOptions: React.FC<ToolbarOptionsProps> = ({
  isDocumentEditor,
  isTextCard,
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

  if (isDocumentEditor) {
    options = {
      documentOptions: ["bold", "italic", "underline", "strike"],
      alignmentOptions: ["align", "center", "right"],
      colorOptions: ["color", "background"],
      listOptions: ["list", "bullet", "ordered"],
      headingOptions: ["header", "1", "2", "3", "4", "5", "6"],
      linkOptions: ["link", "image", "video"],
    };
  } else if (isTextCard) {
    options = {
      textCardOptions: ["align", "color", "italic"],
    };

    if (fontSize) {
      options = {
        ...options,
        fontSizeOptions: ["fontSize"], // Add fontSize options if specified
      };
    }
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

