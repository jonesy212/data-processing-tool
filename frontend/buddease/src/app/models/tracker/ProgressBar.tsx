  import { AnimationLogger } from "@/app/libraries/logging/Logger";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { UIActions } from "@/app/actions/UIActions";
import useErrorHandling from "@/app/hooks/useErrorHandling";
import { NotificationType } from "@/context/NotificationContext";

export type ProgressBarAnimationType = "linear" | "ease-in-out" | "ease-out";

interface Progress {
    id: string;
    name:string,
    color:string,
    description: string,
    value: number;
    label: string;
    current: number,
    min: number,
    max: number,
    percentage: number
    done: boolean
    // additional properties as needed
  }

  // ProgressPhase enum to represent different phases of the project
  enum ProgressPhase {
    Ideation = "Ideation",
    TeamFormation = "Team Formation",
    ProductDevelopment = "Product Development",
    LaunchPreparation = "Launch Preparation",
    DataAnalysis = "Data Analysis",
    Draft = "Draft"
  }

  // Updated ProgressBarProps interface to include the phase property
  interface ProgressBarProps {
    progress: Progress | null; // Progress value between 0 and 100
    duration: number; // Animation duration prop
    barStyle?: React.CSSProperties; // Custom style for the progress bar
    containerStyle?: React.CSSProperties; // Custom style for the progress bar container
    animationClass?: string; // Animation class
    animationType?: string; // Animation type prop
    phase: {
      type: string,
      duration: number,
      value: number
    }
    phaseType: ProgressPhase; // Phase of the project
    color?: string; // color of the progress bar
    height?: string; // height of the progress bar
    borderRadius?: string; // border radius of the progress bar
    animationOn?: boolean; // toggle animation on or off
    animationID: string; // Unique ID for the animation
    uniqueID: string; // Unique ID for the progress bar instance
  }
  
  
  
export { ProgressPhase };
export type { Progress, ProgressBarProps };

