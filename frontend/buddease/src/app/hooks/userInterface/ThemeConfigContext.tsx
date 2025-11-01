// ThemeConfigContext.tsx
import { ThemeConfig } from "@/app/libraries/ui/theme/ThemeConfig";
import { DappProps } from "@/app/utils/web3/dAppAdapter/DAppAdapterConfig";
import YourClass from "@/app/utils/YourClass";
import React, { createContext, useContext, useState } from "react";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

interface ThemeConfigProps {
  fontSize: string;
  fontColor: string
  fontFamily?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  setPrimaryColor?: React.Dispatch<React.SetStateAction<string>>;
  setThemeConfig?: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  setSecondaryColor?: React.Dispatch<React.SetStateAction<string>>;
  setFontSize?: React.Dispatch<React.SetStateAction<string>>;
  setFontFamily?: React.Dispatch<React.SetStateAction<string>>;
  setFontColor?: React.Dispatch<React.SetStateAction<string>>; // Add setter for fontColor

  children?: React.ReactNode;
  themeConfig: ThemeConfig;
  applyThemeConfig?: (themeConfig: ThemeConfig) => void;
  
  // Add more theme-related options as needed
}

const ThemeConfigContext = createContext<ThemeConfigProps | undefined>(
  undefined
);


export const ThemeConfigProvider = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDarkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#3498db");
  const [secondaryColor, setSecondaryColor] = useState("#e74c3c");
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [fontColor, setFontColor] = useState("#000");
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(
    {} as ThemeConfig | (() => ThemeConfig)
  );

  const yourClassInstance = new YourClass();

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const applyThemeConfig = (config: ThemeConfig) => {
    setThemeConfig(config);

    // Fully generic-safe DappProps
    yourClassInstance.customizeTheme(
      config,
      {} as DappProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    );
  };

  const backgroundColor = isDarkMode ? "#1a1a1a" : "#fff";

  return (
    <ThemeConfigContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        primaryColor,
        setPrimaryColor,
        secondaryColor,
        setSecondaryColor,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        fontColor,
        setFontColor,
        themeConfig,
        setThemeConfig,
        applyThemeConfig,
        backgroundColor,
        children,
      }}
    >
      {children}
    </ThemeConfigContext.Provider>
  );
};

export const useThemeConfig = (): ThemeConfigProps => {
  const context = useContext(ThemeConfigContext);
  if (!context) {
    throw new Error("useThemeConfig must be used within a ThemeConfigProvider");
  }
  return context;
};

export type { ThemeConfigProps };
