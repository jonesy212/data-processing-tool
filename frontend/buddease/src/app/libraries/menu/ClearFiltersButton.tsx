// ClearFiltersButton.tsx
import React from "react";
import { ButtonProps } from "@/app/libraries/ui/buttons/ReusableButton";

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
