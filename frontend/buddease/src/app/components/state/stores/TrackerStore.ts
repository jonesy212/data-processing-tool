import { makeAutoObservable } from 'mobx';
import { Tracker } from '../../models/tracker/Tracker';
import { RootStores } from './RootStores';

export interface TrackerStore {
  trackers: Record<string, Tracker>;
  addTracker: (newTracker: Tracker) => void;
  getTracker: (id: string) => Tracker | undefined;
  getTrackers: (filter?: { id?: string; name?: string }) => Tracker[];
  removeTracker: (trackerToRemove: Tracker) => void;
  dispatch: (action: any) => void;
}

const useTrackerStore = (rootStore:  RootStores): TrackerStore => {
  const trackers: Record<string, Tracker> = {};

  const addTracker = (newTracker: Tracker) => {
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

  const removeTracker = (trackerToRemove: Tracker) => {
    delete trackers[trackerToRemove.id];
  };

  const dispatch = (action: any) => { 
    rootStore.trackerStore.dispatch(action);
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
