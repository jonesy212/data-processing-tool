// DataService.ts


import axios from 'axios';
import { action, observable, runInAction } from 'mobx';
import { useAuth } from '../../auth/AuthContext';
import DATA_NOTIFICATIONS from '../../support/DataNotifications';
import { NotificationContextProps } from '../../support/NotificationContext';
import { NOTIFICATION_TYPES } from '../../support/NotificationTypes';
import { Data } from './Data';

class DataService {
  @observable notification: NotificationContextProps | null = null;
  @observable dataAnalysis: Data[] | null = null;
  @observable loading = false;
  @observable error: string | null = null;

 @action
fetchData = async () => {
  try {
    this.loading = true;

    const authStore = useAuth();
    const response = await axios.get('/api/data', { headers: { Authorization: `Bearer ${authStore.token}` } });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const dataAnalysis = await response.data;

    runInAction(() => {
      if (this.notification) {
        this.notification.notify(
          NOTIFICATION_TYPES.OPERATION_SUCCESS,
          DATA_NOTIFICATIONS.DataOperationSuccess.FETCH_SUCCESS,
          new Date(),
          NOTIFICATION_TYPES.OPERATION_SUCCESS
        );
      }
      this.dataAnalysis = dataAnalysis;
      this.error = null; // Clear any previous errors on success
    });
  } catch (error: any) {
    runInAction(() => {
        if (this.notification) {
          this.notification.notify(
            NOTIFICATION_TYPES.ERROR,
            DATA_NOTIFICATIONS.DataError.FETCH_ERROR,
            new Date(),
            NOTIFICATION_TYPES.ERROR
          );
        }
        this.error = error.message || 'Error fetching data'; // Set error message
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
