// ToggleSwitch.tsx

import React from "react";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange }) => {
  return (
    <div className="toggle-switch">
      <input
        type="checkbox"
        className="toggle-switch-checkbox"
        id={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="toggle-switch-label" htmlFor={label}>
        <span className="toggle-switch-inner"></span>
        <span className="toggle-switch-switch"></span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
export type { ToggleSwitchProps };
