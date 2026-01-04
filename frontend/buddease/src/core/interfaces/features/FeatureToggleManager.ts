FeatureToggleManager.ts
import axiosInstance from '@/core/api/csrfToken';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import focusManagerInstance from "@/core/models/accessibility/FocusManager";
import { useNotification } from "@/core/state/context/NotificationContext";
import { makeAutoObservable } from "mobx";

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

    notify({
      id: `toggleFeature${feature.replace(/\s+/g, '')}${isEnabled ? 'Enable' : 'Disable'}Success`,
      message: notificationMessage,
      data: {
        extra: {
          feature,
          isEnabled,
          operation: isEnabled ? "Enable feature" : "Disable feature"
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success'
    });

    // Use FocusManager to manage focusable elements
    const focusManager = focusManagerInstance;
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
    notify({
      id: "fetchFeatureTogglesSuccess",
      message: NOTIFICATION_MESSAGES.FeatureToggle.FEATURE_IMPORT_SUCCESS,
      data: {
        extra: {
          operation: "Fetch feature toggles",
          count: featureToggles.length
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success'
    });
  }

  fetchFeatureTogglesFailure(error: string): void {
    console.error("Error fetching feature toggles:", error);
    notify({
      id: "fetchFeatureTogglesError",
      message: NOTIFICATION_MESSAGES.FeatureToggle.FEATURE_IMPORT_FAILURE,
      data: {
        originalError: error,
        extra: {
          errorMessage: "Error fetching feature toggles",
          operation: "Fetch feature toggles"
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error'
    });
  }
}

const useFeatureToggleStore = (): FeatureToggleStore => {
  return new FeatureToggleStoreClass();
};

export default useFeatureToggleStore;
