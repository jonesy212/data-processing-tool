import { UserManagerState } from "@/core/state/redux/slices/UserSlice";
import useSettingManagerStore from "@/core/state/stores/SettingsStore";
import { useDispatch } from "react-redux";

// Redux implementation
const setUserDataRedux = (userData: UserManagerState) => {
  const dispatch = useDispatch();
  dispatch(setUser(userData));
};

// MobX implementation
const setUserDataMobX = (userData: UserManagerState) => {
  const settingsStore = useSettingManagerStore();
  settingsStore.setUserData(userData);
};
