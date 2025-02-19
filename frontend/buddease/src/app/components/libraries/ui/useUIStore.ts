// useUIStore.ts
import { useStore } from 'react-redux';
import UIStore from '../../state/stores/UIStore';


const useUIStore = () => useStore<UIStore>();

export default useUIStore;
