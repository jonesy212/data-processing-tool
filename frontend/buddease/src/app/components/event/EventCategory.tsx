import React from "react";

// EventCategory.ts
interface EventCategoryProps {
  category: string;
  icon?: string;
  color?: string;
  onClick?: (category: string) => void;
}

const EventCategory: React.FC<EventCategoryProps>  = ({
  category,
  icon,
  color,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(category);
    }
  };

  return (
    <div>
      <div
        className="event-category"
        style={{ cursor: onClick ? "pointer" : "default" }}
        onClick={handleClick}
      >
        <div className="category-icon" style={{ color }}>
          {icon && <i className={icon}></i>}
        </div>
        <div className="category-info">
          <h3>Event Category: {category}</h3>
        </div>
      </div>
    </div>
  );
};

export default EventCategory;
