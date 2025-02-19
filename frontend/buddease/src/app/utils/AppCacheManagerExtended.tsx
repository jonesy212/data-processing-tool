import { NotificationType } from '../components/support/NotificationContext';
import AppCacheManagerBase, { ExtendedData } from './AppCacheManager';

class AppCacheManagerExtended extends AppCacheManagerBase<ExtendedData> {
  private notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;

  constructor(baseUrl: string, notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void) {
    super(baseUrl); // Call super constructor
    this.notify = notify;
  }

  // Implement the abstract method for ExtendedData
  async updateCache(key: string, data: ExtendedData): Promise<void> {
    try {
      // Simulating an asynchronous operation to update cache based on key and data
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          console.log(`Cache updated successfully for key: ${key}`);
          resolve();
        }, 2000); // Simulate a 2-second delay

        // Handle any errors that occur during the asynchronous operation
        reject(new Error('An error occurred during cache update.'));
      });

      // Notify success message using the notification messaging pattern
      const successMessageId = "UpdateCacheSuccess";
      const successMessage = "Cache updated successfully.";
      this.notify(
        successMessageId,
        successMessage,
        { key, data },
        new Date(),
        "Success" as NotificationType
      );
    } catch (error) {
      // Handle any errors that occur during cache update
      console.error('Error updating cache:', error);
      const errorMessageId = "UpdateCacheError";
      const errorMessage = "Error updating cache.";
      this.notify(
        errorMessageId,
        errorMessage,
        { key, error },
        new Date(),
        "Error" as NotificationType
      );
      throw error; // Rethrow the error to handle it accordingly
    }
  }

  // Implement the asynchronous operation for synchronizing cache from frontend
  async synchronizeCacheFromFrontend(updatedData: any): Promise<void> {
    try {
      // Simulating an asynchronous operation to synchronize cache from frontend
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          console.log('Cache synchronized from frontend successfully');

          // Notify success message using the notification messaging pattern
          const successMessageId = "SyncCacheFromFrontendSuccess";
          const successMessage = "Cache synchronized from frontend successfully.";
          this.notify(
            successMessageId,
            successMessage,
            null, // No additional data to include in the notification
            new Date(),
            "Success" as NotificationType
          );

          resolve();
        }, 2000); // Simulate a 2-second delay
      });
    } catch (error) {
      // Handle any errors that occur during cache synchronization
      console.error('Error synchronizing cache from frontend:', error);

      // Notify error message using the notification messaging pattern
      const errorMessageId = "SyncCacheFromFrontendError";
      const errorMessage = "Error synchronizing cache from frontend.";
      this.notify(
        errorMessageId,
        errorMessage,
        null, // No additional data to include in the notification
        new Date(),
        "Error" as NotificationType
      );

      throw error; // Rethrow the error to handle it accordingly
    }
  }

  // Add more methods specific to ExtendedData...

  // Example usage of synchronizeCacheFromFrontend with await
  async exampleUsage(updatedData: any): Promise<void> {
    try {
      // Call synchronizeCacheFromFrontend and await its completion
      await this.synchronizeCacheFromFrontend(updatedData);
      console.log('Synchronization completed successfully');
    } catch (error) {
      console.error('Error during synchronization:', error);
    }
  }
}

export default AppCacheManagerExtended;
