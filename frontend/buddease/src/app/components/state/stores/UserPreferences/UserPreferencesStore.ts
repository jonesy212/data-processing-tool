// src/app/state/stores/UserPreferences/UserPreferencesStore.ts

import { action, makeObservable, observable } from 'mobx';

class UserPreferencesStore {
  // Define your user preferences properties here
  @observable theme: string = 'light';

  constructor() {
    makeObservable(this);
  }

  // Define actions to modify user preferences
  @action setTheme(theme: string) {
    this.theme = theme;
  }
}

export default UserPreferencesStore;
