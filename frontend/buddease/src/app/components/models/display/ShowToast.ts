import { Message } from "@/app/generators/GenerateChatInterfaces";

export function showToast( message: Message) {
    // Create a new div element to hold the toast message
    const toast = document.createElement('div');
    toast.classList.add('toast');
    
    // Assign a specific property of the Message object to the toast's textContent
    toast.textContent = message.content;
  
    // Append the toast element to the body of the document
    document.body.appendChild(toast);
  
    // Automatically remove the toast after a certain duration (e.g., 3 seconds)
    setTimeout(() => {
      toast.remove();
    }, 3000); // 3000 milliseconds = 3 seconds
}



export function showErrorMessage(error: string): void {
  // Create a new div element to hold the error message
  const errorMessage = document.createElement('div');
  errorMessage.classList.add('error-message');
  
  // Assign the error message to the errorMessage's textContent
  errorMessage.textContent = error;

  // Append the errorMessage element to the body of the document
  document.body.appendChild(errorMessage);

  // Automatically remove the errorMessage after a certain duration (e.g., 5 seconds)
  setTimeout(() => {
    errorMessage.remove();
  }, 5000); // 5000 milliseconds = 5 seconds
}
