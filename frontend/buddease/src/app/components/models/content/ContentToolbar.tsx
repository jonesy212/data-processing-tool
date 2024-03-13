// ContentToolbar.tsx
import React, { useState } from "react";
import ToolbarItem from "../../documents/ToolbarItem";

interface ContentToolbarProps {
    // Callbacks for text formatting options
    onBoldClick: () => void;
    onItalicClick: () => void;
    onUnderlineClick: () => void;
    onStrikeThroughClick: () => void; // New: Callback for strike-through option
    onHighlightClick: () => void; // New: Callback for highlighting text
  
    // Callbacks for alignment options
    onAlignLeftClick: () => void; // New: Callback for left alignment
    onAlignCenterClick: () => void; // New: Callback for center alignment
    onAlignRightClick: () => void; // New: Callback for right alignment
    onJustifyClick: () => void; // New: Callback for justify alignment
  
    // Callbacks for list options
    onBulletListClick: () => void; // New: Callback for bullet list
    onNumberedListClick: () => void; // New: Callback for numbered list
  
    // Callbacks for indentation options
    onIndentClick: () => void; // New: Callback for increasing indentation
    onOutdentClick: () => void; // New: Callback for decreasing indentation
  
    // Callbacks for text style options
    onFontColorChange: (color: string) => void; // New: Callback for changing font color
    onHighlightColorChange: (color: string) => void; // New: Callback for changing highlight color
    onFontSizeChange: (fontSize: number) => void; // New: Callback for changing font size
    onFontFamilyChange: (fontFamily: string) => void; // New: Callback for changing font family
  
    // Callbacks for inserting media options
    onImageInsert: () => void; // New: Callback for inserting images
    onLinkInsert: () => void; // New: Callback for inserting links
  
    // Callbacks for undo/redo options
    onUndoClick: () => void; // New: Callback for undo action
    onRedoClick: () => void; // New: Callback for redo action
  
    // Add more callbacks for other formatting options as needed
  }
  

const ContentToolbar: React.FC<ContentToolbarProps> = ({
  onBoldClick,
  onItalicClick,
  onUnderlineClick,
  // Add more callbacks for other formatting options as needed
}) => {
  return (
    <div className="content-toolbar">
      <h2>Content Toolbar</h2>
      <ul>
        <li>
          <ToolbarItem id="bold" label="Bold" onClick={onBoldClick} />
        </li>
        <li>
          <ToolbarItem id="italic" label="Italic" onClick={onItalicClick} />
        </li>
        <li>
          <ToolbarItem id="underline" label="Underline" onClick={onUnderlineClick} />
        </li>
        {/* Add more toolbar items for other formatting options */}
      </ul>
    </div>
  );
};

export default ContentToolbar;
