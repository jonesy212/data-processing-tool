// DropdownMenu.tsx
import React, { useState } from "react";

interface MenuItem {
  label: string;
  onClick: () => void;
}

interface DropdownMenuProps {
  items: MenuItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (onClick: () => void) => {
    onClick();
    toggleMenu(); // Close the menu after clicking an item
  };

  return (
    <div className="dropdown-menu">
      <button className="dropdown-button" onClick={toggleMenu}>
        Menu
      </button>
      {isOpen && (
        <ul className="menu-list">
          {items.map((item, index) => (
            <li key={index} className="menu-item">
              <button onClick={() => handleItemClick(item.onClick)}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;
