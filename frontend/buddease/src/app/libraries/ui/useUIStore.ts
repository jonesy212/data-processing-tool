// useUIStore.ts
import { useStore } from '@/app/hooks/useStore';
import UIStore from '@/app/state/stores/UIStore';


const useUIStore = () => useStore<UIStore>();

export default useUIStore;
