// ToolbarItem.tsx
import React from "react";

interface ToolbarItemProps {
  id: string;
  label: string;
  onClick: () => void;
}


const ToolbarItem: React.FC<ToolbarItemProps> = ({ id, label, onClick }) => {
  return (
    <button id={id} onClick={onClick}>
      {label}
    </button>
  );
};

export default ToolbarItem;
