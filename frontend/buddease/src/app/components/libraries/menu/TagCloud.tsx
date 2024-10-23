import React from "react";

const TagCloud = ({ tags, onSelectTag }) => {
  return (
    <div className="tag-cloud">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="tag-cloud-item"
          onClick={() => onSelectTag(tag)}
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export default TagCloud;
