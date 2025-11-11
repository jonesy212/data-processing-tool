import { makeAutoObservable } from 'mobx';
import { RootStores } from '@/state/stores/RootStores';
import { useAppDispatch } from '@/app/state/stores/useAppDispatch';
import generateStoreKey from '@/app/states/stores/StoreKeyGenerator';
import { useEffect } from 'react';

export interface IconStore {
  dispatch: (action: any) => void;
}


const useIconStore = (rootStore?: RootStores): IconStore => {
  const store = new (class IconStoreImpl extends BaseStoreWithCallbacks implements IconStore {
    icons: Map<string, string> = new Map();
    isLoading: boolean = false;

    constructor() {
      super('iconStore');
      
      // Register event handlers
      this.registerCallback('ICONS_LOADED', this.handleIconsLoaded.bind(this));
      this.registerCallback('LOAD_ICONS', this.handleLoadIcons.bind(this));
      this.registerCallback('GET_ICON', this.handleGetIcon.bind(this));
      
      makeAutoObservable(this);
    }

    @action
    private handleIconsLoaded(payload: any) {
      console.log('Icons loaded in iconStore:', payload);
      // Handle icons loaded event
    }

    @action
    private handleLoadIcons(payload: any) {
      this.loadIcons();
    }

    @action
    private handleGetIcon(payload: { name: string }) {
      return this.getIcon(payload.name);
    }

    @action
    async loadIcons(): Promise<void> {
      if (this.isLoading) return;
      
      this.isLoading = true;
      try {
        // Simulate icon loading
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Load some example icons
        this.icons.set('home', '🏠');
        this.icons.set('user', '👤');
        this.icons.set('settings', '⚙️');
        
        // Dispatch event that icons are loaded
        this.callback({ type: 'ICONS_LOADED', payload: { icons: Array.from(this.icons.keys()) } });
        
      } catch (error) {
        console.error('Error loading icons:', error);
        this.callback({ type: 'ICONS_LOAD_ERROR', payload: { error } });
      } finally {
        this.isLoading = false;
      }
    }

    @action
    getIcon(name: string): string | undefined {
      return this.icons.get(name);
    }

    // Override the callback method to add store-specific logic
    @action
    public callback(action: any): void {
      console.log(`IconStore processing action: ${action.type}`);
      
      // Handle store-specific actions first
      switch (action.type) {
        case 'CLEAR_ICONS':
          this.icons.clear();
          break;
        case 'ADD_ICON':
          if (action.payload?.name && action.payload?.icon) {
            this.icons.set(action.payload.name, action.payload.icon);
          }
          break;
        default:
          // Let the base class handle other actions
          super.callback(action);
      }
    }
  })();

  return store;
};

export default useIconStore;