import { Message } from "@/app/generators/GenerateChatInterfaces";
import { toast } from 'react-toastify';

async function showToast(
  message: Message | { content: string },
  duration: number = 3000,
  type: 'success' | 'error' = 'success'
): Promise<void> {
  // Show toast notification with react-toastify
  if (type === 'success') {
    toast.success('content' in message ? message.content : message, {
      position: 'top-right',
      autoClose: duration,
    });
  } else if (type === 'error') {
    toast.error('content' in message ? message.content : message, {
      position: 'top-right',
      autoClose: duration,
    });
  }
}



async function showErrorMessage(error: string): Promise<void> {
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


async function displayToast(message: string): Promise<void> {
  // Create a new div element to hold the toast message
  const toast = document.createElement('div');
  toast.classList.add('toast');
  
  // Assign the content to the toast's textContent
  toast.textContent = message;

  // Append the toast element to the body of the document
  document.body.appendChild(toast);

  // Automatically remove the toast after a certain duration (e.g., 3 seconds)
  setTimeout(() => {
    toast.remove();
  }, 3000); // 3000 milliseconds = 3 seconds
}


export { displayToast, showErrorMessage, showToast };

