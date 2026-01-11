UserPreferencesStore.ts
src/core/state/stores/UserPreferences/UserPreferencesStore.ts

import themeSettings from '@/core/config/endpoints/themeConfig';
import { action, makeObservable, observable } from 'mobx';

class UserPreferencesStore {
  // Define your user preferences properties here
  @observable theme: string = themeSettings.primaryColor || 'light';

  constructor() {
    makeObservable(this);
  }

  // Define actions to modify user preferences
  @action setTheme(theme: string) {
    this.theme = theme;
  }
}

export default UserPreferencesStore;
