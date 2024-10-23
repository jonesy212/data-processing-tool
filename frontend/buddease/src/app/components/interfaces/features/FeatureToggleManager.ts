import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import { makeAutoObservable } from "mobx";
import focusManagerInstance from "../../models/accessibility/FocusManager";
import axiosInstance from "../../security/csrfToken";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
const { notify } = useNotification();
export interface FeatureToggle {
  feature: string;
  isEnabled: boolean;
}

export interface FeatureToggleStore {
  featureToggles: FeatureToggle[];
  toggleFeature: (feature: string, isEnabled: boolean) => void;
  enableFeature: (feature: string) => void;
  disableFeature: (feature: string) => void;
  fetchFeatureToggles: () => void;
  fetchFeatureTogglesSuccess: (featureToggles: FeatureToggle[]) => void;
  fetchFeatureTogglesFailure: (error: string) => void;
}

class FeatureToggleStoreClass implements FeatureToggleStore {
  featureToggles: FeatureToggle[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  toggleFeature(feature: string, isEnabled: boolean): void {
    const updatedFeatureToggles = this.featureToggles.map((toggle) =>
      toggle.feature === feature ? { ...toggle, isEnabled } : toggle
    );
    this.featureToggles = updatedFeatureToggles;

    // Notify success or failure based on the toggle action
    const notificationMessage = isEnabled
      ? NOTIFICATION_MESSAGES.FeatureToggle.ENABLE_SUCCESS
      : NOTIFICATION_MESSAGES.FeatureToggle.DISABLE_SUCCESS;

    notify(
      "Feature toggled: " + feature,
      "Admin login successful",
      NOTIFICATION_MESSAGES.Login.LOGIN_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );

    // Use FocusManager to manage focusable elements
    const focusManager = focusManagerInstance
    // Assuming you have some focusable elements, you can add or remove them as needed
    // For example:
    const elementToFocus = document.getElementById("elementId");
    if (elementToFocus) {
      if (isEnabled) {
        focusManager.addFocusableElement(elementToFocus);
      } else {
        focusManager.removeFocusableElement(elementToFocus);
      }
    }
  }

  enableFeature(feature: string): void {
    this.toggleFeature(feature, true);
  }

  disableFeature(feature: string): void {
    this.toggleFeature(feature, false);
  }

  fetchFeatureToggles(): void {
    console.log("Fetching Feature Toggles...");

    // Make the API request to fetch feature toggles
    axiosInstance
      .get("/api/feature-toggles")
      .then((response) => {
        // Handle successful response
        this.fetchFeatureTogglesSuccess(response.data);
      })
      .catch((error) => {
        // Handle error response
        this.fetchFeatureTogglesFailure(error.message);
      });
  }

  fetchFeatureTogglesSuccess(featureToggles: FeatureToggle[]): void {
    this.featureToggles = featureToggles;
    notify(
      "Features imported",
      "Success importing features",
      NOTIFICATION_MESSAGES.FeatureToggle.FEATURE_IMPORT_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
  }

  fetchFeatureTogglesFailure(error: string): void {
    console.error("Error fetching feature toggles:", error);
    notify(
      "Error importing features",
      "Error import feature",
      NOTIFICATION_MESSAGES.FeatureToggle.FEATURE_IMPORT_FAILURE,
      new Date(),
      NotificationTypeEnum.OperationError
    );
  }
}

const useFeatureToggleStore = (): FeatureToggleStore => {
  return new FeatureToggleStoreClass();
};

export default useFeatureToggleStore;
