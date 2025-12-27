// sendToAnalytics.tsx
import axiosInstance from '@/app/api/csrfToken';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import type { Snapshot } from '@/app/snapshots/Snapshot';

import { Attachment } from '@/app/documents/attachment/Attachment';

const sendToAnalytics = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(eventName: string, eventData: Record<string, any>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  try {
    // Example: Interacting with a third-party analytics platform (like Mixpanel)
    if (window.mixpanel) {
      window.mixpanel.track(eventName, eventData);
      console.log(`Analytics Event Sent: ${eventName}`, eventData);
    }

    // If a custom analytics service is in use
    const analyticsPayload = {
      event: eventName,
      data: eventData,
      timestamp: new Date().toISOString(),
    };

    // Send data to the backend analytics service
    axiosInstance.post('/analytics', analyticsPayload)
      .then((response) => {
        console.log("Analytics data successfully sent:", response.data);
      })
      .catch((error) => {
        console.error("Error sending analytics data:", error);
      });

  } catch (error) {
    console.error("Failed to send analytics event:", eventName, error);
  }
};
export { sendToAnalytics };
