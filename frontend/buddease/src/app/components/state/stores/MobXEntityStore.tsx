// MobXEntityStore.ts
import { makeAutoObservable } from 'mobx';
import { DocumentOptions } from '../../documents/DocumentOptions';

class MobXEntityStore {
globalState: DocumentOptions = { documentType: '', userIdea: '' }; // Set initial values


  constructor() {
    makeAutoObservable(this);
  }

  // Define methods to update global state
  updateGlobalState(key: keyof typeof this.globalState, value: any) {
    this.globalState = {
      ...this.globalState,
      [key]: value
    };
  }

  
  // Add more methods as needed
}

export default new MobXEntityStore();
