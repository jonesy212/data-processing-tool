// ToolbarItem.tsx

import React, { useCallback, useState, useRef } from "react";

interface ToolbarItemProps {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
  type?: "button" | "menu" | "toggle" | "dropdown";
  badge?: string | number;
  shortcut?: string;
  ariaLabel?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "danger" | "ghost";
  dropdownItems?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  contextMenuItems?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;
  onContextMenu?: (event: React.MouseEvent) => void;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({
  id,
  label,
  onClick,
  disabled = false,
  active = false,
  icon,
  tooltip,
  className = "",
  type = "button",
  badge,
  shortcut,
  ariaLabel,
  size = "md",
  variant = "default",
  dropdownItems,
  contextMenuItems,
  onContextMenu
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (type === 'dropdown') {
        setIsDropdownOpen(!isDropdownOpen);
      } else {
        onClick();
      }
    } else if (event.key === 'Escape' && isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  }, [onClick, type, isDropdownOpen]);

  const handleClick = useCallback(() => {
    if (type === 'dropdown') {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      onClick();
    }
  }, [type, onClick, isDropdownOpen]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    if (contextMenuItems && contextMenuItems.length > 0) {
      onContextMenu?.(event);
    }
  }, [contextMenuItems, onContextMenu]);

  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-4 py-3 text-lg"
  };

  const variantClasses = {
    default: "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300",
    primary: active ? "bg-blue-600 text-white" : "bg-blue-500 text-white hover:bg-blue-600",
    danger: "bg-red-500 text-white hover:bg-red-600 border border-red-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 border border-transparent"
  };

  const baseClasses = "toolbar-item rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 relative";
  const stateClasses = disabled 
    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60" 
    : variantClasses[variant];

  return (
    <div className="toolbar-item-wrapper relative">
      <button
        ref={buttonRef}
        id={id}
        onClick={handleClick}
        onKeyPress={handleKeyPress}
        onContextMenu={handleContextMenu}
        disabled={disabled}
        title={tooltip}
        aria-label={ariaLabel || label}
        aria-haspopup={type === 'dropdown' ? 'menu' : undefined}
        aria-expanded={type === 'dropdown' ? isDropdownOpen : undefined}
        className={`${baseClasses} ${sizeClasses[size]} ${stateClasses} ${className} group`}
        data-type={type}
        role={type === "menu" ? "menuitem" : "button"}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="flex items-center gap-2 relative">
          {icon && <span className="toolbar-item-icon flex-shrink-0">{icon}</span>}
          <span className="toolbar-item-label whitespace-nowrap">{label}</span>
          
          {type === 'dropdown' && (
            <span className="dropdown-arrow ml-1 text-xs opacity-70">▼</span>
          )}
          
          {badge && (
            <span className="badge absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-5 h-5 flex items-center justify-center transform scale-90">
              {badge}
            </span>
          )}
          
          {shortcut && !disabled && (
            <span className="shortcut text-xs text-gray-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {shortcut}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && dropdownItems && dropdownItems.length > 0 && (
        <div className="dropdown-menu absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-48">
          {dropdownItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsDropdownOpen(false);
              }}
              disabled={item.disabled}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 first:rounded-t-md last:rounded-b-md"
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolbarItem;