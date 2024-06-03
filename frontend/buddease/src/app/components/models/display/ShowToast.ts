import { Message } from "@/app/generators/GenerateChatInterfaces";

async function showToast(message: Message | { content: string }): Promise<void> {
    // Create a new div element to hold the toast message
    const toast = document.createElement('div');
    toast.classList.add('toast');
    
  
    // Extract the content from the message object
    const content = 'content' in message ? message.content : message;
  
    // Assign the content to the toast's textContent
    toast.textContent = content;
  
   
    // Assign the content to the toast's textContent
    toast.textContent = content;

    // Append the toast element to the body of the document
    document.body.appendChild(toast);
  
    // Automatically remove the toast after a certain duration (e.g., 3 seconds)
    setTimeout(() => {
      toast.remove();
    }, 3000); // 3000 milliseconds = 3 seconds
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

