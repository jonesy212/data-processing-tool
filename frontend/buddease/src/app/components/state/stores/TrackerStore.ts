import { makeAutoObservable } from "mobx";
import { RootStore } from "./RootStores";

export class TrackerStore {
  trackers: Tracker[] = [];
  rootStore: RootStore = new RootStore();

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  
  addTracker(newTracker: Tracker) {
    this.trackers.push(newTracker);
  }
}

export default TrackerStore;
