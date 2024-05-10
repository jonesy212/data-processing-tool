// SharedDocumentProps.ts
import { DocumentBuilderConfig } from "@/app/configs/DocumentBuilderConfig";
import { Dispatch, SetStateAction } from "react";
import { ProjectPhaseTypeEnum } from "../models/data/StatusType";
import AppVersionImpl from "../versions/AppVersion";
import { DocumentData } from "./DocumentBuilder";
import { DocumentOptions } from "./DocumentOptions";



// SharedDocumentProps.ts

export interface DocumentBuilderProps {
  isDynamic: boolean;
  documentPhase: {
    phaseType: ProjectPhaseTypeEnum;
    onChange: (phase: ProjectPhaseTypeEnum) => void;
    customProp1: string,
    customProp2: number,
  }
  version: AppVersionImpl | undefined;
  onOptionsChange: (newOptions: DocumentOptions) => void;
  onConfigChange: (newConfig: DocumentBuilderConfig) => void;
  setOptions: Dispatch<SetStateAction<DocumentOptions>>; // Use Dispatch and SetStateAction
  documents: DocumentData[]; // Add documents prop to receive document data
  options: DocumentOptions;
}

export interface DocumentAnimationOptions {
  type: 'slide' | 'fade' | 'show' |  'custom' | "none"// Add more animation types as needed
  duration: number;
  speed?: number;
  transition?: 'ease-in-out' | 'ease-in' | 'ease-out' | 'linear' | 'none'
  // Add more animation-related properties
}
