  import { AnimationLogger } from "@/app/components/logging/Logger";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { UIActions } from "../../actions/UIActions";
import useErrorHandling from "../../hooks/useErrorHandling";
import { NotificationType } from "../../support/NotificationContext";

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

  // Updated ProgressBar component to utilize the ProgressPhase enum
  const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    barStyle,
    containerStyle,
    animationClass,
    animationType,
    duration,
    phase, // Include phase property
    uniqueID,
    animationID,
    color = "#4caf50", // Default color: green
    height = "20px", // Default height: 20px
    borderRadius = "0px", // Default border radius: 0px
    animationOn = true, // Default animation: on
  }) => {
    const { handleError } = useErrorHandling(); // Initialize useErrorHandling hook

    if (progress && (progress.value < 0 || progress.value > 100)) {
      // Handle out-of-range progress values
      const errorMessage = "Progress value must be between 0 and 100";
      handleError(errorMessage); // Log and handle the error
    }

    useEffect(() => {
      // Log animation start event when progress changes
      if (progress && uniqueID) {
        const animationID = AnimationLogger.generateID(
          "ProgressBar",
          uniqueID,
          "AnimationStart" as NotificationType
        );
        AnimationLogger.logAnimation(
          "Animation Start",
          animationID,
          uniqueID,
          duration
        );
      }
    }, [progress, animationID]);


     // Function to update the progress bar UI element
  const updateProgressBar = (percentage: number) => {
    // Log the progress update
    console.log("Updating progress bar with percentage:", percentage);
    // Set the progress using UIActions
    UIActions.setProgress(percentage);
  };
    

  useEffect(() => {
    // Call updateProgressBar when progress changes
    if (progress) {
      updateProgressBar(progress.value);
    }
  }, [progress]);


    return (
      <div style={containerStyle}>
        {/* Apply containerStyle to the outer div */}
        <div
          className={`progress-bar ${animationOn ? animationClass : ""}`} // Apply animation class if animation is on
          style={{
            width: `${progress}%`,
            height: height, // Apply height
            borderRadius: borderRadius, // Apply border radius
            backgroundColor: color, // Apply color
            border: "1px solid #ccc",
            transition: animationOn
              ? `${animationType} ${duration / 1000}s`
              : "none", // Apply animation transition if animation is on
            ...barStyle, // Apply additional custom styles for the progress bar
          }}
        >
          {/* FontAwesome Chevron icon */}
          <FontAwesomeIcon icon={faChevronRight} />
        </div>
        <svg width="100%" height="20" viewBox="0 0 100 20">
          <rect
            width={`${progress?.value}%`}
            height="20"
            fill="#4caf50" // Use the progress bar color
          >
            {/* Animate the progress bar width */}
            <animate
              attributeName="width"
              from="0"
              to={`${progress?.value}%`}
              dur={`${duration / 1000}s`}
              fill="freeze"
            />
          </rect>
        </svg>
        {progress && <p>{progress.label}</p>}
      </div>
    );
  };

  export default ProgressBar;
  export { ProgressPhase };
export type { Progress, ProgressBarProps };

