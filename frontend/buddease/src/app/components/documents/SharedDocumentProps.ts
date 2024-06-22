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
  documentPhase:
    | string
    | {
        name?: string;
        originalPath?: string;
        alternatePaths?: string[];
        fileType?: string;
        title?: string;
        description?: string;
        keywords?: string[];
        authors?: string[];
        contributors?: string[];
        publisher?: string;
        copyright?: string;
        license?: string;
        links?: string[];
        tags?: string[];
        phaseType: ProjectPhaseTypeEnum;
        customProp1: string;
        customProp2: number;
        onChange: (phase: ProjectPhaseTypeEnum) => void;
      };
  version: AppVersionImpl | undefined;
  onOptionsChange: (newOptions: DocumentOptions) => void;
  onConfigChange: (newConfig: DocumentBuilderConfig) => void;
  setOptions: Dispatch<SetStateAction<DocumentOptions>>; // Use Dispatch and SetStateAction
  documents: DocumentData[]; // Add documents prop to receive document data
  options: DocumentOptions;
  buildDocument: (documentData: DocumentData) => void;
  buildDocuments?: DocumentData[];
}

export interface DocumentAnimationOptions {
  type: "slide" | "fade" | "show" | "custom" | "none"; // Add more animation types as needed
  duration: number;
  speed?: number;
  transition?: "ease-in-out" | "ease-in" | "ease-out" | "linear" | "none";
  // Add more animation-related properties
}
