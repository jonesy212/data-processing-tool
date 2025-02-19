import React from "react";
interface CheckBoxProps{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

const Checkbox: React.FC<CheckBoxProps> = ({ label, checked, onChange, className, style }) => {
  return (
    <label className={`checkbox-container ${className}`} style={style}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="checkmark"></span>
      {label}
    </label>
  );
};

export default Checkbox;
