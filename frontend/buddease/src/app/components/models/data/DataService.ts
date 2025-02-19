// DataService.ts
import { action, observable, runInAction } from 'mobx';
import { useAuth } from '../../auth/AuthContext';
import axiosInstance from '../../security/csrfToken';
import DATA_NOTIFICATIONS from '../../support/DataNotifications';
import { NotificationContextProps, NotificationTypeEnum } from '../../support/NotificationContext';
import { Data } from './Data';
import { YourResponseType } from '../../typings/types';

class DataService {
  @observable notification: NotificationContextProps | null = null;
  @observable dataAnalysis: YourResponseType[] | null = null;
  @observable loading = false;
  @observable error: string | null = null;

  @action
fetchData = async (): Promise<void> => {
  try {
    this.loading = true;

    const authStore = useAuth();
    const response = await axiosInstance.get<YourResponseType[]>('/api/data', { headers: { Authorization: `Bearer ${authStore.token}` } });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const dataAnalysis = await response.data;

    runInAction(() => {
      if (this.notification) {
        this.notification.notify(
          "fetchDataSuccess",
          "Data fetched successfully",
          DATA_NOTIFICATIONS.DataOperationSuccess.FETCH_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      }
      this.dataAnalysis = dataAnalysis;
      this.error = null; // Clear any previous errors on success
    });
  } catch (error: any) {
    runInAction(() => {
        if (this.notification) {
          this.notification.notify(
            "fetchDataFailure",
            "Failed to fetch data",
            DATA_NOTIFICATIONS.DataError.FETCH_ERROR,
            new Date(),
            NotificationTypeEnum.Error
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
