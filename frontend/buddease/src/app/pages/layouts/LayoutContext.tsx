  // LayoutContext.tsx
import React, { createContext, useContext } from "react";

type LayoutContextProps = {
  effects: string[];
  backgroundColor: string;
  children: React.ReactNode;
  setLayout: (layout: Partial<LayoutContextProps>) => void;
  setDynamicEffect: (effect: string) => void;
  removeDynamicEffect: (effect: string) => void;
  setDynamicBackgroundColor: (color: string) => void;
};

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

export const LayoutProvider: React.FC<LayoutContextProps> = ({ children }) => {
  const [layout, setLayout] = React.useState<LayoutContextProps>({
    backgroundColor: "",
    effects: [],
    children: null,
    setLayout: () => {},
    setDynamicEffect: () => {},
    removeDynamicEffect: () => {},
    setDynamicBackgroundColor: () => {},
  });

  const updateLayout = (updatedLayout: Partial<LayoutContextProps>) => {
    setLayout((prevLayout) => ({
      ...prevLayout,
      ...updatedLayout,
    }));
  };

  const setDynamicEffect = (effect: string) => {
    updateLayout({ effects: [...layout.effects, effect] });
  };

  const removeDynamicEffect = (effect: string) => {
    updateLayout({ effects: layout.effects.filter((e) => e !== effect) });
  };

  const setDynamicBackgroundColor = (color: string) => {
    updateLayout({ backgroundColor: color });
  };

  return (
    <LayoutContext.Provider
      value={{
        ...layout,
        setDynamicEffect,
        removeDynamicEffect,
        setDynamicBackgroundColor,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
