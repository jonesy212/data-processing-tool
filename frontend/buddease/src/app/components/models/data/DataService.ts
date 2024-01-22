// DataService.ts
import { action, observable, runInAction } from 'mobx';
import DATA_NOTIFICATIONS from '../../support/DataNotifications';
import { NotificationContextProps } from '../../support/NotificationContext';
import { NOTIFICATION_TYPES } from '../../support/NotificationTypes';

class DataService {
  @observable notification: NotificationContextProps | null = null;
  @observable dataAnalysis = null;
  @observable loading = false;
  @observable error = null;

  @action
  fetchData = async () => {
    try {
      this.loading = true;

      // Perform data fetching logic
      const response = await fetch("/api/dataAnalysis");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      const dataAnalysis = await response.json();

      runInAction(() => {
        if (this.notification) {
          this.notification.notify(
            NOTIFICATION_TYPES.ERROR,
            DATA_NOTIFICATIONS.DataError.FETCH_ERROR,
            new Date(),
            NOTIFICATION_TYPES.ERROR
          );
        }
        this.dataAnalysis = dataAnalysis;
        this.error = null; // Clear any previous errors on success
      });
    } catch (error) {
      runInAction(() => {
        if (this.notification) {
          this.notification.notify(
            NOTIFICATION_TYPES.ERROR,
            DATA_NOTIFICATIONS.DataError.FETCH_ERROR,
            new Date(),
            NOTIFICATION_TYPES.ERROR
          );
        }
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  @action
  resetData = () => {
    this.dataAnalysis = null;
    this.loading = false;
    this.error = null;
  };
  // Additional actions can be added here...

}

const dataService = new DataService();

export default dataService;
