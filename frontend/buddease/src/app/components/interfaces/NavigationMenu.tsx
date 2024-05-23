// NavigationMenu.tsx
import React from "react";

interface NavigationMenuProps {
  onSelect: (view: string) => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ onSelect }) => {
  return (
    <div className="navigation-menu">
      <button onClick={() => onSelect("projectManagement")}>Project Management</button>
      <button onClick={() => onSelect("socialMedia")}>Social Media</button>
    </div>
  );
};

export default NavigationMenu;
