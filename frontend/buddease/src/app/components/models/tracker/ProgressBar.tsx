// ProgressBar.tsx
  import { UIActions } from "@/app/actions/UIActions";
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import useErrorHandling from "@/app/hooks/useErrorHandling";
import { AnimationLogger } from "@/app/logging/Logger";
import {
  ProgressBarProps
} from '@/app/models/tracker/ProgressBar';
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";

export type ProgressBarAnimationType = "linear" | "ease-in-out" | "ease-out";

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
