import { UserProfile } from './../../snapshots/userSnapshotData';

import { handleApiError } from '@/app/api/ApiLogs';
import ErrorHandler from '@/app/shared/ErrorHandler';
import { action, makeObservable, observable } from 'mobx';
import { ErrorInfo } from 'react';
import { UIActions } from '../../actions/UIActions';
import safeParseData from '../../crypto/SafeParseData';
import { ParsedData } from '../../crypto/parseData';
import { Theme } from '../../libraries/ui/theme/Theme';
import { FileLogger } from '../../logging/Logger';
import { displayToast } from '../../models/display/ShowToast';
import axiosInstance from '../../security/csrfToken';
import { YourResponseType } from '../../typings/types';
import { createMessage } from '../../utils/createMessage';

class UIStore {
  @observable theme = {
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
  };

  @observable darkModeEnabled = false;
  @observable notificationMessage = "";
  @observable sidebarOpen = false;
  @observable isLoading = false;
  @observable userProfile: UserProfile | null = null;
  @observable error: string | null = null;
  @observable activePage = "";
  @observable modalOpen = false;
  @observable activeModal = '';
  @observable isAuthenticated = false;
  @observable userPreferences = {};
  displayToast: (message: string) => void;

  
  constructor(displayToast: (message: string) => void) {
    makeObservable(this);
    this.displayToast = displayToast;
  }

  @action
  setTheme(theme: Theme) {
    this.theme = theme;
  }

  @action
  enableDarkMode() {
    this.darkModeEnabled = true;
  }

  @action
  disableDarkMode() {
    this.darkModeEnabled = false;
  }

  @action
  toggleDarkMode() {
    this.darkModeEnabled = !this.darkModeEnabled;
  }

  @action
  setNotificationMessage(message: string) {
    this.notificationMessage = message;
  }

  @action
  openSidebar() {
    this.sidebarOpen = true;
  }

  @action
  closeSidebar() {
    this.sidebarOpen = false;
  }

  @action
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  @action
  setLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  @action
  setUserProfile(profile: UserProfile) {
    this.userProfile = profile;
  }

  @action
  clearUserProfile() {
    this.userProfile = null;
  }

  @action
  setActivePage(page: string) {
    this.activePage = page;
  }

  @action
  showModal() {
    this.modalOpen = true;
  }

  @action
  hideModal() {
    this.modalOpen = false;
  }

  @action
  displayAudioOptionsModal(callback: (selectedOptions: any) => void) {
    this.modalOpen = true;
    this.activeModal = 'audioOptions';
    const selectedOptions = {}; // Logic to get selected options
    callback(selectedOptions);
  }

  @action
  login() {
    this.isAuthenticated = true;
  }

  @action
  logout() {
    this.isAuthenticated = false;
  }

  @action
  setUserPreference(key: string, value: any) {
    this.userPreferences = { ...this.userPreferences, [key]: value };
  }

  @action
  handleError(errorMessage: string, errorInfo?: ErrorInfo) {
    if (!errorMessage) {
      return;
    }
    this.error = errorMessage;
    FileLogger.logFileError(errorMessage);
    if (errorInfo) {
      ErrorHandler.logError(new Error(errorMessage), errorInfo);
    }
  }

  @action
  setError(errorMessage: string) {
    this.error = errorMessage;
    const message = createMessage("error", errorMessage);
    this.setNotificationMessage(message.text);
  }


  @action
  clearError() {
    this.error = null;
  }

  parseDataWithErrorHandling(data: YourResponseType[], threshold: number): ParsedData<object>[] {
    try {
      return safeParseData(data, threshold);
    } catch (error: any) {
      const errorMessage = 'Error parsing data';
      this.handleError(errorMessage, { componentStack: error.stack });
      return [];
    }
  }

  calculateProgressPercentage(
    event: CustomEvent<{ loaded: number; total: number }>
  ): number {
    if (event.detail.loaded !== undefined && "total" in event.detail) {
      const progress = (event.detail.loaded / event.detail.total) * 100;
      return Math.min(progress, 100);
    } else {
      return 0;
    }
  }

  updateProgressBar(percentage: number) {
    console.log("Updating progress bar with percentage:", percentage);
    UIActions.setProgress(percentage);
  }

  @action
  async fetchData(endpoint: string) {
    this.setLoading(true);
    this.clearError();

    try {
      const response = await axiosInstance.get(endpoint);
      this.setLoading(false);
      const message = createMessage("success", "Data fetched successfully.");
      this.setNotificationMessage(message.text);
      // Assuming response.data is the required data
      return response.data;
    } catch (error) {
      this.setLoading(false);
      handleApiError(error as any, "Failed to fetch data");
      this.setError("Failed to fetch data");
    }
  }

}

export const uiStore = new UIStore(displayToast);

export default UIStore;