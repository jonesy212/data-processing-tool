import ErrorHandler from "@/app/shared/ErrorHandler";
import { makeAutoObservable } from "mobx";
import { ErrorInfo } from "react";
import safeParseData from "../../crypto/SafeParseData";
import { ParsedData } from "../../crypto/parseData";
import { Theme } from "../../libraries/ui/theme/Theme";
import { FileLogger } from "../../logging/Logger";
import { UserProfile } from "../../snapshots/userSnapshotData";
import { YourResponseType } from "../../typings/types";
import { UIActions } from "../../actions/UIActions";


// Extend the Event interface to include the loaded property
interface CustomEvent extends Event {
  loaded?: number; //  Define the loaded property as optional
  total: number
}

class UIStore {
  displayToast: (message: string) => void;

  theme = {
    // Define initial theme properties
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
    // Add more theme properties as needed
  };

  darkModeEnabled = false;
  notificationMessage = "";
  sidebarOpen = false;
  isLoading = false;
  userProfile: UserProfile | null = null;

   // Error handling state and methods
   error: string | null = null;
  



  
// Method to calculate progress percentage based on event properties
calculateProgressPercentage(event: CustomEvent): number {
  // This function should return a number between 0 and 100 representing the progress percentage.

  // Check if the event has 'loaded' and 'total' properties
  if (event.loaded !== undefined && 'total' in event) {
    // Calculate progress percentage based on event properties
    const progress = (event.loaded / event.total) * 100;

    // Ensure progress percentage doesn't exceed 100%
    return Math.min(progress, 100);
  } else {
    // If the event doesn't have 'loaded' and 'total' properties, return 0
    return 0;
  }
}


  



// Function to update a progress bar UI element
 updateProgressBar(percentage: number) {
  // Update the progress bar UI element based on the calculated percentage
  console.log("Updating progress bar with percentage:", percentage);
  // Example React code to update a progress bar state
  // Assuming you have a state variable 'progress' and a setter function 'setProgress'
  UIActions.setProgress(percentage);
}

 
  constructor(
    displayToast: (message: string) => void
  ) {
     makeAutoObservable(this);
     this.displayToast = displayToast
   }
 
   // New UI-related state and methods
   activePage = ""; // Track the active page or route in the UI
 
   // Method to handle errors
  handleError(errorMessage: string, errorInfo?: ErrorInfo) {
    if (!errorMessage) {
      return;
    }
    this.error = errorMessage;
    // Log the error using the FileLogger
    FileLogger.logFileError(errorMessage);
    // Log the error using the ErrorHandler class
    if (errorInfo) {
      ErrorHandler.logError(new Error(errorMessage), errorInfo);
    }
    // Optionally, you can log the error or perform other actions here
  }
 
   // Method to clear errors
   clearError() {
     this.error = null;
   }
 
   // Function to safely parse data with error handling
   parseDataWithErrorHandling(data: YourResponseType[], threshold: number): ParsedData<object>[] {
     try {
       // Call safeParseData function
       return safeParseData(data, threshold);
     } catch (error: any) {
       // Handle error if safeParseData throws an exception
       const errorMessage = 'Error parsing data';
       this.handleError(errorMessage, { componentStack: error.stack });
       return [];
     }
   }

  setActivePage(page: string) {
    this.activePage = page;
  }

  // Method to show/hide modals
  modalOpen = false;
  showModal() {
    this.modalOpen = true;
  }
  hideModal() {
    this.modalOpen = false;
  }



  activeModal: string = '';
  displayAudioOptionsModal(callback: (selectedOptions: any) => void) {
    this.modalOpen = true;
    this.activeModal = 'audioOptions';

    // Assume some logic here to display the modal/menu and capture user selection
    // After user selection, call the callback with the selected options
    const selectedOptions = {/* Logic to get selected options */};
    callback(selectedOptions);
  }
  // Method to handle user authentication state
  isAuthenticated = false;
  login() {
    // Logic to authenticate user
    this.isAuthenticated = true;
  }
  logout() {
    // Logic to log out user
    this.isAuthenticated = false;
  }

  // Method to handle user preferences
  userPreferences = {
    // Define user preferences here
  };

  setUserPreference(key: string, value: any) {
    this.userPreferences = { ...this.userPreferences, [key]: value };
  }


  setTheme(theme: Theme) {
    this.theme = theme;
  }

  enableDarkMode() {
    this.darkModeEnabled = true;
  }

  disableDarkMode() {
    this.darkModeEnabled = false;
  }

  toggleDarkMode() {
    this.darkModeEnabled = !this.darkModeEnabled;
  }

  setNotificationMessage(message: string) {
    this.notificationMessage = message;
  }

  openSidebar() {
    this.sidebarOpen = true;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  setUserProfile(profile: UserProfile) {
    this.userProfile = profile;
  }

  setError(errorMessage: string) {
    this.handleError(errorMessage);
  }

  clearUserProfile() {
    this.userProfile = null;
  }

  // Add more UI-related methods as needed
}

export const uiStore = new UIStore(displayToast);

export default UIStore
function displayToast(message) {
  // Create a new toast element
  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = message;

  // Append the toast element to the document body
  document.body.appendChild(toast);

  // Automatically remove the toast after a certain duration
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000); // Remove the toast after 3 seconds (adjust the duration as needed)
}
