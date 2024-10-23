import useSettingManagerStore from "../state/stores/SettingsStore";
import { useDispatch } from "react-redux";
import { UserManagerState } from "../users/UserSlice";

// Redux implementation
const setUserDataRedux = (userData: UserManagerState) => {
  const dispatch = useDispatch();
  dispatch(setUser(userData));
};

// MobX implementation
const setUserDataMobX = (userData: UserManagerState) => {
  const settingStore = useSettingManagerStore();
  settingStore.setUserData(userData);
};
