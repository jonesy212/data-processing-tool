// useUIStore.ts
import { useStore } from 'react-redux';
import UIStore from '@/app/components/state/stores/UIStore';


const useUIStore = () => useStore<UIStore>();

export default useUIStore;
