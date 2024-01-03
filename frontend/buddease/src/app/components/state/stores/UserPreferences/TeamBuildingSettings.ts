// src/app/state/stores/UserPreferences/UserPreferencesStore.ts

import { action, makeObservable, observable } from 'mobx';

class TeamBuildingSettings {
  @observable enableTeamBuilding: boolean = true;
  // Add more properties as needed for team building settings

  constructor() {
    makeObservable(this);
  }
}

class UserPreferencesStore {
  // ... other properties

  @observable collaborationPreferences: {
    teamBuilding: TeamBuildingSettings;
    // Add more collaboration preferences as needed
    
    } = {
    teamBuilding: new TeamBuildingSettings(),
      // Initialize other collaboration preferences
      
  };

  // ... other methods

  // Define actions to modify collaboration preferences
  @action setTeamBuildingSettings(settings: Partial<TeamBuildingSettings>) {
    this.collaborationPreferences.teamBuilding = {
      ...this.collaborationPreferences.teamBuilding,
      ...settings,
    };
  }
}

export default UserPreferencesStore;
