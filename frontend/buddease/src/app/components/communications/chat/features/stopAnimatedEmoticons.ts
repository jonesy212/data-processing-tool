import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { AnimationLogger, FileLogger } from "@/app/components/logging/Logger";
import { useNotification } from "@/app/components/support/NotificationContext";
const { handleError } = useErrorHandling(); // Integrate error handling

/**
 * Stops the animated emoticons.
 */
const stopAnimatedEmoticons = () => {
  const { handleError } = useErrorHandling(); // Accessing the handleError function from the useErrorHandling hook
  const notificationContext = useNotification();

  try {
    if (notificationContext) {
      notificationContext.showSuccessNotification(
        Date.now().toString(),
        "Animated emoticons stopped successfully.",
        "success"
      );
    } else {
      console.error("Notification context is not available.");
      // Log an error using the error handling function if the notification context is not available
      handleError("Notification context is not available.");
    }
    // Log the animation event using the AnimationLogger
    AnimationLogger.logAnimationStopped(
      "animatedEmoticonsStoppedId",
      "Animated emoticons stopped successfully.",
      Date.now()
    );
    // Select all the animated emoticons on the page
    const animatedEmoticons = document.querySelectorAll(".animated-emoticon");

    // Check if there are any animated emoticons found
    if (animatedEmoticons.length === 0) {
      // Log a message to indicate that no animated emoticons were found
      handleError("No animated emoticons found.");
      console.log("No animated emoticons found.");
      return; // Exit the function early if no animated emoticons are found
    }

    // Loop through each animated emoticon and stop the animation
    animatedEmoticons.forEach((emoticon) => {
      stopAnimation(emoticon);
    });

    // Log a message to indicate that the animations have been stopped
    console.log("Animated emoticons stopped successfully.");
    // Log the animation event using the AnimationLogger
    AnimationLogger.logAnimationStopped(
      "animatedEmoticonsStoppedId",
      "Animated emoticons stopped successfully.",
      Date.now()
    );

    showAnimationStoppedMessage(); // Display a message to the user
  } catch (error: any) {
    // Handle any potential errors gracefully
    console.error("Error while stopping animated emoticons:", error.message);
    // Log the error to the file using the FileLogger
    FileLogger.logFileError(
      "Error while stopping animated emoticons: " + error.message
    );
    handleError("Error while stopping animated emoticons: " + error.message);
    showErrorMessage(); // Display an error message to the user
  }
};

/**
 * Stops the animation for a specific emoticon.
 * @param emoticon The HTML element representing the emoticon.
 */

const stopAnimation = (emoticon: Element) => {
  try {
    // Check if the emoticon is null
    if (emoticon === null) {
      // Log a message to indicate that the emoticon is null
      handleError("Emoticon is null.");
      console.log("Emoticon is null.");
      return; // Exit the function early if the emoticon is null
    }
    // Check if the emoticon is undefined
    if (emoticon === undefined) {
      // Log a message to indicate that the emoticon is undefined
      handleError("Emoticon is undefined.");
      console.log("Emoticon is undefined.");
      return; // Exit the function early if the emoticon is undefined
    }
    // Check if the emoticon is a valid HTML element
    if (!(emoticon instanceof HTMLElement)) {
      // Log a message to indicate that the emoticon is not a valid HTML element
      handleError("Emoticon is not a valid HTML element.");
      console.log("Emoticon is not a valid HTML element.");
      return; // Exit the function early if the emoticon is not a valid HTML element
    }

    // Check if the emoticon has an animation class
    if (emoticon.classList.contains("animate")) {
      // Log a message to indicate that the emoticon has an animation class
      console.log("Emoticon has an animation class.");

      // Remove the animation class to stop the animation
      emoticon.classList.remove("animate");
    }
  } catch (error: any) {
    // Handle any potential errors gracefully
    console.error(
      "Error while stopping animation for emoticon:",
      error.message
    );
  }
};

/**
 * Displays a message to the user indicating that the animation has been stopped.
 */
const showAnimationStoppedMessage = () => {
  const { handleError } = useErrorHandling(); // Accessing the handleError function from the useErrorHandling hook
  const notificationContext = useNotification();

  try {
    if (notificationContext) {
      notificationContext.showSuccessNotification(
        Date.now().toString(),
        "Animated emoticons stopped successfully.",
        "success"
      );
    } else {
      // Log an error using the error handling function if the notification context is not available
      console.error("Notification context is not available.");
      // Log an error using the error handling function if the notification context is not available
      handleError("Notification context is not available.");
    }
  } catch (error: any) {
    console.error(
      "Error while displaying animation stopped message:",
      error.message
    );
    // Log the error using the error handling function
    handleError(
      "Error while displaying animation stopped message: " + error.message
    );
  }

  // Log the animation event using the AnimationLogger
  try {
    AnimationLogger.logAnimationStopped(
      "animatedEmoticonsStoppedId",
      "Animated emoticons stopped successfully.",
      Date.now()
    );
  } catch (error: any) {
    console.error("Error logging animation stopped event:", error);
    // Log the error using the error handling function
    handleError("Error logging animation stopped event: " + error.message);
  }
};

/**
 * Displays an error message to the user in case of an error.
 */
const showErrorMessage = () => {
  const { handleError } = useErrorHandling(); // Accessing the handleError function from the useErrorHandling hook
  try {
    const notificationContext = useNotification();

    // Check if the notification context exists
    if (notificationContext) {
      // Send an error notification indicating that an error occurred
      notificationContext.showErrorNotification(
        Date.now().toString(),
        "An error occurred while stopping animated emoticons. Please try again later.",
        "error"
      );
    } else {
      // If the notification context is not available, log an error
      console.error("Notification context is not available.");
      // Log an error using the error handling function
      handleError("Notification context is not available.");
    }
  } catch (error: any) {
    // Handle any potential errors gracefully
    console.error("Error while displaying error message:", error.message);
    // Log the error using the error handling function
    handleError("Error while displaying error message: " + error.message);
  }
};
export default stopAnimatedEmoticons;
