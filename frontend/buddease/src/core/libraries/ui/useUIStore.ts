// useUIStore.ts
import { useStore } from '@/core/hooks/useStore';
import UIStore from '@/core/state/stores/UIStore';


const useUIStore = () => useStore<UIStore>();

export default useUIStore;
