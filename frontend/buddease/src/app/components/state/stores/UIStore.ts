import ErrorHandler from "@/app/shared/ErrorHandler";
import { makeAutoObservable } from "mobx";
import { ErrorInfo } from "react";
import safeParseData from "../../crypto/SafeParseData";
import { ParsedData } from "../../crypto/parseData";
import { Theme } from "../../libraries/ui/theme/Theme";
import { FileLogger } from "../../logging/Logger";
import { UserProfile } from "../../snapshots/userSnapshotData";
import { YourResponseType } from "../../typings/types";

class UIStore {
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
  
   constructor() {
     makeAutoObservable(this);
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
   parseDataWithErrorHandling(data: YourResponseType[], threshold: number): ParsedData[] {
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

export const uiStore = new UIStore();

export default UIStore
