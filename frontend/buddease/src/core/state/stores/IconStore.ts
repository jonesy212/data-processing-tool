// IconStore.ts
import { BaseStoreWithCallbacks } from '@/core/libraries/eventSystem/BaseStoreWithCallbacks';
import { makeAutoObservable } from 'mobx';

export interface IconStore {
  dispatch: (action: any) => void;
  loadIcons: () => Promise<void>;
  getIcon: (name: string) => string | undefined;
  clearIcons: () => void;
  addIcon: (name: string, icon: string) => void;
}

export class IconStoreImpl extends BaseStoreWithCallbacks implements IconStore {
  icons: Map<string, string> = new Map();
  isLoading: boolean = false;

  constructor() {
    super('iconStore');
    
    // Register event handlers
    this.registerCallback('ICONS_LOADED', this.handleIconsLoaded.bind(this));
    this.registerCallback('LOAD_ICONS', this.handleLoadIcons.bind(this));
    this.registerCallback('GET_ICON', this.handleGetIcon.bind(this));
    
    makeAutoObservable(this, {
      handleIconsLoaded: false,
      handleLoadIcons: false,
      handleGetIcon: false,
    });
  }

  private handleIconsLoaded(payload: any) {
    console.log('Icons loaded in iconStore:', payload);
    // Handle icons loaded event
  }

  private handleLoadIcons(payload: any) {
    this.loadIcons();
  }

  private handleGetIcon(payload: { name: string }) {
    return this.getIcon(payload.name);
  }

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
      this.callback({ 
        type: 'ICONS_LOADED', 
        payload: { icons: Array.from(this.icons.keys()) } 
      });
      
    } catch (error) {
      console.error('Error loading icons:', error);
      this.callback({ 
        type: 'ICONS_LOAD_ERROR', 
        payload: { error } 
      });
    } finally {
      this.isLoading = false;
    }
  }

  getIcon(name: string): string | undefined {
    return this.icons.get(name);
  }

  clearIcons(): void {
    this.icons.clear();
  }

  addIcon(name: string, icon: string): void {
    this.icons.set(name, icon);
  }

  // Override the callback method to add store-specific logic
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
}

// Create and export singleton instance
export const iconStore = new IconStoreImpl();
export default iconStore;