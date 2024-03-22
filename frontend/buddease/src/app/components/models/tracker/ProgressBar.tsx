import { AnimationLogger } from "@/app/pages/logging/Logger";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import useErrorHandling from "../../hooks/useErrorHandling";
import { NotificationType } from "../../support/NotificationContext";

// Import the SVG file -- exampe import of a s

interface Progress {
  value: number;
  label: string;
  // additional properties as needed
}

interface ProgressBarProps {
  progress: Progress | null; // Progress value between 0 and 100
  duration: number; // Animation duration prop
  barStyle?: React.CSSProperties; // Custom style for the progress bar
  containerStyle?: React.CSSProperties; // Custom style for the progress bar container
  animationClass?: string; // Animation class
  animationType?: string; // Animation type prop

  color?: string; // color of the progress bar
  height?: string; // height of the progress bar
  borderRadius?: string; // border radius of the progress bar
  animationOn?: boolean; // toggle animation on or off
  animationID: string; // Unique ID for the animation
  uniqueID: string; // Unique ID for the progress bar instance
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  barStyle,
  containerStyle,
  animationClass,
  animationType,
  duration,
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
  return (
    <div style={containerStyle}>
      {" "}
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
        {/*  example if not using fontawesome */}
        {/* SVG setup */}
        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          width="24"
          height="24"
        >
          <path
            fill="#000000"
            d="M19.207 12.707L13.457 18.457C13.2695 18.6445 13.0312 18.75 12.7812 18.75C12.5312 18.75 12.293 18.6445 12.1055 18.457L8.793 15.1445C8.40234 14.7539 8.40234 14.1211 8.793 13.7305L12.1055 10.418C12.4883 10.0273 13.1211 10.0273 13.5117 10.418C13.9023 10.8086 13.9023 11.4414 13.5117 11.832L10.3398 15H16.25C16.6641 15 17 15.3359 17 15.75C17 16.1641 16.6641 16.5 16.25 16.5H7.75C7.33594 16.5 7 16.1641 7 15.75C7 15.3359 7.33594 15 7.75 15H10.8789L7.707 11.8281C7.31641 11.4375 7.31641 10.8047 7.707 10.4141C8.09766 10.0234 8.73047 10.0234 9.12109 10.4141L12.75 14.042L17.207 9.58594C17.5977 9.19531 18.2305 9.19531 18.6211 9.58594C19.0117 9.97656 19.0117 10.6094 18.6211 11L13.457 16.1641C13.2695 16.3516 13.0312 16.457 12.7812 16.457C12.5312 16.457 12.293 16.3516 12.1055 16.1641L6.70703 10.7656C6.31641 10.375 6.31641 9.74219 6.70703 7.70703 9.35156C7.70703 9.74219 8.33984 10.375 8.73047 10.7656L13.457 15.4922C13.8438 15.8789 14.4766 15.8828 14.8672 15.4922L19.207 11.1523C19.5938 10.7656 19.5938 10.1328 19.207 9.74219Z"
          />
        </svg> 


        */}

        {/* Use the imported SVG uncomment and update conent to use format  */}
        {/* <img src={ChevronSVG} alt="Chevron" style={{ width: "50px", height: "auto" }} /> */}

        {/* Replace this with FontAwesome Chevron icon */}
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
export type { Progress, ProgressBarProps };
