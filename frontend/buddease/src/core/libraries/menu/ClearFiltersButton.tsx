ClearFiltersButton.tsx
import { ButtonProps } from "@/core/libraries/ui/buttons/ReusableButton";
import React from "react";

interface ClearFiltersButtonProps extends ButtonProps {
  onClick: () => void;
}

const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      Clear Filters
    </button>
  );
};

export default ClearFiltersButton;
