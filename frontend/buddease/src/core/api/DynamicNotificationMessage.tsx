// DynamicNotificationMessage.tsx
// Define the type for dynamic notification message
type DynamicNotificationMessage = string | ((errorType: string, details: string) => string);

// Example usage:
const dynamicMessage: DynamicNotificationMessage = "This is a static message";

// Function that takes a dynamic message
const handleMessage = (message: DynamicNotificationMessage, errorType: string, details: string): string => {
  if (typeof message === 'string') {
    return message;
  } else {
    return message(errorType, details);
  }
};

// Example usage:
const errorType = "ErrorType";
const details = "ErrorDetails";

const staticMessage = handleMessage("Static error message", errorType, details);
console.log(staticMessage); // Output: Static error message

const dynamicFunctionMessage = handleMessage((errorType, details) => `Dynamic message: ${errorType}, ${details}`, errorType, details);
console.log(dynamicFunctionMessage); // Output: Dynamic message: ErrorType, ErrorDetails
