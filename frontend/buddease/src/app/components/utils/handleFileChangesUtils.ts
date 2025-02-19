import { ChangeEvent } from "react";
import CustomFile from "../documents/File";
import { FileActions } from "../actions/FileActions";


const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    FileActions.setInputValue(newValue);
  };
  
export const handleFileChanges = (event: ChangeEvent<HTMLInputElement>) => {
  const selectedFile = event.target.files?.[0];
  if (selectedFile) {
    FileActions.setSelectedFile([selectedFile as unknown as CustomFile]);
    // Call handleInputChange to update inputValue
    handleInputChange(event);
  }
};



export const handleButtonClick = (event: MouseEvent) => {
    // Check if the event target is a button
    const target = event.target as HTMLButtonElement;
    if (target.tagName.toLowerCase() === 'button') {
      // Access the button properties if needed
      const buttonId = target.id;
      
      // Perform actions based on the button click event
      switch (buttonId) {
        case 'submitButton':
          // Logic for handling submission button click
          console.log("Submit button clicked");
          break;
        case 'cancelButton':
          // Logic for handling cancel button click
          console.log("Cancel button clicked");
          break;
        default:
          // Handle other button clicks if necessary
          console.log(`Button with id ${buttonId} clicked`);
          break;
      }
    } else {
      console.warn("Click event triggered, but the target is not a button.");
    }
  }
  