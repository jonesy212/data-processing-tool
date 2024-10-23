import { makeAutoObservable } from 'mobx';
import { TrackerProps } from '../../models/tracker/Tracker';
import { RootStores } from './RootStores';

export interface TrackerStore {
  trackers: Record<string, TrackerProps>;
  addTracker: (newTracker: TrackerProps) => void;
  getTracker: (id: string) => TrackerProps | undefined;
  getTrackers: (filter?: { id?: string; name?: string }) => TrackerProps[];
  removeTracker: (trackerToRemove: TrackerProps) => void;
  dispatch: (action: any) => void;
}

const useTrackerStore = (rootStore:  RootStores): TrackerStore => {
  const trackers: Record<string, TrackerProps> = {};

  const addTracker = (newTracker: TrackerProps) => {
    if(newTracker.id === undefined){
      throw new Error("Tracker ID is required");
    }
    trackers[newTracker.id] = newTracker;
  };

  const getTracker = (id: string) => trackers[id];

  const getTrackers = (filter: { id?: string; name?: string } = {}) => {
    return Object.values(trackers).filter((tracker) => {
      if (filter.id && tracker.id !== filter.id) return false;
      if (filter.name && tracker.name !== filter.name) return false;
      return true;
    });
  };

  const removeTracker = (trackerToRemove: TrackerProps) => {
    if(trackerToRemove.id === undefined){
      throw new Error("Tracker ID is required");
    }
    delete trackers[trackerToRemove.id];
  };

  const dispatch = (action: any) => { 
    rootStore.trackerManager.dispatch(action);
  }


  const useTrackerStore =
  makeAutoObservable({
    dispatch,
    trackers,
    addTracker,
    getTracker,
    getTrackers,
    removeTracker,
  });

  return useTrackerStore
};

export default useTrackerStore;
