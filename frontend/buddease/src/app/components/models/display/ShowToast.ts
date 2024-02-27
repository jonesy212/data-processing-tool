import { Message } from "@/app/generators/GenerateChatInterfaces";

export function showToast(message: Message) {
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