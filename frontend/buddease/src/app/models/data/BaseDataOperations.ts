// BaseDataOperations
import { fetchApiData } from '@/app/api/ApiData';
import { BaseData } from '@/app/models/data/Data';
import { Snapshot } from '@/app/snapshots/Snapshot';
import {
  addData as addDataAction,
  fetchDataFailure,
  fetchDataRequest,
  fetchDataSuccess,
  removeData as removeDataAction,
  updateDataDetails as updateDataDetailsAction
} from '@/app/state/redux/slices/DataSlices'; // Adjust based on your project structure
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { useDispatch } from 'react-redux';

interface BaseDataOperations<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T> {
  fetchData(): Promise<void>; // Fetch data doesn't need parameters
  addData(newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void; // New method signature for adding data
  updateData(id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void; // Match the DataStore update signature
  removeData(id: number): void; // Match the DataStore remove signature
}

  
class BaseDataManager<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T> implements BaseDataOperations<T> {
  private dispatch = useDispatch();

  async fetchData(): Promise<void> {
    this.dispatch(fetchDataRequest());

    try {
      const data: T[] = await this.fetchDataFromApi(); // Implement this method to fetch data from your API
      this.dispatch(fetchDataSuccess({ data }));
    } catch (error: any) {
      this.dispatch(fetchDataFailure({ error: error.message }));
    }
  }

  addData(newData: Snapshot<T>): void {
    this.dispatch(addDataAction(newData)); // Ensure you have the correct action for adding
  }

  updateData(id: number, newData: Snapshot<T>): void {
    this.dispatch(updateDataDetailsAction({ dataId: id.toString(), updatedDetails: newData }));
  }

  removeData(id: number): void {
    this.dispatch(removeDataAction(id.toString())); // Assuming your IDs are strings in your state management
  }


  private async fetchDataFromApi(): Promise<T[]> {
    try {
      const data = await fetchApiData<T>('YOUR_API_ENDPOINT'); // Use the imported fetchApiData
      return data;
    } catch (error) {
      console.error('Error fetching data from API:', error);
      throw error; // or return [];
    }
  }
}


export type { BaseDataManager, BaseDataOperations };
